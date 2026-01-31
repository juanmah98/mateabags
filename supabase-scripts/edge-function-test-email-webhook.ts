// =====================================================
// EDGE FUNCTION: test-email-webhook (SOLO PARA TESTING)
// =====================================================
// ⚠️ ELIMINAR DESPUÉS DE PROBAR - NO USAR EN PRODUCCIÓN
// ⚠️ SIN AUTENTICACIÓN - SOLO PARA DESARROLLO
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const resendApiKey = Deno.env.get('RESEND_API_KEY')!

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Recibir datos del body
        const { order_id } = await req.json()

        if (!order_id) {
            throw new Error('order_id requerido')
        }

        console.log('📧 Testing email for order:', order_id)

        // Obtener datos del pedido
        const { data: orderDetails, error: fetchError } = await supabase
            .from('orders')
            .select(`
                *,
                customer:customers (*),
                shipping_address:addresses!shipping_address_id (*),
                items:order_items (*)
            `)
            .eq('id', order_id)
            .single()

        if (fetchError || !orderDetails) {
            throw new Error('Order not found: ' + order_id)
        }

        // Generar hash
        const orderHashCode = generateOrderHash(order_id)

        // Generar HTML
        const emailHtml = generateEmailHtml(orderDetails, orderHashCode)

        // 🆕 Generar comprobante en texto
        const receiptBase64 = generateReceiptText(orderDetails, orderHashCode)

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
                subject: `✅ [TEST] Confirmación de Pedido #${orderHashCode} - Mateabags`,
                html: emailHtml,
                attachments: [
                    {
                        filename: `Pedido_${orderHashCode}.txt`,
                        content: receiptBase64,
                    }
                ]
            }),
        })

        const emailResult = await emailResponse.json()

        if (!emailResponse.ok) {
            throw new Error(JSON.stringify(emailResult))
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Email sent successfully',
                emailId: emailResult.id,
                orderHashCode,
                recipient: orderDetails.customer.email
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})

// Copiar funciones del webhook principal
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

function generateEmailHtml(orderDetails: any, orderHashCode: string): string {
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
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1C352D, #2d5a4a); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ ¡Pedido Confirmado!</h1>
              <p style="color: #e0e0e0; margin: 10px 0 0 0;">Gracias por tu compra en Mateabags</p>
            </td>
          </tr>

          <!-- Order Info -->
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

              <!-- Customer Info -->
              <h3 style="color: #1C352D; margin: 20px 0 10px 0;">👤 Datos del Cliente</h3>
              <p style="margin: 5px 0; color: #333;"><strong>Nombre:</strong> ${customer.name}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${customer.email}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Teléfono:</strong> ${customer.phone}</p>

              <!-- Shipping Address -->
              <h3 style="color: #1C352D; margin: 20px 0 10px 0;">📍 Dirección de Envío</h3>
              <p style="margin: 5px 0; color: #333;">
                ${shipping_address.street} ${shipping_address.number}${shipping_address.floor ? `, Piso ${shipping_address.floor}` : ''}${shipping_address.door ? ` Puerta ${shipping_address.door}` : ''}<br>
                ${shipping_address.postcode} ${shipping_address.town}<br>
                ${shipping_address.city}, ${shipping_address.country}
              </p>

              <hr style="border: none; border-top: 2px solid #f0f0f0; margin: 20px 0;">

              <!-- Products Table -->
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

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                <tr>
                  <td style="padding: 5px 0; color: #333;">Subtotal:</td>
                  <td style="padding: 5px 0; text-align: right; color: #333;">${subtotal_amount.toFixed(2)} €</td>
                </tr>
                ${discount_amount > 0 ? `
                <tr>
                  <td style="padding: 5px 0; color: #28a745;">Descuento:</td>
                  <td style="padding: 5px 0; text-align: right; color: #28a745;">-${discount_amount.toFixed(2)} €</td>
                </tr>
                ` : ''}
                ${shipping_cost > 0 ? `
                <tr>
                  <td style="padding: 5px 0; color: #333;">Gastos de envío:</td>
                  <td style="padding: 5px 0; text-align: right; color: #333;">${shipping_cost.toFixed(2)} €</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #1C352D;">
                  <td style="padding: 10px 0; color: #1C352D; font-size: 18px; font-weight: bold;">TOTAL:</td>
                  <td style="padding: 10px 0; text-align: right; color: #1C352D; font-size: 18px; font-weight: bold;">${total_amount.toFixed(2)} €</td>
                </tr>
              </table>

              <hr style="border: none; border-top: 2px solid #f0f0f0; margin: 30px 0;">

              <!-- Footer -->
              <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0;">
                📎 Adjuntamos el comprobante de tu pedido.<br>
                ⚠️ ESTE ES UN EMAIL DE PRUEBA<br>
                ¡Gracias por confiar en Mateabags! 💚
              </p>
            </td>
          </tr>

          <!-- Footer Bar -->
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

// 🆕 Generar comprobante de pedido en texto
function generateReceiptText(orderDetails: any, orderHashCode: string): string {
    const { customer, shipping_address, items, subtotal_amount, discount_amount, shipping_cost, total_amount, created_at } = orderDetails

    // Crear contenido del comprobante en texto
    let pdfContent = `
═══════════════════════════════════════════════════════
              MATEABAGS - COMPROBANTE DE PEDIDO
═══════════════════════════════════════════════════════

Pedido #${orderHashCode}
Fecha: ${new Date(created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}

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

    // Agregar cada item
    items.forEach((item: any) => {
        pdfContent += `
${item.title}
SKU: ${item.sku || 'N/A'}
Cantidad: ${item.quantity} x ${item.unit_price.toFixed(2)} € = ${item.total_price.toFixed(2)} €
`
    })

    // Agregar totales
    pdfContent += `
───────────────────────────────────────────────────────
TOTALES
───────────────────────────────────────────────────────
Subtotal:        ${subtotal_amount.toFixed(2)} €
${discount_amount > 0 ? `Descuento:       -${discount_amount.toFixed(2)} €\n` : ''}${shipping_cost > 0 ? `Gastos de envío: ${shipping_cost.toFixed(2)} €\n` : ''}
───────────────────────────────────────────────────────
TOTAL:           ${total_amount.toFixed(2)} €

═══════════════════════════════════════════════════════
           ¡Gracias por tu compra en Mateabags!
                    www.mateabags.com
═══════════════════════════════════════════════════════

Este comprobante es válido como justificante de compra.
Conserva este documento para cualquier gestión relacionada
con tu pedido.

⚠️ DOCUMENTO DE PRUEBA - NO VÁLIDO PARA PRODUCCIÓN
    `

    // Convertir a Base64
    const encoder = new TextEncoder()
    const data = encoder.encode(pdfContent)
    const base64 = btoa(String.fromCharCode(...data))

    return base64
}

