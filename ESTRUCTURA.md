# Estructura del Proyecto Mateabags - Angular 19

## 📁 Organización de Carpetas

```
src/app/
├── config/                    # Configuraciones y constantes
│   └── constants.ts          # Constantes, mensajes de error/éxito, etiquetas
│
├── core/                      # Módulo Core (Singleton Services)
│   ├── guards/               # Guards de navegación
│   │   ├── auth.guard.ts        # Protección de rutas admin (deprecated)
│   │   ├── admin.guard.ts       # Protección de rutas admin
│   │   └── home-date.guard.ts   # Control temporal de home por fecha
│   ├── interceptors/        # Interceptors HTTP
│   │   ├── auth.interceptor.ts     # Añade tokens a peticiones
│   │   ├── error.interceptor.ts    # Manejo centralizado de errores
│   │   └── loading.interceptor.ts  # Indicadores de carga
│   ├── services/            # Servicios singleton
│   │   ├── auth.service.ts         # Gestión de autenticación (Supabase Auth)
│   │   ├── storage.service.ts      # localStorage/sessionStorage
│   │   ├── notification.service.ts # Sistema de notificaciones
│   │   ├── loading.service.ts      # Estado de carga global
│   │   └── supabase.service.ts     # Cliente de Supabase
│   └── index.ts             # Barrel exports
│
├── models/                   # Modelos e Interfaces TypeScript
│   ├── enums.ts             # Enumeraciones (Status, Currency, etc.)
│   ├── common.model.ts      # Interfaces comunes (ApiResponse, etc.)
│   ├── product.model.ts     # Modelos de productos
│   ├── customer.model.ts    # Modelos de clientes
│   ├── address.model.ts     # Modelos de direcciones
│   ├── order.model.ts       # Modelos de pedidos
│   ├── payment.model.ts     # Modelos de pagos
│   ├── coupon.model.ts      # Modelos de cupones
│   ├── shipment.model.ts    # Modelos de envíos
│   ├── checkout.model.ts    # Modelos del flujo de checkout
│   └── index.ts             # Barrel exports
│
├── features/                 # Módulos por Feature
│   ├── products/
│   │   ├── services/
│   │   │   └── products.service.ts  # CRUD de productos
│   │   └── index.ts
│   ├── checkout/
│   │   ├── services/
│   │   │   ├── cart.service.ts      # Gestión del carrito
│   │   │   ├── checkout.service.ts  # Proceso de checkout
│   │   │   ├── coupon.service.ts    # Validación de cupones
│   │   │   └── payment.service.ts   # Integración Stripe
│   │   └── index.ts
│   └── admin/
│       ├── services/
│       │   ├── admin-orders.service.ts    # Gestión de pedidos (admin)
│       │   └── admin-shipments.service.ts # Gestión de envíos SEUR
│       └── index.ts
│
├── shared/                   # Componentes, Pipes y Directivas Reutilizables
│   ├── components/
│   │   ├── loading-spinner/
│   │   │   └── loading-spinner.component.ts
│   │   └── toast/
│   │       └── toast.component.ts
│   ├── pipes/
│   │   ├── currency-format.pipe.ts  # Formateo de moneda (EUR)
│   │   └── date-format.pipe.ts      # Formateo de fechas (ES)
│   └── index.ts
│
├── routes/                   # Componentes de páginas/rutas
│   ├── home/
│   ├── product-sale/
│   ├── waitlist/
│   └── admin/                       # Panel de Administración
│       ├── admin-login/            # Login de administradores
│       ├── admin-layout/           # Layout del panel con sidebar
│       ├── admin-dashboard/        # Dashboard con estadísticas
│       ├── admin-customers/        # Gestión de clientes
│       ├── admin-sales/            # Gestión de ventas
│       └── admin-emails/           # Envío masivo de emails
│
└── layout/                   # Componentes de layout
```

## 🎯 Patrones de Uso

### 1. Importar Modelos

```typescript
// Importar todo desde el barrel
import { Product, Customer, OrderStatus, ApiResponse } from '@app/models';

// O importar específico
import { Product } from '@app/models/product.model';
```

### 2. Usar Servicios Core

```typescript
import { AuthService, NotificationService } from '@app/core';

constructor(
  private authService: AuthService,
  private notifications: NotificationService
) {}

// Usar servicios
this.authService.login('MATEA2025');
this.notifications.success('¡Operación exitosa!');
```

### 3. Usar Feature Services

