# 🔄 Actualización de stripe-webhook existente

## Código a Agregar

En tu Edge Function `stripe-webhook` existente, necesitas agregar un nuevo caso para manejar `checkout.session.completed`:

```typescript
// Dentro de tu función serve(), después de verificar el webhook

// ... tu código de verificación de firma existente ...

// Agregar este nuevo caso
if (event.type === 'checkout.session.completed') {
  const session = event.data.object as Stripe.Checkout.Session
  
  // Obtener order_id desde metadata
  const orderId = session.metadata?.order_id
  if (!orderId) {
    console.error('❌ No order_id in session metadata')
    return new Response(JSON.stringify({ error: 'No order_id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  console.log('📦 Processing order confirmation email:', orderId)

  // Obtener datos completos del pedido
  const { data: orderDetails, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers (*),
      shipping_address:addresses!shipping_address_id (*),
      items:order_items (*)
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !orderDetails) {
    console.error('❌ Error fetching order:', orderError)
    return new Response(JSON.stringify({ error: 'Order not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Generar hash del pedido
  const orderHashCode = generateOrderHash(orderId)

  // Crear HTML del email
  const emailHtml = generateEmailHtml(orderDetails, orderHashCode)

  // Enviar email con Resend
  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`
    },
    body: JSON.stringify({
      from: 'Mateabags <pedidos@mateabags.com>',
      to: [orderDetails.customer.email],
      subject: `✅ Confirmación de Pedido #${orderHashCode} - Mateabags`,
      html: emailHtml
    })
  })

  const emailResult = await emailResponse.json()

  if (!emailResponse.ok) {
    console.error('❌ Error sending email:', emailResult)
  } else {
    console.log('✅ Email sent successfully:', emailResult.id)
  }
}

// ... resto de tu código para otros eventos ...

// AGREGAR AL FINAL (fuera de serve())
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
  // ... (copiar la función generateEmailHtml del archivo edge-function-send-order-confirmation-email.ts)
}
```

## ⚙️ Variables de Entorno Adicionales

Asegúrate de tener en Supabase Secrets:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

(Ya tienes `STRIPE_WEBHOOK_SECRET`)

## 📋 Pasos

1. Copia tu código actual de `stripe-webhook`
2. Pégamelo aquí
3. Te daré el código completo actualizado con el manejo de email integrado

---

**Ventaja de usar el webhook existente:**
- ✅ No necesitas crear otro webhook en Stripe
- ✅ Mismo `STRIPE_WEBHOOK_SECRET`
- ✅ Todo centralizado en una función
