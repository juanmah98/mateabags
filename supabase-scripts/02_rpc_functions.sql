-- =====================================================
-- FUNCIONES RPC PARA STRIPE
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =====================================================
-- Funciones que se llaman desde el frontend de forma segura
-- =====================================================

-- ==========================================
-- 1. FUNCIÓN: validate_coupon
-- ==========================================
-- Valida un código de cupón y calcula el descuento
-- Uso: await supabase.rpc('validate_coupon', { p_code: 'BLACKFRIDAY', p_subtotal: 49.90 })

CREATE OR REPLACE FUNCTION validate_coupon(
  p_code text,
  p_subtotal numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon record;
  v_discount numeric;
BEGIN
  -- Validar inputs
  IF p_code IS NULL OR p_code = '' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Código de cupón requerido'
    );
  END IF;
  
  IF p_subtotal IS NULL OR p_subtotal <= 0 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Subtotal inválido'
    );
  END IF;
  
  -- Buscar cupón activo y vigente
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = UPPER(p_code) -- Normalizar a mayúsculas
    AND active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (expires_at IS NULL OR expires_at > now())
    AND (usage_limit IS NULL OR times_redeemed < usage_limit);
  
  -- Si no existe o no es válido
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Cupón no válido, expirado o alcanzó el límite de uso'
    );
  END IF;
  
  -- Calcular descuento según el tipo
  IF v_coupon.kind = 'percent' THEN
    -- Descuento porcentual
    v_discount := ROUND((p_subtotal * v_coupon.value / 100), 2);
  ELSIF v_coupon.kind = 'amount' THEN
    -- Descuento fijo
    v_discount := v_coupon.value;
  ELSE
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Tipo de cupón no reconocido'
    );
  END IF;
  
  -- El descuento no puede ser mayor que el subtotal
  IF v_discount > p_subtotal THEN
    v_discount := p_subtotal;
  END IF;
  
  -- Retornar cupón válido con detalles
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'description', v_coupon.description,
    'kind', v_coupon.kind,
    'value', v_coupon.value,
    'discount_amount', v_discount,
    'subtotal', p_subtotal,
    'new_total', p_subtotal - v_discount
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Error al validar cupón'
    );
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION validate_coupon IS 'Valida un código de cupón y calcula el descuento aplicable';

-- ==========================================
-- 2. FUNCIÓN: get_order_status
-- ==========================================
-- Obtiene el estado completo de una orden con todos sus detalles
-- Uso: await supabase.rpc('get_order_status', { p_order_id: 'uuid-here' })

CREATE OR REPLACE FUNCTION get_order_status(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_order_exists boolean;
BEGIN
  -- Verificar que la orden existe
  SELECT EXISTS(SELECT 1 FROM orders WHERE id = p_order_id) INTO v_order_exists;
  
  IF NOT v_order_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Orden no encontrada'
    );
  END IF;
  
  -- Construir respuesta completa
  SELECT jsonb_build_object(
    'success', true,
    'order', jsonb_build_object(
      'id', o.id,
      'status', o.status,
      'subtotal_amount', o.subtotal_amount,
      'discount_amount', o.discount_amount,
      'shipping_cost', o.shipping_cost,
      'total_amount', o.total_amount,
      'currency', o.currency,
      'note', o.note,
      'created_at', o.created_at,
      'updated_at', o.updated_at
    ),
    'customer', jsonb_build_object(
      'name', c.name,
      'email', c.email,
      'phone', c.phone
    ),
    'shipping_address', jsonb_build_object(
      'recipient_name', a.recipient_name,
      'line1', a.line1,
      'line2', a.line2,
      'city', a.city,
      'state', a.state,
      'postcode', a.postcode,
      'country', a.country
    ),
    'items', (
      SELECT jsonb_agg(jsonb_build_object(
        'title', oi.title,
        'sku', oi.sku,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'total_price', oi.total_price,
        'is_gift', oi.is_gift,
        'gift_message', oi.gift_message
      ))
      FROM order_items oi
      WHERE oi.order_id = o.id
    ),
    'payment', (
      SELECT jsonb_build_object(
        'status', p.status,
        'amount', p.amount,
        'currency', p.currency,
        'card_brand', p.card_brand,
        'card_last4', p.card_last4,
        'created_at', p.created_at
      )
      FROM payments p
      WHERE p.order_id = o.id
      ORDER BY p.created_at DESC
      LIMIT 1
    ),
    'shipment', (
      SELECT jsonb_build_object(
        'carrier', s.carrier,
        'tracking_number', s.tracking_number,
        'status', s.status,
        'shipped_at', s.shipped_at,
        'delivered_at', s.delivered_at
      )
      FROM shipments s
      WHERE s.order_id = o.id
      ORDER BY s.created_at DESC
      LIMIT 1
    )
  ) INTO v_result
  FROM orders o
  LEFT JOIN customers c ON c.id = o.customer_id
  LEFT JOIN addresses a ON a.id = o.shipping_address_id
  WHERE o.id = p_order_id;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Error al obtener estado de orden'
    );
