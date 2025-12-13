Descripción y contexto (en español) de las tablas — Tienda Schema Supabase SQL

Perfecto — te doy una visión práctica de cada tabla y cómo las vas a usar desde el frontend (componentes, servicios, payloads, y notas de seguridad / RLS). Esto te servirá para diseñar componentes Angular y el servicio que hable con Supabase + tu backend para Stripe.

Resumen rápido (qué hace cada tabla)

products: catálogo público de productos que se muestran en la tienda.

customers: datos del comprador (aunque sea guest). Se crea una fila por compra para poder enviar emails, facturas, etc.

addresses: direcciones asociadas a customers (envío/facturación).

orders: cabecera del pedido (totales, estado, referencias a customer y dirección).

order_items: items detallados por pedido (producto, cantidad, precio histórico).

payments: información del pago (Stripe ids, estado, payload crudo).

shipments: información del envío (SEUR): tracking, estado, coste.

stripe_events: log de webhooks de Stripe para conciliación/debug.

coupons: códigos de descuento (tipo amount o percent).

order_coupons: relación entre pedido y cupones aplicados (con importe descontado real).

Detalle por tabla — campos clave y cómo usarlos desde el frontend
products

Campos principales: id, sku, title, description, price, currency, stock, active, metadata.

Uso frontend:

Componente: ProductListComponent, ProductDetailComponent.

Llamada típica (supabase-js): supabase.from('products').select('*').eq('active', true);

Mostrar: title, price, description, stock (si quieres bloquear compra si stock = 0).

Notas: público SELECT permitido. NO permitir inserts/updates desde cliente (solo admin).

customers

Campos: id, name, email, phone, stripe_customer_id, created_at.

Uso frontend:

En checkout, crear un customer guest con insert.

Mantener email/phone para envío de confirmación.

Llamada típica: supabase.from('customers').insert({ name, email, phone })

RLS: permitir INSERT público limitado (checkout). SELECT/UPDATE solo admins o por token (para panel administrativo).

addresses

Campos: id, customer_id, kind, label, recipient_name, line1, line2, city, state, postcode, country.

Uso frontend:

Formulario de envío; crear antes de crear la order o incluir dentro de la RPC.

Insert: supabase.from('addresses').insert({ customer_id, kind:'shipping', ... })

Notas: cliente puede insertar direcciones; lectura/edición en panel admin sólo por roles.

orders

Campos clave: id, customer_id, shipping_address_id, subtotal_amount, discount_amount, shipping_cost, total_amount, currency, status, created_at.

Uso frontend:

No es recomendable que el cliente construya y haga INSERT por separado para evitar inconsistencias. Mejor usar una RPC (create_order) o backend que haga: crear customer -> create address -> create order -> create order_items -> crear sesión de pago en Stripe y devolver checkout_session_url.

Si decides insertar desde frontend: insertar orders + order_items en una transacción atómica (mejor por backend).

Estados típicos: pending, paid, processing, shipped, delivered, cancelled.

Lectura para usuario: SELECT por id o por email (si permites).

order_items

Campos: id, order_id, product_id, title, sku, quantity, unit_price, total_price.

Uso frontend:

No se edita desde frontend después de creado el pedido.

Se muestra en OrderConfirmationComponent / OrderHistory (si existiera).

Nota: desnormalizamos title/sku/unit_price para mantener historial.

payments

Campos: id, order_id, amount, currency, status, stripe_payment_intent_id, stripe_checkout_session_id, stripe_charge_id, stripe_raw, created_at.

Uso frontend:

NO escribas este registro con información sensible desde cliente (salvo si tu flujo lo exige). Normalmente lo crea tu backend cuando Stripe confirma pago (webhook) o lo actualiza.

Después del checkout se puede consultar estado: supabase.from('payments').select('*').eq('order_id', orderId)

Seguridad: claves Stripe y confirmaciones siempre en servidor (webhook / RPC server).

shipments

Campos: id, order_id, carrier (SEUR), service, tracking_number, cost, status, label_url, shipped_at, delivered_at.

Uso frontend:

Panel admin para crear/editar envíos (tracking). En la store pública solo lectura del tracking_number una vez creado (si quieres mostrarlo).

Inserciones/updates solo admin.

stripe_events

Campos: id, stripe_event_id, kind, payload, status, received_at.

Uso: sólo backend (registro de webhooks). No exponer al frontend.

coupons

Campos: id, code, description, kind (amount|percent), value, active, usage_limit, times_redeemed, starts_at, expires_at.

Uso frontend:

Campo en checkout para introducir code.

Validación: mejor por RPC o backend (validate_coupon(code, subtotal)) para evitar manipulación.

Ejemplo flujo: el frontend pide a validate_coupon y recibe discount_amount y new_total.

Seguridad: permitir SELECT público para mostrar si hay promos (opcional). Aplicación y decremento de times_redeemed por backend.

order_coupons

Campos: id, order_id, coupon_id, discount_amount, applied_at.

Uso: creado por backend o RPC cuando se aplica el cupón y se crea el pedido; guardamos el monto real descontado.

Recomendaciones de arquitectura frontend (componentes y servicios)
Componentes sugeridos

ProductListComponent — muestra productos (from products).

ProductDetailComponent — detalle producto + añadir al carrito.

