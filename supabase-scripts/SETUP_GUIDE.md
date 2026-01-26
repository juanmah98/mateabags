# 🚀 Guía de Implementación Stripe - Paso a Paso

Esta guía te indica exactamente cómo implementar todo lo creado en los archivos anteriores.

---

## 📋 Prerrequisitos

1. ✅ Cuenta de Stripe creada (https://dashboard.stripe.com)
2. ✅ Proyecto de Supabase activo
3. ✅ Acceso al Dashboard de Supabase

---

## 🔢 PASO 1: Obtener Claves de Stripe

### 1.1 Ir a Stripe Dashboard
- Ir a: https://dashboard.stripe.com/test/apikeys
- Estás en **modo TEST** (recomendado para empezar)

### 1.2 Copiar claves
Necesitas estas 2 claves:

**Publishable Key** (empieza con `pk_test_...`)
```
pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Secret Key** (empieza con `sk_test_...`) - ⚠️ NUNCA compartir
```
sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🗄️ PASO 2: Ejecutar Migraciones SQL en Supabase

### 2.1 Migración de Base de Datos

1. Ir a: **Supabase Dashboard** → **SQL Editor**
2. Click en **"New query"**
3. Copiar y pegar el contenido de: `supabase-scripts/01_stripe_database_migration.sql`
4. Click en **"RUN"**
5. ✅ Verificar que aparece: "Migración exitosa: todas las columnas agregadas correctamente"

### 2.2 Funciones RPC

1. Crear **nueva query** en SQL Editor
2. Copiar y pegar: `supabase-scripts/02_rpc_functions.sql`
3. Click en **"RUN"**
4. ✅ Verificar que no hay errores

### 2.3 Políticas RLS

1. Crear **nueva query** en SQL Editor
2. Copiar y pegar: `supabase-scripts/03_rls_policies.sql`
3. Click en **"RUN"**
4. ✅ Verificar que aparece el conteo de políticas creadas

---

## ⚡ PASO 3: Crear Edge Functions en Supabase

### 3.1 Edge Function: create-checkout-session

1. Ir a: **Supabase Dashboard** → **Edge Functions**
2. Click en **"Create function"**
3. Nombre: `create-checkout-session`
4. Copiar TODO el contenido de: `supabase-scripts/edge-function-create-checkout-session.ts`
5. Pegar en el editor
6. Click en **"Deploy"**
7. ✅ Anotar la URL generada (ej: `https://xxxxx.supabase.co/functions/v1/create-checkout-session`)

### 3.2 Edge Function: stripe-webhook

1. En **Edge Functions**, click en **"Create function"**
2. Nombre: `stripe-webhook`
3. Copiar TODO el contenido de: `supabase-scripts/edge-function-stripe-webhook.ts`
4. Pegar en el editor
5. Click en **"Deploy"**
6. ✅ Anotar la URL generada (ej: `https://xxxxx.supabase.co/functions/v1/stripe-webhook`)

---

## 🔐 PASO 4: Configurar Variables de Entorno en Supabase

1. Ir a: **Supabase Dashboard** → **Project Settings** → **Edge Functions**
2. Scroll hasta **"Secrets"** o **"Environment Variables"**
3. Agregar estas variables (una por una):

```
STRIPE_SECRET_KEY = sk_test_XXXXXXXXXXXXXXXXXXXXXXXX
```

4. Click en **"Add secret"** o **"Save"**

---

## 🪝 PASO 5: Configurar Webhook en Stripe

### 5.1 Crear Endpoint de Webhook

1. Ir a: https://dashboard.stripe.com/test/webhooks
2. Click en **"Add endpoint"**
3. **Endpoint URL**: Pegar la URL de tu Edge Function `stripe-webhook`
   ```
   https://xxxxx.supabase.co/functions/v1/stripe-webhook
   ```
4. **Description**: `Supabase Webhook Handler`

### 5.2 Seleccionar Eventos

En **"Select events to listen to"**, marcar:

- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `charge.refunded`
- ✅ `charge.dispute.created`

5. Click en **"Add endpoint"**

### 5.3 Obtener Webhook Secret

1. Una vez creado el webhook, click en él
2. En la sección **"Signing secret"**, click en **"Reveal"**
3. Copiar el secret (empieza con `whsec_...`)
   ```
   whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### 5.4 Agregar Webhook Secret a Supabase

1. Volver a: **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Agregar:
   ```
   STRIPE_WEBHOOK_SECRET = whsec_XXXXXXXXXXXXXXXXXXXXXXXX
   ```
3. Guardar

---

## 🧪 PASO 6: Testing con Stripe CLI (Opcional pero Recomendado)

### 6.1 Instalar Stripe CLI

**Windows (PowerShell):**
```powershell
scoop install stripe
```

Alternativamente, descargar de: https://github.com/stripe/stripe-cli/releases

### 6.2 Login

```bash
stripe login
```

### 6.3 Escuchar Webhooks Localmente

```bash
stripe listen --forward-to https://xxxxx.supabase.co/functions/v1/stripe-webhook
```

Esto te dará un `whsec_...` temporal para testing.

### 6.4 Simular Evento

En otra terminal:
```bash
stripe trigger payment_intent.succeeded
```

Verificar en Supabase Dashboard → Database → Table Editor → `stripe_events` que aparece el evento.

---

## ✅ PASO 7: Verificación Final

### 7.1 Verificar Base de Datos

En Supabase, ir a **Table Editor** y verificar:

- ✅ Tabla `payments` tiene columnas: `card_brand`, `card_last4`, `refunded`, etc.
- ✅ Tabla `payment_attempts` existe
- ✅ Tabla `stripe_events` existe

### 7.2 Verificar RPC Functions

1. Ir a **SQL Editor**
2. Ejecutar:
   ```sql
   SELECT validate_coupon('TEST', 100.00);
   ```
3. ✅ Debe retornar JSON con `"valid": false`

### 7.3 Verificar Edge Functions

1. Ir a **Edge Functions**
2. ✅ Debe haber 2 funciones: `create-checkout-session` y `stripe-webhook`
3. Click en cada una, verificar que están **deployed**

### 7.4 Verificar Webhook en Stripe

1. Ir a: https://dashboard.stripe.com/test/webhooks
2. ✅ Debe aparecer tu endpoint con estado **Enabled**
3. ✅ Debe tener los 5 eventos seleccionados

---

## 🎯 PASO 8: Test E2E Manual (Próximo)

Una vez completado todo lo anterior, puedes probar el flujo completo desde el frontend Angular.

Esto lo haremos en la siguiente fase de implementación.

---

## 🚨 Troubleshooting Común

### Error: "Missing environment variables"

**Solución**: Verificar que agregaste las 2 secrets en Supabase:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Error: "Webhook signature verification failed"

**Solución**: El `STRIPE_WEBHOOK_SECRET` está incorrecto. Verificar que copiaste el correcto del Stripe Dashboard.

### Error en migraciones SQL: "column already exists"

**Solución**: La migración ya se ejecutó antes. Es seguro ignorar (los `IF NOT EXISTS` protegen contra esto).

### Edge Function no se deploya

**Solución**: Verificar que el código TypeScript no tiene errores de sintaxis. Revisar logs en Supabase Dashboard.

---

## 📝 Checklist de Implementación

- [ ] Claves de Stripe obtenidas
- [ ] Migración SQL ejecutada (01_stripe_database_migration.sql)
- [ ] RPC Functions creadas (02_rpc_functions.sql)
- [ ] Políticas RLS aplicadas (03_rls_policies.sql)
- [ ] Edge Function `create-checkout-session` deployada
- [ ] Edge Function `stripe-webhook` deployada
- [ ] Variables de entorno configuradas en Supabase
- [ ] Webhook endpoint creado en Stripe
- [ ] Webhook secret agregado a Supabase
- [ ] Verificación de tablas en BD
- [ ] Verificación de RPC functions
- [ ] Test de webhook con Stripe CLI (opcional)

---

## 🎉 ¡Siguiente Paso!

Una vez completado este checklist, estarás listo para integrar desde el frontend Angular.

Necesitarás:
1. Crear/adaptar el servicio de checkout en Angular
2. Llamar a la Edge Function `create-checkout-session`
3. Redirigir al usuario a la URL de Stripe
4. Manejar el retorno (success/cancel)

**¿Quieres que genere los archivos TypeScript para Angular ahora?**