END;
$$;

COMMENT ON FUNCTION get_order_status IS 'Obtiene el estado completo de una orden incluyendo customer, address, items, payment y shipment';

-- ==========================================
-- 3. FUNCIÓN: increment_coupon_usage
-- ==========================================
-- Incrementa el contador de uso de un cupón (llamada por Edge Function)
-- NO exponer directamente al frontend

CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE coupons
  SET times_redeemed = times_redeemed + 1
  WHERE id = p_coupon_id
    AND (usage_limit IS NULL OR times_redeemed < usage_limit);
  
  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION increment_coupon_usage IS 'Incrementa el contador de uso de un cupón (solo para Edge Functions con service_role)';

-- ==========================================
-- 4. FUNCIÓN: mark_order_as_paid
-- ==========================================
-- Marca una orden como pagada y actualiza el payment
-- Llamada desde webhook de Stripe

CREATE OR REPLACE FUNCTION mark_order_as_paid(
  p_order_id uuid,
  p_payment_intent_id text,
  p_payment_details jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_id uuid;
BEGIN
  -- Actualizar orden a paid
  UPDATE orders
  SET status = 'paid',
      updated_at = now()
  WHERE id = p_order_id
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Orden % no encontrada o no está en estado pending', p_order_id;
    RETURN false;
  END IF;
  
  -- Actualizar payment
  UPDATE payments
  SET status = 'succeeded',
      stripe_payment_intent_id = COALESCE(p_payment_intent_id, stripe_payment_intent_id),
      card_brand = COALESCE(p_payment_details->>'card_brand', card_brand),
      card_last4 = COALESCE(p_payment_details->>'card_last4', card_last4),
      payment_method_type = COALESCE(p_payment_details->>'payment_method_type', payment_method_type),
      updated_at = now()
  WHERE order_id = p_order_id;
  
  -- Crear shipment por defecto si no existe
  IF NOT EXISTS(SELECT 1 FROM shipments WHERE order_id = p_order_id) THEN
    INSERT INTO shipments (order_id, carrier, status)
    VALUES (p_order_id, 'SEUR', 'ready');
  END IF;
  
  RETURN true;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error al marcar orden como pagada: %', SQLERRM;
    RETURN false;
END;
$$;

COMMENT ON FUNCTION mark_order_as_paid IS 'Marca una orden como pagada y actualiza detalles del pago (webhook)';

-- ==========================================
-- 5. FUNCIÓN: cancel_expired_orders
-- ==========================================
-- Cancela órdenes pendientes que excedieron el deadline de pago
-- Ejecutar periódicamente con cronjob

CREATE OR REPLACE FUNCTION cancel_expired_orders()
RETURNS TABLE(cancelled_order_id uuid, customer_email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE orders o
  SET status = 'cancelled',
      cancelled_at = now(),
      cancellation_reason = 'Payment deadline exceeded'
  FROM customers c
  WHERE o.customer_id = c.id
    AND o.status = 'pending'
    AND o.payment_deadline IS NOT NULL
    AND o.payment_deadline < now()
  RETURNING o.id, c.email;
END;
$$;

COMMENT ON FUNCTION cancel_expired_orders IS 'Cancela órdenes pendientes que excedieron el deadline de pago';

-- ==========================================
-- PERMISOS Y SEGURIDAD
-- ==========================================

-- Revocar permisos por defecto
REVOKE ALL ON FUNCTION validate_coupon FROM PUBLIC;
REVOKE ALL ON FUNCTION get_order_status FROM PUBLIC;
REVOKE ALL ON FUNCTION increment_coupon_usage FROM PUBLIC;
REVOKE ALL ON FUNCTION mark_order_as_paid FROM PUBLIC;
REVOKE ALL ON FUNCTION cancel_expired_orders FROM PUBLIC;

-- Permitir solo a roles autenticados y anon (para frontend)
GRANT EXECUTE ON FUNCTION validate_coupon TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_order_status TO anon, authenticated;

-- Solo service_role (Edge Functions) puede llamar estas funciones
GRANT EXECUTE ON FUNCTION increment_coupon_usage TO service_role;
GRANT EXECUTE ON FUNCTION mark_order_as_paid TO service_role;
GRANT EXECUTE ON FUNCTION cancel_expired_orders TO service_role;

-- ==========================================
-- FIN DE RPC FUNCTIONS
-- ==========================================

-- SIGUIENTE PASO: Ejecutar el archivo 03_rls_policies.sql