```typescript
import { ProductsService } from '@app/features/products';
import { CartService } from '@app/features/checkout';

constructor(
  private productsService: ProductsService,
  private cartService: CartService
) {}

// Listar productos
this.productsService.getProducts().subscribe(response => {
  if (response.success && response.data) {
    this.products = response.data;
  }
});

// Añadir al carrito
this.cartService.addItem(product, 1);
```

### 4. Proteger Rutas con Guards

```typescript
// En app.routes.ts
import { authGuard, adminGuard } from '@app/core';

const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    component: AdminComponent
  }
];
```

### 5. Usar Componentes Shared

```typescript
import { LoadingSpinnerComponent, ToastComponent } from '@app/shared';
import { CurrencyFormatPipe, DateFormatPipe } from '@app/shared';

@Component({
  standalone: true,
  imports: [LoadingSpinnerComponent, CurrencyFormatPipe]
})
```

### 6. Usar Constantes

```typescript
import { APP_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@app/config/constants';

// Usar constantes
const maxItems = APP_CONSTANTS.MAX_CART_ITEMS;
this.notifications.error(ERROR_MESSAGES.CART_EMPTY);
```

## 🔐 Autenticación

### AuthService (Supabase Auth)

```typescript
// Login de administrador con email y contraseña
this.authService.loginAdmin(email, password).subscribe(result => {
  if (result.success) {
    // Redirigir al panel admin
    this.router.navigate(['/admin/dashboard']);
  } else {
    this.notifications.error(result.error);
  }
});

// Logout
this.authService.logout().subscribe(() => {
  this.router.navigate(['/admin/login']);
});

// Verificar autenticación
if (this.authService.isAuthenticated()) {
  // Usuario autenticado
}

// Verificar si es admin
if (this.authService.isAdmin()) {
  // Es administrador
}

// Obtener usuario actual
const user = this.authService.getCurrentUser();
console.log(user?.email);

// Observar estado
this.authService.authState.subscribe(state => {
  console.log('Authenticated:', state.isAuthenticated);
  console.log('Admin:', state.isAdmin);
  console.log('User:', state.user);
});
```

**Nota**: La autenticación es **solo para administradores**. Los clientes compran sin login (guest checkout).

## 🛒 Carrito de Compras

### CartService

```typescript
// Añadir producto
this.cartService.addItem(product, quantity);

// Actualizar cantidad
this.cartService.updateQuantity(productId, newQuantity);

// Eliminar producto
this.cartService.removeItem(productId);

// Aplicar cupón
this.cartService.applyDiscount(10.50, 'BLACKFRIDAY');

// Observar carrito
this.cartService.cart.subscribe(cart => {
  console.log('Total:', cart.total);
  console.log('Items:', cart.itemCount);
});

// Limpiar carrito
this.cartService.clearCart();
```

## 💳 Proceso de Checkout

### Flujo completo

```typescript
// 1. Validar cupón (opcional)
this.couponService.validateCoupon(code, subtotal).subscribe(result => {
  if (result.success && result.data?.valid) {
    this.cartService.applyDiscount(result.data.discount_amount, code);
  }
});

// 2. Crear pedido
const payload: CreateOrderPayload = {
  customer: { name, email, phone },
  address: { /* dirección */ },
  items: cartItems,
  coupon_code: appliedCoupon,
  shipping_cost: 5.00,
  currency: Currency.EUR
};

this.checkoutService.createOrder(payload).subscribe(response => {
  if (response.success && response.data) {
    // 3. Redirigir a Stripe Checkout
    this.paymentService.redirectToCheckout(response.data.checkout_url);
  }
});
```

## 📊 Panel de Administración

### Login de Administrador

```typescript
// Ruta: /admin/login
// Autenticación con Supabase Auth (email + contraseña)

this.authService.loginAdmin(email, password).subscribe(result => {
  if (result.success) {
    this.router.navigate(['/admin/dashboard']);
  }
});
```

### Dashboard de Estadísticas

```typescript
// Ruta: /admin/dashboard
// Muestra stats en tiempo real desde Supabase

- Total Waitlist (tabla waitlist)
- Total Clientes (tabla customers)
- Total Ventas (tabla orders)
- Pedidos Pendientes (orders con status='pending')
- Gráfico de últimos 7 días de waitlist
```

### Gestión de Clientes

```typescript
// Ruta: /admin/customers
// Lista de todos los clientes

- ID, Nombre, Email, Teléfono, Fecha
- Ordenados por fecha de creación
- Tabla scrolleable
```

### Gestión de Ventas

