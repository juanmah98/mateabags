-- SQL listo para Supabase / Postgres
-- Crea las tablas necesarias para la tienda: productos, clientes (invitados), direcciones,
-- pedidos, items, pagos (Stripe), envíos (Seur), logs de eventos Stripe y cupones.
-- Ajustes posibles: cambiar gen_random_uuid() por uuid_generate_v4() si usas otra extensión.

-- Extensiones (Supabase suele tener pgcrypto disponible)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================
-- Tablas principales
-- ======================================

-- CUSTOMERS: almacenamos al comprador aunque sea 'guest' (no login)
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  phone text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ADDRESSES: direcciones de envío/facturación
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'shipping', -- 'shipping'|'billing'
  label text,                              -- p.ej. 'Casa', 'Trabajo'
  recipient_name text,                     -- nombre del destinatario si difiere
  line1 text,
  line2 text,
  city text,
  state text,
  postcode text,
  country text DEFAULT 'ES',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);

-- PRODUCTS: inicialmente un producto, pero estructura soporta N
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL, -- precio ya con impuestos si así lo decides
  currency text NOT NULL DEFAULT 'EUR',
  stock integer DEFAULT 0,
  active boolean DEFAULT true,
  metadata jsonb,                 -- campo libre para atributos futuros
  created_at timestamptz DEFAULT now()
);

-- ORDERS: cabecera de pedido
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  shipping_address_id uuid REFERENCES addresses(id) ON DELETE SET NULL,
  billing_address_id uuid REFERENCES addresses(id) ON DELETE SET NULL,
  subtotal_amount numeric(10,2),   -- suma de items antes de descuentos
  discount_amount numeric(10,2) DEFAULT 0, -- total descontado por cupones
  shipping_cost numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL, -- total final cobrado (incluye impuestos si aplica)
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending', -- pending|paid|processing|shipped|delivered|cancelled|refunded
  note text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- ORDER_ITEMS: soporta multiples items por pedido
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  title text,          -- título desnormalizado al momento de la compra
  sku text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL, -- precio por unidad al momento de la compra
  total_price numeric(10,2) NOT NULL -- unit_price * quantity (guardar para histórico)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- PAYMENTS: registro de pagos procesados con Stripe
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'requires_payment_method', -- conforme stripe
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  stripe_charge_id text,
  payment_method text,
  stripe_raw jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_pi ON payments(stripe_payment_intent_id);

-- SHIPMENTS: envíos manuales gestionados (carrier = SEUR por defecto)
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  carrier text NOT NULL DEFAULT 'SEUR',
  service text,             -- "standard", "express", etc.
  tracking_number text,
  cost numeric(10,2) DEFAULT 0,
  status text DEFAULT 'ready', -- ready|collected|in_transit|delivered|failed
  label_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);

-- STRIPE_EVENTS: log de webhooks/discordantes para conciliación
CREATE TABLE IF NOT EXISTS stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE,
  kind text,
  payload jsonb,
  status text DEFAULT 'received', -- received|processed|error
  received_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stripe_events_kind ON stripe_events(kind);

-- ======================================
-- CUPOES y relación con pedidos
-- ======================================

-- COUPONS: códigos canjeables
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,           -- p.ej. 'BLACKFRIDAY'
  description text,
  kind text NOT NULL DEFAULT 'amount', -- 'amount' | 'percent'
  value numeric(10,2) NOT NULL,       -- si kind='percent' guardar 0..100
  active boolean DEFAULT true,
  usage_limit integer DEFAULT NULL,   -- NULL = ilimitado
  times_redeemed integer DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- ORDER_COUPONS: relación N:N (un pedido puede tener 0..n cupones aplicados)
-- Guardamos el monto descontado para auditoría
CREATE TABLE IF NOT EXISTS order_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  coupon_id uuid REFERENCES coupons(id) ON DELETE SET NULL,
  discount_amount numeric(10,2) NOT NULL,
  applied_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_coupons_order ON order_coupons(order_id);

-- ======================================
-- RESTRICCIONES/CONSTRAINTS UTILES
-- ======================================

-- Asegurar que subtotal + shipping - discount = total (no estrictamente obligatorio,
-- pero útil para detectar inconsistencia. Se usa un trigger idealmente para validarlo en app).

-- ======================================
-- EJEMPLOS DE INSERT (opcional, para pruebas)
-- ======================================

-- Insertar producto de ejemplo
INSERT INTO products (sku, title, description, price, currency, stock, active)
VALUES ('SKU-PRIMERO', 'Producto inicial', 'Descripción del producto inicial', 49.90, 'EUR', 100, true)
ON CONFLICT (sku) DO NOTHING;

-- Fin del script

-- NOTAS:
-- 1) RLS (Row Level Security): en Supabase deberías crear políticas que permitan:
--    - Lectura pública de productos (SELECT) para mostrar en la store.
--    - Inserción pública limitada en orders, customers, addresses (para checkout sin login).
--    - Restricción de UPDATE/DELETE solo para roles administrativos en panel.
-- 2) Considera encapsular la creación de orden + items + llamada a Stripe en una función RPC
--    para mantener atomicidad y evitar inconsistencias si alguna parte falla.
-- 3) Guarda el payload crudo de Stripe en stripe_events y en payments.stripe_raw para conciliación.

-- Si quieres que genere también las políticas RLS recomendadas (SQL) lo agrego al archivo.

-- Añadir campos para gift a order_items
ALTER TABLE order_items
  ADD COLUMN is_gift boolean DEFAULT false NOT NULL,
  ADD COLUMN gift_message text;

-- Limitar longitud del mensaje (ej. máximo 500 caracteres)
ALTER TABLE order_items
  ADD CONSTRAINT order_items_gift_message_length CHECK (gift_message IS NULL OR char_length(gift_message) <= 500);

-- Índice opcional si vas a filtrar/listar pedidos con regalo
CREATE INDEX IF NOT EXISTS idx_order_items_is_gift ON order_items(is_gift);

Nota: is_gift se crea con DEFAULT false y NOT NULL, por lo que las filas existentes quedarán con false. gift_message queda NULL por defecto.