CartComponent — repaso de items, aplicar cupón (llama validate_coupon), calcular subtotal.

CheckoutComponent — formulario con datos: nombre, email, teléfono, dirección (puede crearse customer + address).

PaymentRedirectService / PaymentComponent — redirige a Stripe Checkout (recibe url desde backend/RPC).

OrderConfirmationComponent — muestra resumen final + número de pedido.

AdminOrderListComponent — panel admin para ver/editar pedidos, pagos y envíos.

AdminShipmentComponent — crear/editar envíos SEUR.

Servicios Angular (ideas)

ProductsService — getProducts(), getProductById(id).

CheckoutService — createGuestCustomer(data), createOrder(payload) (ideal: single RPC).

CouponService — validateCoupon(code, subtotal) (RPC).

PaymentsService — createCheckoutSession(orderId) (server) / getPaymentStatus(orderId) (client polls or webhook updates DB).

AdminService — acciones admin: listOrders, updateOrderStatus, createShipment.

Ejemplos de interfaces TypeScript (para Angular)
// models.ts
export interface Product {
  id: string;
  sku?: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  stock?: number;
  active?: boolean;
  metadata?: any;
}

export interface Customer {
  id?: string;
  name?: string;
  email: string;
  phone?: string;
}

export interface Address {
  id?: string;
  customer_id?: string;
  kind?: 'shipping' | 'billing';
  label?: string;
  recipient_name?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postcode: string;
  country?: string;
}

export interface OrderItemDTO {
  product_id: string;
  title: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateOrderPayload {
  customer: Customer;        // datos del comprador
  address: Address;         // dirección de envío
  items: OrderItemDTO[];    // items del carrito
  coupon_code?: string|null;
  shipping_cost?: number;
  currency?: string;
  note?: string;
}

Ejemplos prácticos de llamadas (supabase-js) — flujo recomendado

Recomendación fuerte: encapsular todo en una RPC o backend para que la creación del pedido sea atómica y se invoque Stripe desde servidor.

1) Validar cupón (RPC sugerido)
// Llamada al RPC que valida y devuelve discount_amount
const { data, error } = await supabase
  .rpc('validate_coupon', { p_code: 'BLACKFRIDAY', p_subtotal: 49.9 });

2) Crear orden (opción simple — mejor por RPC en backend)
// SI decides hacerlo desde frontend (menos recomendado)
const { data: customer } = await supabase
  .from('customers').insert([{ name, email, phone }]).select().single();

const { data: address } = await supabase
  .from('addresses').insert([{ customer_id: customer.id, kind:'shipping', ... }]).select().single();

// crear order
const { data: order } = await supabase
  .from('orders').insert([{
    customer_id: customer.id,
    shipping_address_id: address.id,
    subtotal_amount,
    discount_amount,
    shipping_cost,
    total_amount
  }]).select().single();

// crear order_items (varios)
await supabase.from('order_items').insert(items.map(i => ({
  order_id: order.id, product_id: i.product_id, title: i.title, sku: i.sku,
  quantity: i.quantity, unit_price: i.unit_price, total_price: i.total_price
})));

3) Mejor opción: create_order RPC (server-side)

RPC recibe CreateOrderPayload, hace:

crear customers (si no existe),

crear addresses,

crear orders,

crear order_items,

aplicar coupon (actualizar coupon.times_redeemed, insert en order_coupons),

calcular total y devolver order.id y la URL de Stripe Checkout (o PaymentIntent client_secret).

Desde Angular: supabase.rpc('create_order', payload) o POST a tu backend.

Políticas RLS y seguridad (resumen práctico)

Public:

products: SELECT público.

coupons: SELECT público si quieres mostrarlos; la validación y times_redeemed se hace en backend.

Insert desde web (guest):

Permitir INSERT en customers, addresses, orders, order_items solo si proviene del anon role y con checks (por ejemplo request.auth.role = 'anon' OR permitir solo INSERT y no SELECT).

Mejor: permitir INSERT limitado (solo crear) y no permitir UPDATE/DELETE.

Privado (solo admin):

payments, shipments, stripe_events, products INSERT/UPDATE/DELETE, orders UPDATE deben estar restringidos a roles admin.

Stripe:

Todas las interacciones sensibles (creación de Checkout Session, manejo de webhooks, actualización de payments) en servidor. No expongas claves.

Payload de ejemplo para la RPC create_order (lo que tu servicio frontend enviaría)
{
  "customer": { "name": "María Gómez", "email": "maria.gomez@example.com", "phone": "+34 600 123 456" },
  "address": {
    "kind": "shipping",
    "label": "Casa",
    "recipient_name": "María Gómez",
    "line1": "Calle Mayor 12",
    "line2": "3ºB",
    "city": "Madrid",
    "state": "Madrid",
    "postcode": "28013",
    "country": "ES"
  },
  "items": [
    { "product_id": "3f2504e0-4f89-11d3-9a0c-0305e82c3301", "title": "Producto inicial", "sku": "SKU-PRIMERO", "quantity": 1, "unit_price": 49.90, "total_price": 49.90 }
  ],
  "coupon_code": null,
  "shipping_cost": 5.00,
  "currency": "EUR",
  "note": "Compra sin cuenta - envío estándar SEUR"
}


La RPC devolvería, por ejemplo:

{
  "order_id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  "total_amount": 54.90
}
