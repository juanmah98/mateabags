# 📦 Archivos de Integración Stripe - Mateabags

Esta carpeta contiene todos los archivos necesarios para implementar la pasarela de pagos con Stripe en tu proyecto Mateabags.

---

## 📁 Contenido de la Carpeta

### 🗄️ Scripts SQL (Ejecutar en Supabase Dashboard > SQL Editor)

1. **`01_stripe_database_migration.sql`**
   - Agrega campos necesarios a las tablas existentes (`payments`, `orders`, `stripe_events`)
   - Crea tabla `payment_attempts` para tracking de fallos
   - Agrega índices de rendimiento
   - Crea triggers para auto-actualización de timestamps
   - ✅ **Ejecutar PRIMERO**

2. **`02_rpc_functions.sql`**
   - Función `validate_coupon()` - Validar cupones desde frontend
   - Función `get_order_status()` - Consultar estado completo de orden
   - Función `increment_coupon_usage()` - Incrementar uso (solo Edge Functions)
   - Función `mark_order_as_paid()` - Marcar orden como pagada (webhook)
   - Función `cancel_expired_orders()` - Cancelar órdenes expiradas (cronjob)
   - ✅ **Ejecutar SEGUNDO**

3. **`03_rls_policies.sql`**
   - Políticas de Row Level Security para todas las tablas
   - Permisos públicos limitados (productos, cupones)
   - Restricciones admin (órdenes, pagos, envíos)
   - Políticas service_role para Edge Functions
   - ✅ **Ejecutar TERCERO**

### ⚡ Edge Functions (Copiar al Editor de Supabase)

4. **`edge-function-create-checkout-session.ts`**
   - Nombre de la función: `create-checkout-session`
   - Crea sesión de pago en Stripe
   - Procesa orden completa (customer, address, items, cupón)
   - Retorna URL de checkout de Stripe
   - ✅ **Deployar en Supabase Dashboard > Edge Functions**

5. **`edge-function-stripe-webhook.ts`**
   - Nombre de la función: `stripe-webhook`
   - Maneja eventos de Stripe (pago exitoso, fallido, reembolso, disputa)
   - Actualiza estado de órdenes y pagos automáticamente
   - Verifica firma de webhook para seguridad
   - ✅ **Deployar en Supabase Dashboard > Edge Functions**

### 📖 Documentación

6. **`SETUP_GUIDE.md`**
   - Guía paso a paso de implementación completa
   - Configuración de Stripe Dashboard
   - Configuración de Webhooks
   - Testing y verificación
   - Troubleshooting común

7. **`README.md`** (este archivo)
   - Índice y descripción de archivos

---

## 🚀 Orden de Implementación Recomendado

### Fase 1: Base de Datos (15 minutos)
```
1. Ejecutar 01_stripe_database_migration.sql
2. Ejecutar 02_rpc_functions.sql
3. Ejecutar 03_rls_policies.sql
```

### Fase 2: Edge Functions (10 minutos)
```
4. Crear función create-checkout-session en Supabase
5. Crear función stripe-webhook en Supabase
6. Configurar variables de entorno (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
```

### Fase 3: Configuración Stripe (10 minutos)
```
7. Obtener claves API de Stripe
8. Configurar webhook endpoint en Stripe Dashboard
9. Obtener webhook secret
```

### Fase 4: Verificación (5 minutos)
```
10. Test de RPC functions
11. Test de webhook con Stripe CLI
12. Verificar tablas en BD
```

**Tiempo total estimado: 40 minutos**

---

## 🔑 Variables de Entorno Necesarias

Configurar en **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**:

```bash
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📋 Checklist de Implementación

- [ ] Script SQL 01 ejecutado (migración BD)
- [ ] Script SQL 02 ejecutado (RPC functions)
- [ ] Script SQL 03 ejecutado (RLS policies)
- [ ] Edge Function `create-checkout-session` deployada
- [ ] Edge Function `stripe-webhook` deployada
- [ ] Secrets configuradas en Supabase
- [ ] Claves Stripe obtenidas
- [ ] Webhook configurado en Stripe
- [ ] Test de webhook exitoso
- [ ] Verificación de tablas BD

---

## 🧪 Testing

### Test Manual de RPC (SQL Editor)

```sql
-- Test validar cupón
SELECT validate_coupon('BLACKFRIDAY', 100.00);

-- Test obtener estado de orden (usar UUID real)
SELECT get_order_status('uuid-de-orden-existente');
```

### Test de Edge Function (cURL)

```bash
curl -X POST 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "customer": {"name": "Test", "email": "test@test.com"},
    "address": {"line1": "Test 123", "city": "Madrid", "postcode": "28001"},
    "items": [{"product_id": "uuid", "title": "Test", "quantity": 1, "unit_price": 49.90, "total_price": 49.90}],
    "shipping_cost": 5.00,
    "currency": "EUR",
    "success_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel"
  }'
```

### Test de Webhook (Stripe CLI)

```bash
# Escuchar webhooks
stripe listen --forward-to https://xxxxx.supabase.co/functions/v1/stripe-webhook

# Simular evento
stripe trigger payment_intent.succeeded
```

---

## 🛠️ Próximos Pasos (Frontend)

Una vez completada la implementación backend, necesitarás:

1. **Crear servicio Angular** para llamar a `create-checkout-session`
2. **Implementar redirección** a Stripe Checkout
3. **Crear página de confirmación** (success)
4. **Manejar cancelación** (cancel)
5. **Mostrar estado de orden** usando `get_order_status`

---

## 📞 Soporte

Para dudas sobre la implementación, revisar:
- `SETUP_GUIDE.md` - Guía detallada paso a paso
- Supabase Docs: https://supabase.com/docs/guides/functions
- Stripe Docs: https://stripe.com/docs/api

---

## ⚠️ Importante

- ❌ **NUNCA** commitear claves de Stripe al repositorio
- ✅ Empezar con **modo TEST** de Stripe
- ✅ Verificar webhooks funcionan antes de ir a producción
- ✅ Monitorear tabla `stripe_events` para errores

---

## 📊 Estructura de Tablas Modificadas

### payments (nuevos campos)
- `customer_email`, `customer_name` - Búsqueda rápida
- `card_brand`, `card_last4` - Detalles tarjeta
- `refunded`, `refund_amount` - Gestión reembolsos
- `risk_level`, `risk_score` - Detección fraude

### orders (nuevos campos)
- `stripe_metadata` - Metadata adicional
- `payment_deadline` - Timeout pagos pendientes
- `cancelled_at`, `cancellation_reason` - Tracking cancelaciones

### stripe_events (nuevos campos)
- `order_id`, `payment_id` - Relación directa
- `retries`, `error_message` - Gestión errores
- `processed_at` - Timestamp procesamiento

### payment_attempts (nueva tabla)
- Tracking de todos los intentos de pago
- Analytics de conversión
- Debugging de fallos

---

**Última actualización**: 2026-01-25
**Versión**: 1.0
**Estado**: ✅ Listo para implementación
