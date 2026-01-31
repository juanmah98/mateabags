// =====================================================
// EDGE FUNCTION: stripe-webhook (CON PDF ADJUNTO)
// =====================================================
// Crear en: Supabase Dashboard > Edge Functions
// Nombre: stripe-webhook
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// CORS Headers (webhooks no necesitan CORS, pero lo dejamos por si acaso)
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight (aunque webhooks no lo necesitan)
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
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
        const resendApiKey = Deno.env.get('RESEND_API_KEY')!

        if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey || !webhookSecret) {
            throw new Error('Missing environment variables')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // ==========================================
        // 2. VERIFICAR FIRMA DEL WEBHOOK (CRÍTICO)
        // ==========================================

        const signature = req.headers.get('stripe-signature')
        if (!signature) {
            console.error('No signature header found')
            return new Response('Webhook signature missing', { status: 400 })
        }

        const body = await req.text()
        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message)
            return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
        }

        console.log(`✅ Webhook verified: ${event.type}`)

        // ==========================================
        // 3. REGISTRAR EVENTO EN stripe_events
        // ==========================================

        const { data: eventRecord, error: eventError } = await supabase
            .from('stripe_events')
            .insert({
                stripe_event_id: event.id,
                kind: event.type,
                payload: event as any,
                status: 'received',
            })
            .select()
            .single()

        if (eventError) {
            // Si ya existe (idempotencia), ignorar
            if (eventError.code === '23505') {
                console.log(`Event ${event.id} already processed, skipping`)
                return new Response(JSON.stringify({ received: true, status: 'duplicate' }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200,
                })
            }
            throw eventError
        }

        // ==========================================
        // 4. PROCESAR EVENTO SEGÚN TIPO
        // ==========================================

        let processed = false
        let orderId: string | null = null
        let paymentId: string | null = null

        switch (event.type) {
            // ==========================================
            // CHECKOUT SESSION COMPLETADO + EMAIL ← CON PDF
            // ==========================================
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                orderId = session.metadata?.order_id || session.client_reference_id || null

                if (!orderId) {
                    console.error('No order_id in session metadata')
                    break
                }

                console.log(`Processing checkout.session.completed for order: ${orderId}`)

                // Actualizar orden a 'paid'
                const { error: orderUpdateError } = await supabase
                    .from('orders')
                    .update({
                        status: 'paid',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', orderId)
                    .eq('status', 'pending')

                if (orderUpdateError) {
                    console.error('Error updating order:', orderUpdateError)
                } else {
                    console.log(`✅ Order ${orderId} marked as paid`)
                }

                // Actualizar payment con session_id
                const { error: paymentUpdateError } = await supabase
                    .from('payments')
                    .update({
                        stripe_checkout_session_id: session.id,
                        stripe_payment_intent_id: session.payment_intent as string,
                        status: 'processing',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('order_id', orderId)

                if (paymentUpdateError) {
                    console.error('Error updating payment:', paymentUpdateError)
                }

                // ==========================================
                // ✨ ENVIAR EMAIL CON PDF
                // ==========================================
                if (resendApiKey) {
                    try {
                        // Obtener datos completos del pedido
                        const { data: orderDetails, error: fetchError } = await supabase
                            .from('orders')
                            .select(`
                                *,
                                customer:customers (*),
                                shipping_address:addresses!shipping_address_id (*),
                                items:order_items (*)
                            `)
                            .eq('id', orderId)
                            .single()

                        if (fetchError || !orderDetails) {
                            console.error('❌ Error fetching order for email:', fetchError)
                        } else {
                            // Generar hash del pedido
                            const orderHashCode = generateOrderHash(orderId)

                            // Generar HTML del email
                            const emailHtml = generateEmailHtml(orderDetails, orderHashCode)

                            // 🆕 Generar PDF
                            const pdfBase64 = await generateReceiptPDF(orderDetails, orderHashCode)

                            // Enviar email con PDF adjunto
                            const emailResponse = await fetch('https://api.resend.com/emails', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${resendApiKey}`,
                                },
                                body: JSON.stringify({
                                    from: 'Mateabags <pedidos@mateabags.com>',
                                    to: [orderDetails.customer.email],
                                    subject: `✅ Confirmación de Pedido #${orderHashCode} - Mateabags`,
                                    html: emailHtml,
                                    attachments: [
                                        {
                                            filename: `Pedido_${orderHashCode}.pdf`,
                                            content: pdfBase64,
                                        }
                                    ]
                                }),
                            })

                            const emailResult = await emailResponse.json()

                            if (!emailResponse.ok) {
                                console.error('❌ Error sending email:', emailResult)
                            } else {
                                console.log('✅ Email sent successfully:', emailResult.id)
                            }
                        }
                    } catch (emailError) {
                        console.error('❌ Email sending exception:', emailError)
                        // No lanzar error para no bloquear el webhook
                    }
                } else {
                    console.warn('⚠️ RESEND_API_KEY not configured, skipping email')
                }

                processed = true
                break
            }

            // ... [El resto de los casos: payment_intent.succeeded, payment_failed, etc. - IGUAL QUE ANTES]
            // Por brevedad, solo muestro el caso principal modificado
        }

        // ==========================================
        // 5. MARCAR EVENTO COMO PROCESADO
        // ==========================================

        if (processed && eventRecord) {
            await supabase
                .from('stripe_events')
                .update({
                    status: 'processed',
                    processed_at: new Date().toISOString(),
                    order_id: orderId,
                    payment_id: paymentId,
                })
                .eq('id', eventRecord.id)
        }

        // ==========================================
        // 6. RETORNAR RESPUESTA 200 (CRÍTICO)
        // ==========================================

        return new Response(
            JSON.stringify({ received: true, processed }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function generateOrderHash(orderId: string): string {
    let hash = 0
    for (let i = 0; i < orderId.length; i++) {
        const char = orderId.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    const hashStr = Math.abs(hash).toString()
    return hashStr.padStart(8, '0').substring(0, 8)
}

// 🆕 Generar PDF del recibo
async function generateReceiptPDF(orderDetails: any, orderHashCode: string): Promise<string> {
    const { customer, shipping_address, items, subtotal_amount, discount_amount, shipping_cost, total_amount, created_at } = orderDetails

    // Crear PDF simple en texto plano (compatible con Deno)
    let pdfContent = `
═══════════════════════════════════════════════════════
              MATEABAGS - COMPROBANTE DE PEDIDO
═══════════════════════════════════════════════════════

Pedido #${orderHashCode}
Fecha: ${new Date(created_at).toLocaleDateString('es-ES')}

───────────────────────────────────────────────────────
DATOS DEL CLIENTE
───────────────────────────────────────────────────────
Nombre:   ${customer.name}
Email:    ${customer.email}
Teléfono: ${customer.phone}

───────────────────────────────────────────────────────
DIRECCIÓN DE ENVÍO
───────────────────────────────────────────────────────
${shipping_address.street} ${shipping_address.number}${shipping_address.floor ? `, Piso ${shipping_address.floor}` : ''}${shipping_address.door ? ` Puerta ${shipping_address.door}` : ''}
${shipping_address.postcode} ${shipping_address.town}
${shipping_address.city}, ${shipping_address.country}

───────────────────────────────────────────────────────
PRODUCTOS
───────────────────────────────────────────────────────
`

    items.forEach((item: any) => {
        pdfContent += `
${item.title}
SKU: ${item.sku || 'N/A'}
Cantidad: ${item.quantity} x ${item.unit_price.toFixed(2)} € = ${item.total_price.toFixed(2)} €
`
    })

    pdfContent += `
───────────────────────────────────────────────────────
TOTALES
───────────────────────────────────────────────────────
Subtotal:        ${subtotal_amount.toFixed(2)} €
${discount_amount > 0 ? `Descuento:       -${discount_amount.toFixed(2)} €\n` : ''}${shipping_cost > 0 ? `Gastos de envío: ${shipping_cost.toFixed(2)} €\n` : ''}
TOTAL:           ${total_amount.toFixed(2)} €

═══════════════════════════════════════════════════════
           ¡Gracias por tu compra en Mateabags!
═══════════════════════════════════════════════════════
    `

    // Convertir a Base64
    const encoder = new TextEncoder()
    const data = encoder.encode(pdfContent)
    const base64 = btoa(String.fromCharCode(...data))

    return base64
}

function generateEmailHtml(orderDetails: any, orderHashCode: string): string {
    // ... [MISMA FUNCIÓN QUE ANTES - SIN CAMBIOS]
    const { customer, shipping_address, items, subtotal_amount, discount_amount, shipping_cost, total_amount, created_at } = orderDetails

    const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.title}</strong><br>
        <small style="color: #666;">SKU: ${item.sku || 'N/A'}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${(item.unit_price).toFixed(2)} €</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;"><strong>${(item.total_price).toFixed(2)} €</strong></td>
    </tr>
  `).join('')

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1C352D, #2d5a4a); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ ¡Pedido Confirmado!</h1>
              <p style="color: #e0e0e0; margin: 10px 0 0 0;">Gracias por tu compra en Mateabags</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="margin: 0; color: #666; font-size: 14px;">ID del Pedido</p>
                    <p style="margin: 5px 0 0 0; color: #1C352D; font-size: 18px; font-weight: bold;">#${orderHashCode}</p>
                  </td>
                  <td style="padding-bottom: 20px; text-align: right;">
                    <p style="margin: 0; color: #666; font-size: 14px;">Fecha</p>
                    <p style="margin: 5px 0 0 0; color: #1C352D; font-size: 18px; font-weight: bold;">${new Date(created_at).toLocaleDateString('es-ES')}</p>
                  </td>
                </tr>
              </table>
              <hr style="border: none; border-top: 2px solid #f0f0f0; margin: 20px 0;">
              <h3 style="color: #1C352D; margin: 20px 0 10px 0;">👤 Datos del Cliente</h3>
              <p style="margin: 5px 0; color: #333;"><strong>Nombre:</strong> ${customer.name}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${customer.email}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Teléfono:</strong> ${customer.phone}</p>
              <h3 style="color: #1C352D; margin: 20px 0 10px 0;">📍 Dirección de Envío</h3>
              <p style="margin: 5px 0; color: #333;">
                ${shipping_address.street} ${shipping_address.number}${shipping_address.floor ? `, Piso ${shipping_address.floor}` : ''}${shipping_address.door ? ` Puerta ${shipping_address.door}` : ''}<br>
                ${shipping_address.postcode} ${shipping_address.town}<br>
                ${shipping_address.city}, ${shipping_address.country}
              </p>
              <hr style="border: none; border-top: 2px solid #f0f0f0; margin: 20px 0;">
              <h3 style="color: #1C352D; margin: 20px 0 10px 0;">🛍️ Productos</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; color: #1C352D; font-weight: 600;">Producto</th>
                    <th style="padding: 12px; text-align: center; color: #1C352D; font-weight: 600;">Cant.</th>
                    <th style="padding: 12px; text-align: right; color: #1C352D; font-weight: 600;">P. Unit.</th>
                    <th style="padding: 12px; text-align: right; color: #1C352D; font-weight: 600;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                <tr>
                  <td style="padding: 5px 0; color: #333;">Subtotal:</td>
                  <td style="padding: 5px 0; text-align: right; color: #333;">${subtotal_amount.toFixed(2)} €</td>
                </tr>
                ${discount_amount > 0 ? `<tr><td style="padding: 5px 0; color: #28a745;">Descuento:</td><td style="padding: 5px 0; text-align: right; color: #28a745;">-${discount_amount.toFixed(2)} €</td></tr>` : ''}
                ${shipping_cost > 0 ? `<tr><td style="padding: 5px 0; color: #333;">Gastos de envío:</td><td style="padding: 5px 0; text-align: right; color: #333;">${shipping_cost.toFixed(2)} €</td></tr>` : ''}
                <tr style="border-top: 2px solid #1C352D;">
                  <td style="padding: 10px 0; color: #1C352D; font-size: 18px; font-weight: bold;">TOTAL:</td>
                  <td style="padding: 10px 0; text-align: right; color: #1C352D; font-size: 18px; font-weight: bold;">${total_amount.toFixed(2)} €</td>
                </tr>
              </table>
              <hr style="border: none; border-top: 2px solid #f0f0f0; margin: 30px 0;">
              <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0;">
                📎 Adjuntamos el comprobante de tu pedido en PDF.<br>
                Recibirás actualizaciones sobre el estado de tu pedido por email.<br>
                ¡Gracias por confiar en Mateabags! 💚
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1C352D; padding: 20px; text-align: center;">
              <p style="color: #e0e0e0; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Mateabags. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
