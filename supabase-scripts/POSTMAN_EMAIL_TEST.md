# 📬 Testing Email con Postman

## Solución: Edge Function de Test

He creado `test-email-webhook` - una función temporal para testing que **NO verifica firma**.

### Pasos:

#### 1. Crear la Edge Function en Supabase
- Dashboard → Edge Functions → Create Function
- Nombre: `test-email-webhook`
- Pega el código de `edge-function-test-email-webhook.ts`
- Deploy

#### 2. Crear un Pedido de Prueba en Supabase

**Opción A: Hacer un pago de prueba en tu app**
- El pago creará todo en la BD automáticamente
- Copia el `order_id` generado

**Opción B: Insertar manualmente en Supabase**
```sql
-- 1. Crear customer
INSERT INTO customers (name, email, phone)
VALUES ('Test User', 'tu-email@gmail.com', '+34 600000000')
RETURNING id; -- Copia el ID

-- 2. Crear address (usa el customer_id de arriba)
INSERT INTO addresses (customer_id, kind, line1, city, postcode, country)
VALUES ('CUSTOMER_ID_AQUI', 'shipping', 'Calle Test 123', 'Madrid', '28001', 'ES')
RETURNING id; -- Copia el ID

-- 3. Crear order (usa customer_id y address_id)
INSERT INTO orders (
  customer_id, 
  shipping_address_id, 
  subtotal_amount, 
  discount_amount, 
  shipping_cost, 
  total_amount,
  status
)
VALUES (
  'CUSTOMER_ID_AQUI',
  'ADDRESS_ID_AQUI',
  50.00,
  5.00,
  5.00,
  50.00,
  'pending'
)
RETURNING id; -- Copia el ORDER_ID

-- 4. Crear order_items (usa order_id)
INSERT INTO order_items (
  order_id,
  product_id,
  title,
  sku,
  quantity,
  unit_price,
  total_price
)
VALUES (
  'ORDER_ID_AQUI',
  'prod_test',
  'Producto de Prueba',
  'TEST-001',
  1,
  50.00,
  50.00
);
```

#### 3. Testear con Postman

**Request:**
```
POST https://[TU-PROYECTO].supabase.co/functions/v1/test-email-webhook
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "order_id": "PEGA_AQUI_EL_ORDER_ID_REAL"
}
```

**Enviar** → Deberías recibir:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "emailId": "xxx",
  "orderHashCode": "12345678",
  "recipient": "tu-email@gmail.com"
}
```

#### 4. Verificar Email
- Revisa tu bandeja de entrada
- Deberías recibir el email con todos los datos del pedido
- Subject: `[TEST] Confirmación de Pedido #12345678`

---

## ⚠️ IMPORTANTE

**Después de probar, ELIMINA esta Edge Function:**
- Es solo para testing
- No tiene seguridad (cualquiera puede llamarla)
- NO usar en producción

---

## ✅ Alternativa Más Simple

Si no quieres crear la función de test:

1. **Haz un pago de prueba en tu app** con tarjeta de test
2. El webhook real se disparará automáticamente
3. Recibirás el email directamente

**Es más rápido y prueba el flujo completo real.** 🚀