```typescript
// Ruta: /admin/sales
// Lista de pedidos/ventas

- Badges con resumen (Total, Enviados, Pendientes)
- Join con tabla customers
- Estados visuales con colores
- Filtros por estado
```

### Envío de Emails

```typescript
// Ruta: /admin/emails
// Gestión de envíos masivos a waitlist

- Lista completa de suscriptores waitlist
- Botón de envío masivo (preparado para edge function)
- Total de suscriptores
- Tabla scrolleable con nombres, emails, códigos

// TODO: Implementar edge function en Supabase
// this.supabaseService['supabase']
//   .functions.invoke('send-mass-email', { body: { subscribers } })
```

### Gestionar Pedidos

```typescript
// Listar pedidos
this.adminOrdersService.listOrders(page, pageSize, OrderStatus.PENDING)
  .subscribe(response => {
    if (response.success && response.data) {
      this.orders = response.data.data;
      this.totalOrders = response.data.total;
    }
  });

// Actualizar estado
this.adminOrdersService.updateOrderStatus(orderId, {
  status: OrderStatus.SHIPPED,
  note: 'Enviado vía SEUR'
}).subscribe(/* ... */);
```

### Gestionar Envíos

```typescript
// Crear envío
this.adminShipmentsService.createShipment({
  order_id: orderId,
  carrier: ShippingCarrier.SEUR,
  tracking_number: 'SEUR123456',
  cost: 5.00
}).subscribe(/* ... */);

// Actualizar tracking
this.adminShipmentsService.updateTracking(shipmentId, {
  tracking_number: 'SEUR123456',
  status: ShipmentStatus.IN_TRANSIT
}).subscribe(/* ... */);
```

## 🎨 Componentes Shared

### Loading Spinner

```html
<app-loading-spinner 
  [show]="isLoading" 
  [size]="'md'"
  [message]="'Cargando productos...'"
  [overlay]="true">
</app-loading-spinner>
```

### Toast Notifications

```typescript
// Desde servicio
this.notificationService.success('Producto añadido al carrito');
this.notificationService.error('Error al procesar el pago');
this.notificationService.warning('Stock limitado');
this.notificationService.info('Nueva actualización disponible');
```

### Pipes

```html
<!-- Formatear moneda -->
<p>Precio: {{ product.price | currencyFormat }}</p>
<!-- Output: 49,90 € -->

<!-- Formatear fecha -->
<p>Fecha: {{ order.created_at | dateFormat:'long' }}</p>
<!-- Output: 13 de diciembre de 2025, 12:30 -->
```

## 🔄 Interceptors

Los interceptors están configurados automáticamente en `app.config.ts`:

1. **AuthInterceptor**: Añade automáticamente tokens de autenticación
2. **ErrorInterceptor**: Maneja errores HTTP y muestra notificaciones
3. **LoadingInterceptor**: Gestiona el estado de carga global

## 📝 Convenciones

1. **Servicios**: Usar `providedIn: 'root'` para singleton
2. **Componentes**: Usar standalone components
3. **Estados**: Usar BehaviorSubject para estado reactivo
4. **Errores**: Usar ApiResponse<T> para respuestas tipadas
5. **Imports**: Usar barrel exports (index.ts) para imports limpios

## 🚀 Estado del Proyecto

### ✅ Completado

1. ✅ **Panel de Administración**
   - Login con Supabase Auth
   - Dashboard con estadísticas en tiempo real
   - Gestión de clientes
   - Gestión de ventas
   - Envío masivo de emails (UI lista, edge function pendiente)

2. ✅ **Autenticación**
   - Supabase Auth para administradores
   - Persistencia de sesión automática
   - Guards async para protección de rutas
   - Guest checkout para clientes (sin login)

3. ✅ **Estructura Escalable**
   - Core module con servicios singleton
   - Feature modules por dominio
   - Shared components reutilizables
   - Models con TypeScript type-safe
   - Interceptors HTTP globales

### 🔄 Próximos Pasos

1. **Edge Functions en Supabase**:
   - `send-mass-email` - Envío masivo a waitlist
   - `validate_coupon(p_code, p_subtotal)`
   - `create_order(payload)`
   - `create_checkout_session(p_order_id, p_success_url, p_cancel_url)`

2. **Políticas RLS en Supabase** para cada tabla

3. **Componentes de E-commerce**:
   - ProductListComponent
   - ProductDetailComponent
   - CartComponent
   - CheckoutComponent
   - OrderConfirmationComponent

4. **Integración Stripe Checkout** completa

## 📚 Recursos

- [Angular 19 Docs](https://angular.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
