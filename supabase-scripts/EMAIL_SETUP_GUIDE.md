# 📧 Configuración de Email de Confirmación

Guía completa para configurar el envío automático de emails de confirmación después del pago.

---

## 📋 Paso 1: Crear cuenta en Resend

1. Ve a https://resend.com
2. Crea una cuenta gratuita
3. Verifica tu email
4. Ve a **API Keys** y crea una nueva API Key
5. **Copia la API Key** (empieza con `re_...`)

**Plan Gratuito:** 3,000 emails/mes

---

## 📋 Paso 2: Configurar Dominio en Resend (Opcional pero Recomendado)

### Opción A: Usar dominio verificado
1. En Resend → **Domains** → **Add Domain**
2. Agrega tu dominio (ej: `mateabags.com`)
3. Configura los registros DNS según te indique Resend
4. Espera verificación (puede tardar unos minutos)
5. Usa emails como: `pedidos@mateabags.com`

### Opción B: Usar dominio de prueba
- Puedes usar `onboarding@resend.dev` para pruebas
- Solo envía a tu propio email verificado

---

## 📋 Paso 3: Crear Edge Function en Supabase

1. **Supabase Dashboard** → Edge Functions → **Create Function**
2. Nombre: `send-order-confirmation-email`
3. **Pega el código** de `edge-function-send-order-confirmation-email.ts`
4. Click **Deploy**

---

## 📋 Paso 4: Configurar Secrets en Supabase

Ve a **Edge Functions** → **Secrets** y agrega:

```bash
# Ya tienes estas
STRIPE_SECRET_KEY=sk_live_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# NUEVAS - Agregar estas
RESEND_API_KEY=re_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Lo obtendrás en el siguiente paso
```

---

## 📋 Paso 5: Configurar Webhook en Stripe

1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL:**
   ```
   https://[TU-PROYECTO].supabase.co/functions/v1/send-order-confirmation-email
   ```
4. **Events to send:**
   - Busca y selecciona: `checkout.session.completed`
5. Click **Add endpoint**
6. **Copia el Webhook Secret** (empieza con `whsec_...`)
7. Agrégalo a Supabase Secrets como `STRIPE_WEBHOOK_SECRET`

---

## 📋 Paso 6: Actualizar Edge Function de Checkout

Modifica `create-checkout-session` para incluir `order_id` en metadata:

```typescript
// En la creación de la sesión de Stripe
const session = await stripe.checkout.sessions.create({
  // ... resto del código
  metadata: {
    order_id: order.id  // ← AGREGAR ESTO
  }
})
```

---

## 📋 Paso 7: Redeploy Edge Function de Checkout

Después de modificar el código:

1. Ve a Supabase Dashboard → Edge Functions
2. Selecciona `create-checkout-session`
3. Click **Deploy** nuevamente

---

## ✅ Verificación

### Test Manual del Webhook

Puedes probar el webhook manualmente desde Stripe Dashboard:

1. **Stripe** → **Developers** → **Webhooks**
2. Click en tu webhook
3. Tab **Send test webhook**
4. Evento: `checkout.session.completed`
5. Click **Send test webhook**

**Nota:** Para que funcione, necesitas tener un `order_id` real en la metadata.

### Test con Pago Real

1. Haz un pago de prueba en tu app
2. Verifica en **Stripe → Events** que se envió el webhook
3. Verifica en **Supabase → Edge Functions → Logs** que se ejecutó
4. Verifica que recibiste el email

---

## 🔍 Debugging

### Logs de Stripe
- **Stripe Dashboard** → **Developers** → **Webhooks** → Click en tu webhook → **Event logs**

### Logs de Supabase
- **Supabase Dashboard** → **Edge Functions** → `send-order-confirmation-email` → **Logs**

### Logs de Resend
- **Resend Dashboard** → **Emails** (ver emails enviados)

---

## 📧 Personalizar Email

Para cambiar el diseño del email, modifica la función `generateEmailHtml()` en el Edge Function.

**Elementos editables:**
- Logo (actualmente no incluido, puedes agregar URL)
- Colores (busca `#1C352D` y cámbialo)
- Textos
- Estructura HTML

---

## ⚠️ Troubleshooting

### Email no llega
1. ✅ Verifica logs de Supabase - ¿se ejecutó la función?
2. ✅ Verifica logs de Stripe - ¿se envió el webhook?
3. ✅ Verifica Resend Dashboard - ¿se envió el email?
4. ✅ Revisa carpeta de SPAM

### Webhook falla con signature error
- ✅ Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto
- ✅ Asegúrate de usar el secret del webhook, no de la API

### No se dispara el webhook
- ✅ Verifica que el pago sea real (no tarjeta de prueba en modo live)
- ✅ Verifica que el evento sea `checkout.session.completed`
- ✅ Verifica la URL del endpoint

---

## 🚀 Resumen del Flujo

```
1. Cliente paga → Stripe Checkout
2. Pago exitoso → Stripe dispara webhook
3. Webhook → Edge Function (send-order-confirmation-email)
4. Edge Function:
   a. ✅ Verifica firma de Stripe
   b. 📦 Obtiene order_id
   c. 🗄️ Consulta datos en Supabase
   d. 📧 Genera HTML del email
   e. 📤 Envía email vía Resend
5. Cliente recibe email en su bandeja ✅
```

---

## ✅ Checklist Final

- [ ] Cuenta Resend creada
- [ ] API Key de Resend obtenida
- [ ] Edge Function creada en Supabase
- [ ] Secrets configurados en Supabase
- [ ] Webhook configurado en Stripe
- [ ] `order_id` agregado a metadata en checkout
- [ ] Edge Function de checkout redeployada
- [ ] Test realizado y email recibido

---

¡Listo! Ahora tus clientes recibirán automáticamente un email de confirmación después de cada compra. 🎉
