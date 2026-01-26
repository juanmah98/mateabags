/* // =====================================================
// EDGE FUNCTION: create-checkout-session
// =====================================================
// Crear en: Supabase Dashboard > Edge Functions
// Nombre: create-checkout-session
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Interfaces
interface CustomerData {
    name?: string
    email: string
    phone?: string
}

interface AddressData {
    kind?: string
    label?: string
    recipient_name?: string
    line1: string
    line2?: string
    city: string
    state?: string
    postcode: string
    country?: string
}

interface OrderItemData {
    product_id: string
    title: string
    sku?: string
    quantity: number
    unit_price: number
    total_price: number
    is_gift?: boolean
    gift_message?: string
}

interface CheckoutPayload {
    customer: CustomerData
    address: AddressData
    items: OrderItemData[]
    coupon_code?: string
    shipping_cost: number
    currency?: string
    note?: string
    success_url: string
    cancel_url: string
}

// CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // ==========================================
        // 1. INICIALIZACIÓN
        // ==========================================

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!

        if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
            throw new Error('Missing environment variables')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // ==========================================
        // 2. PARSEAR Y VALIDAR PAYLOAD
        // ==========================================

        const payload: CheckoutPayload = await req.json()

        // Validaciones básicas
        if (!payload.customer?.email) {
            throw new Error('Email del cliente requerido')
        }
        if (!payload.address?.line1 || !payload.address?.city || !payload.address?.postcode) {
            throw new Error('Dirección incompleta')
        }
        if (!payload.items || payload.items.length === 0) {
            throw new Error('Carrito vacío')
        }
        if (!payload.success_url || !payload.cancel_url) {
            throw new Error('URLs de retorno requeridas')
        }

        const currency = payload.currency || 'EUR'
        const shippingCost = payload.shipping_cost || 0

        // ==========================================
        // 3. CREAR/OBTENER CUSTOMER
        // ==========================================

        let customerId: string
        let stripeCustomerId: string | null = null

        // Buscar si ya existe el customer por email
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id, stripe_customer_id')
            .eq('email', payload.customer.email)
            .single()

        if (existingCustomer) {
            customerId = existingCustomer.id
            stripeCustomerId = existingCustomer.stripe_customer_id
        } else {
            // Crear nuevo customer
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert({
                    name: payload.customer.name,
                    email: payload.customer.email,
                    phone: payload.customer.phone,
                })
                .select()
                .single()

            if (customerError) throw customerError
            customerId = newCustomer.id
        }

        // ==========================================
        // 4. CREAR/ACTUALIZAR STRIPE CUSTOMER
        // ==========================================

        if (!stripeCustomerId) {
            const stripeCustomer = await stripe.customers.create({
                email: payload.customer.email,
                name: payload.customer.name,
                phone: payload.customer.phone,
                metadata: {
                    supabase_customer_id: customerId,
                },
            })
            stripeCustomerId = stripeCustomer.id

            // Actualizar customer con stripe_customer_id
            await supabase
                .from('customers')
                .update({ stripe_customer_id: stripeCustomerId })
                .eq('id', customerId)
        }

        // ==========================================
        // 5. CREAR ADDRESS
        // ==========================================

        const { data: address, error: addressError } = await supabase
            .from('addresses')
            .insert({
                customer_id: customerId,
                kind: payload.address.kind || 'shipping',
                label: payload.address.label,
                recipient_name: payload.address.recipient_name || payload.customer.name,
                line1: payload.address.line1,
                line2: payload.address.line2,
                city: payload.address.city,
                state: payload.address.state,
                postcode: payload.address.postcode,
                country: payload.address.country || 'ES',
            })
            .select()
            .single()

        if (addressError) throw addressError

        // ==========================================
        // 6. VALIDAR Y APLICAR CUPÓN (SI EXISTE)
        // ==========================================

        let discountAmount = 0
        let couponId: string | null = null

        if (payload.coupon_code) {
            const subtotal = payload.items.reduce((sum, item) => sum + item.total_price, 0)

            const { data: couponValidation, error: couponError } = await supabase
                .rpc('validate_coupon', {
                    p_code: payload.coupon_code,
                    p_subtotal: subtotal,
                })

            if (!couponError && couponValidation?.valid) {
                discountAmount = couponValidation.discount_amount
                couponId = couponValidation.coupon_id
            }
        }

        // ==========================================
        // 7. CALCULAR TOTALES
        // ==========================================

        const subtotalAmount = payload.items.reduce((sum, item) => sum + item.total_price, 0)
        const totalAmount = subtotalAmount + shippingCost - discountAmount

        if (totalAmount <= 0) {
            throw new Error('Total debe ser mayor a 0')
        }

        // ==========================================
        // 8. CREAR ORDER
        // ==========================================

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_id: customerId,
                shipping_address_id: address.id,
                subtotal_amount: subtotalAmount,
                discount_amount: discountAmount,
                shipping_cost: shippingCost,
                total_amount: totalAmount,
                currency: currency,
                status: 'pending',
                note: payload.note,
                payment_deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
            })
            .select()
            .single()

        if (orderError) throw orderError

        // ==========================================
        // 9. CREAR ORDER_ITEMS
        // ==========================================

        const orderItems = payload.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            title: item.title,
            sku: item.sku,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            is_gift: item.is_gift || false,
            gift_message: item.gift_message,
        }))

        const { error: orderItemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (orderItemsError) throw orderItemsError

        // ==========================================
        // 10. REGISTRAR CUPÓN APLICADO
        // ==========================================

        if (couponId && discountAmount > 0) {
            await supabase.from('order_coupons').insert({
                order_id: order.id,
                coupon_id: couponId,
                discount_amount: discountAmount,
            })

            // Incrementar contador de uso
            await supabase.rpc('increment_coupon_usage', { p_coupon_id: couponId })
        }

        // ==========================================
        // 11. CREAR STRIPE CHECKOUT SESSION
        // ==========================================

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: `Pedido ${order.id.substring(0, 8)}`,
                            description: payload.items.map(i => `${i.quantity}x ${i.title}`).join(', '),
                        },
                        unit_amount: Math.round(totalAmount * 100), // Stripe usa centavos
                    },
                    quantity: 1,
                },
            ],
            success_url: `${payload.success_url}?order_id=${order.id}`,
            cancel_url: `${payload.cancel_url}?order_id=${order.id}`,
            metadata: {
                order_id: order.id,
                customer_email: payload.customer.email,
            },
            client_reference_id: order.id,
        })

        // ==========================================
        // 12. CREAR REGISTRO DE PAYMENT
        // ==========================================

        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                order_id: order.id,
                amount: totalAmount,
                currency: currency,
                status: 'requires_payment_method',
                stripe_checkout_session_id: session.id,
                customer_email: payload.customer.email,
                customer_name: payload.customer.name,
                success_url: payload.success_url,
                cancel_url: payload.cancel_url,
            })

        if (paymentError) throw paymentError

        // ==========================================
        // 13. RETORNAR RESPUESTA
        // ==========================================

        return new Response(
            JSON.stringify({
                success: true,
                order_id: order.id,
                checkout_url: session.url,
                total_amount: totalAmount,
                currency: currency,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Error creating checkout session:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Error al crear sesión de pago',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
 */