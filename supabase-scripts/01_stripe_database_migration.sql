-- =====================================================
-- MIGRACIÓN STRIPE - BASE DE DATOS
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =====================================================
-- Agrega campos necesarios para integración completa con Stripe
-- SAFE: Solo agrega columnas nuevas, no modifica datos existentes
-- =====================================================

-- ==========================================
-- 1. TABLA PAYMENTS - Campos adicionales
-- ==========================================

-- Información del cliente (denormalizada para búsqueda rápida)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS customer_name text;

-- Detalles del método de pago
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_method_type text, -- 'card', 'sepa_debit', 'paypal', etc.
  ADD COLUMN IF NOT EXISTS card_brand text,          -- 'visa', 'mastercard', 'amex'
  ADD COLUMN IF NOT EXISTS card_last4 text,          -- últimos 4 dígitos
  ADD COLUMN IF NOT EXISTS card_exp_month integer,
  ADD COLUMN IF NOT EXISTS card_exp_year integer;

-- Gestión de reembolsos
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS refunded boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS refund_amount numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_reason text,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;

-- Seguridad y detección de fraude (Stripe Radar)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS risk_level text,          -- 'normal', 'elevated', 'high'
  ADD COLUMN IF NOT EXISTS risk_score numeric(5,2);  -- 0-100

-- URLs de retorno (útil para debugging)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS success_url text,
  ADD COLUMN IF NOT EXISTS cancel_url text;

-- Timestamp de última actualización
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Comentarios sobre el pago
COMMENT ON COLUMN payments.customer_email IS 'Email del cliente denormalizado para búsqueda rápida sin JOIN';
COMMENT ON COLUMN payments.card_last4 IS 'Últimos 4 dígitos de la tarjeta (NUNCA guardar número completo)';
COMMENT ON COLUMN payments.risk_score IS 'Score de riesgo de Stripe Radar (0-100)';
COMMENT ON COLUMN payments.refunded IS 'Indica si el pago fue reembolsado total o parcialmente';

-- ==========================================
-- 2. TABLA ORDERS - Mejoras
-- ==========================================

-- Metadata para Stripe
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_metadata jsonb,    -- metadata personalizada enviada a Stripe
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Gestión de cancelaciones
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_deadline timestamptz, -- timeout para pagos pendientes
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text;

COMMENT ON COLUMN orders.stripe_metadata IS 'Metadata adicional sincronizada con Stripe (ej: campaign_id, utm_source)';
COMMENT ON COLUMN orders.payment_deadline IS 'Deadline para completar el pago (automático cancelar después)';

-- ==========================================
-- 3. TABLA STRIPE_EVENTS - Mejoras para logging
-- ==========================================

-- Relaciones directas para debugging
ALTER TABLE stripe_events
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES payments(id) ON DELETE SET NULL;

-- Gestión de errores y reintentos
ALTER TABLE stripe_events
  ADD COLUMN IF NOT EXISTS retries integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS processed_at timestamptz;

COMMENT ON COLUMN stripe_events.retries IS 'Número de veces que se ha reintentado procesar este webhook';
COMMENT ON COLUMN stripe_events.processed_at IS 'Timestamp de cuando se procesó exitosamente el evento';

-- ==========================================
-- 4. TABLA PAYMENT_ATTEMPTS (Nueva - Opcional pero recomendada)
-- ==========================================
-- Rastrea todos los intentos de pago, incluso los fallidos
-- Muy útil para analytics y mejorar conversión

CREATE TABLE IF NOT EXISTS payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  stripe_payment_intent_id text,
  
  -- Estado del intento
  status text NOT NULL, -- 'requires_payment_method', 'requires_confirmation', 'failed', 'succeeded'
  
  -- Detalles del fallo (si aplica)
  failure_code text,    -- 'card_declined', 'insufficient_funds', 'expired_card', etc.
  failure_message text,
  
  -- Metadata adicional
  metadata jsonb,
  attempted_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_order ON payment_attempts(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment ON payment_attempts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON payment_attempts(status);

COMMENT ON TABLE payment_attempts IS 'Log de todos los intentos de pago para analytics y debugging';

-- ==========================================
-- 5. ÍNDICES DE RENDIMIENTO
-- ==========================================
-- Optimizan queries comunes en producción

-- Payments: búsqueda por email
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments(customer_email);

-- Payments: filtrar por estado
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Payments: ordenar por fecha
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Payments: búsqueda por tarjeta (debugging)
CREATE INDEX IF NOT EXISTS idx_payments_card_last4 ON payments(card_last4) WHERE card_last4 IS NOT NULL;

-- Orders: filtrar por estado y fecha (query común en admin)
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Stripe Events: búsqueda por orden
CREATE INDEX IF NOT EXISTS idx_stripe_events_order ON stripe_events(order_id) WHERE order_id IS NOT NULL;

-- Stripe Events: búsqueda por payment
CREATE INDEX IF NOT EXISTS idx_stripe_events_payment ON stripe_events(payment_id) WHERE payment_id IS NOT NULL;

-- Stripe Events: eventos no procesados (para cronjobs de retry)
CREATE INDEX IF NOT EXISTS idx_stripe_events_status ON stripe_events(status) WHERE status != 'processed';

-- ==========================================
-- 6. FUNCIÓN PARA AUTO-UPDATE updated_at
-- ==========================================
-- Actualiza automáticamente el campo updated_at cuando cambia una fila

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a payments
DROP TRIGGER IF EXISTS set_updated_at ON payments;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger a orders
DROP TRIGGER IF EXISTS set_updated_at ON orders;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 7. CONSTRAINTS DE VALIDACIÓN
-- ==========================================

-- Validar que risk_score esté en rango válido
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_risk_score_range,
  ADD CONSTRAINT payments_risk_score_range 
  CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100));

-- Validar que refund_amount no sea mayor que amount
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_refund_amount_valid,
  ADD CONSTRAINT payments_refund_amount_valid 
  CHECK (refund_amount <= amount);

-- Validar que si hay refund_amount, refunded debe ser true
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_refund_consistency,
  ADD CONSTRAINT payments_refund_consistency 
  CHECK ((refund_amount > 0 AND refunded = true) OR (refund_amount = 0));

-- ==========================================
-- 8. VERIFICACIÓN DE MIGRACIÓN
-- ==========================================

-- Ejecuta esto después de aplicar la migración para verificar

DO $$
DECLARE
  v_count integer;
BEGIN
  -- Verificar que las columnas se crearon
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'payments'
    AND column_name IN ('customer_email', 'card_brand', 'card_last4', 'refunded', 'risk_level');
  
  IF v_count < 5 THEN
    RAISE EXCEPTION 'Migración incompleta: faltan columnas en tabla payments';
  ELSE
    RAISE NOTICE 'Migración exitosa: todas las columnas agregadas correctamente';
  END IF;
  
  -- Verificar que la tabla payment_attempts existe
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables
  WHERE table_name = 'payment_attempts';
  
  IF v_count = 0 THEN
    RAISE WARNING 'Tabla payment_attempts no creada';
  ELSE
    RAISE NOTICE 'Tabla payment_attempts creada exitosamente';
  END IF;
END $$;

-- ==========================================
-- FIN DE MIGRACIÓN
-- ==========================================

-- SIGUIENTE PASO: Ejecutar el archivo 02_rpc_functions.sql
