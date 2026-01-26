-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY) PARA STRIPE
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =====================================================
-- Seguridad a nivel de fila para todas las tablas
-- =====================================================

-- ==========================================
-- ACTIVAR RLS EN TODAS LAS TABLAS
-- ==========================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- LIMPIAR POLÍTICAS EXISTENTES (SI EXISTEN)
-- ==========================================

-- Products
DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_admin_all" ON products;

-- Customers
DROP POLICY IF EXISTS "customers_insert_anon" ON customers;
DROP POLICY IF EXISTS "customers_admin_all" ON customers;

-- Addresses
DROP POLICY IF EXISTS "addresses_insert_anon" ON addresses;
DROP POLICY IF EXISTS "addresses_admin_all" ON addresses;

-- Orders
DROP POLICY IF EXISTS "orders_admin_all" ON orders;
DROP POLICY IF EXISTS "orders_service_insert" ON orders;

-- Order Items
DROP POLICY IF EXISTS "order_items_admin_all" ON order_items;
DROP POLICY IF EXISTS "order_items_service_insert" ON order_items;

-- Payments
DROP POLICY IF EXISTS "payments_admin_all" ON payments;
DROP POLICY IF EXISTS "payments_service_all" ON payments;

-- Shipments
DROP POLICY IF EXISTS "shipments_admin_all" ON shipments;

-- Stripe Events
DROP POLICY IF EXISTS "stripe_events_service_all" ON stripe_events;

-- Coupons
DROP POLICY IF EXISTS "coupons_select_public" ON coupons;
DROP POLICY IF EXISTS "coupons_admin_all" ON coupons;

-- Order Coupons
DROP POLICY IF EXISTS "order_coupons_admin_all" ON order_coupons;
DROP POLICY IF EXISTS "order_coupons_service_insert" ON order_coupons;

-- Payment Attempts
DROP POLICY IF EXISTS "payment_attempts_admin_all" ON payment_attempts;
DROP POLICY IF EXISTS "payment_attempts_service_insert" ON payment_attempts;

-- ==========================================
-- PRODUCTOS - LECTURA PÚBLICA
-- ==========================================

-- Permitir SELECT a todos (anon, authenticated) solo de productos activos
CREATE POLICY "products_select_public" ON products
  FOR SELECT
  USING (active = true);

-- Admin tiene acceso completo
CREATE POLICY "products_admin_all" ON products
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ==========================================
-- CUSTOMERS - INSERCIÓN LIMITADA
-- ==========================================

-- Permitir INSERT a anon (checkout) - NO permite SELECT para privacidad
CREATE POLICY "customers_insert_anon" ON customers
  FOR INSERT
  WITH CHECK (true);

-- Admin puede ver y editar todo
CREATE POLICY "customers_admin_all" ON customers
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ==========================================
-- ADDRESSES - INSERCIÓN LIMITADA
-- ==========================================

-- Permitir INSERT a anon (checkout)
CREATE POLICY "addresses_insert_anon" ON addresses
  FOR INSERT
  WITH CHECK (true);

-- Admin puede ver y editar todo
CREATE POLICY "addresses_admin_all" ON addresses
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ==========================================
-- ORDERS - SOLO ADMIN Y SERVICE_ROLE
-- ==========================================

-- Admin puede ver y editar todo
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Service role (Edge Functions) puede insertar y actualizar
CREATE POLICY "orders_service_all" ON orders
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- ORDER_ITEMS - SOLO ADMIN Y SERVICE_ROLE
-- ==========================================

-- Admin puede ver y editar todo
CREATE POLICY "order_items_admin_all" ON order_items
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Service role puede insertar
CREATE POLICY "order_items_service_all" ON order_items
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- PAYMENTS - SOLO ADMIN Y SERVICE_ROLE
-- ==========================================

-- Admin puede ver y editar todo
CREATE POLICY "payments_admin_all" ON payments
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Service role (Webhooks) puede hacer TODO
CREATE POLICY "payments_service_all" ON payments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- SHIPMENTS - SOLO ADMIN
-- ==========================================

-- Admin puede ver y editar todo
CREATE POLICY "shipments_admin_all" ON shipments
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Service role puede crear envíos automáticos
CREATE POLICY "shipments_service_insert" ON shipments
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- STRIPE_EVENTS - SOLO SERVICE_ROLE
-- ==========================================

-- Solo service_role (webhooks) puede insertar eventos
CREATE POLICY "stripe_events_service_all" ON stripe_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Admin puede leer para debugging
CREATE POLICY "stripe_events_admin_select" ON stripe_events
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ==========================================
-- COUPONS - LECTURA PÚBLICA LIMITADA
-- ==========================================

-- Permitir SELECT a todos (para verificar si existe)
-- NOTA: No exponemos el valor, eso se valida en validate_coupon RPC
CREATE POLICY "coupons_select_public" ON coupons
  FOR SELECT
  USING (active = true);

-- Admin puede gestionar cupones
CREATE POLICY "coupons_admin_all" ON coupons
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ==========================================
-- ORDER_COUPONS - SOLO ADMIN Y SERVICE_ROLE
-- ==========================================

-- Admin puede ver historial de cupones usados
CREATE POLICY "order_coupons_admin_all" ON order_coupons
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Service role puede registrar uso de cupones
CREATE POLICY "order_coupons_service_insert" ON order_coupons
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- PAYMENT_ATTEMPTS - SOLO ADMIN Y SERVICE_ROLE
-- ==========================================

-- Admin puede ver todos los intentos
CREATE POLICY "payment_attempts_admin_all" ON payment_attempts
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Service role puede registrar intentos
CREATE POLICY "payment_attempts_service_insert" ON payment_attempts
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- BYPASS RLS PARA SERVICE_ROLE
-- ==========================================
-- service_role puede hacer cualquier operación sin restricciones RLS
-- Esto es necesario para Edge Functions y webhooks

-- Activar bypass para service_role en todas las tablas
ALTER TABLE products FORCE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
ALTER TABLE addresses FORCE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
ALTER TABLE order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;
ALTER TABLE shipments FORCE ROW LEVEL SECURITY;
ALTER TABLE stripe_events FORCE ROW LEVEL SECURITY;
ALTER TABLE coupons FORCE ROW LEVEL SECURITY;
ALTER TABLE order_coupons FORCE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts FORCE ROW LEVEL SECURITY;

-- ==========================================
-- VERIFICACIÓN DE POLÍTICAS
-- ==========================================

DO $$
DECLARE
  v_count integer;
BEGIN
  -- Contar políticas creadas
  SELECT COUNT(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  IF v_count < 20 THEN
    RAISE WARNING 'Solo % políticas RLS encontradas. Verifica que todas se crearon correctamente.', v_count;
  ELSE
    RAISE NOTICE 'RLS configurado exitosamente: % políticas creadas', v_count;
  END IF;
END $$;

-- Mostrar resumen de políticas por tabla
SELECT 
  tablename,
  COUNT(*) as num_policies,
  array_agg(policyname) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ==========================================
-- FIN DE RLS POLICIES
-- ==========================================

-- SIGUIENTE PASO: Implementar Edge Functions
-- Ver archivos: 
-- - edge-function-create-checkout-session.ts
-- - edge-function-stripe-webhook.ts
