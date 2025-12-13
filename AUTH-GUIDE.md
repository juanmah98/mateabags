# Autenticación Simplificada - Mateabags

## 🔐 Modelo de Autenticación

### Para Administradores
- **Login con Supabase Auth** (email + contraseña)
- Acceso completo al panel de administración
- Gestión de pedidos, productos y envíos

### Para Clientes (Compradores)
- **Sin login/registro**
- Checkout como invitado (guest)
- Se les solicita: nombre, email, teléfono
- Notificaciones automáticas por email vía Supabase

### Para el Home (Temporal)
- **Control por fecha de lanzamiento**
- Clave temporal hasta que sea público
- Usa `homeDateGuard` para restringir acceso

---

## 📁 Archivos de Autenticación

### AuthService (`core/services/auth.service.ts`)

Servicio principal de autenticación usando **Supabase Auth**.

```typescript
// Login de administrador
this.authService.loginAdmin(email, password).subscribe(result => {
  if (result.success) {
    // Redirigir al panel admin
    this.router.navigate(['/admin/dashboard']);
  } else {
    // Mostrar error
    this.notificationService.error(result.error);
  }
});

// Logout
this.authService.logout().subscribe(() => {
  this.router.navigate(['/admin/login']);
});

// Verificar si es admin
if (this.authService.isAdmin()) {
  // Mostrar opciones de admin
}

// Obtener usuario actual
const user = this.authService.getCurrentUser();
console.log(user?.email);

// Observar cambios de autenticación
this.authService.authState.subscribe(state => {
  console.log('Admin:', state.isAdmin);
  console.log('User:', state.user);
});
```

**Métodos principales:**
- `loginAdmin(email, password)` - Login con Supabase Auth
- `logout()` - Cerrar sesión
- `isAuthenticated()` - Verificar autenticación
- `isAdmin()` - Verificar rol admin
- `getCurrentUser()` - Obtener usuario actual
- `getAccessToken()` - Obtener JWT token
- `authState` - Observable del estado

---

## 🛡️ Guards

### 1. adminGuard

Protege rutas de administración. Solo usuarios autenticados con Supabase Auth.

```typescript
// En app.routes.ts
{
  path: 'admin',
  canActivate: [adminGuard],
  children: [
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'orders', component: AdminOrdersComponent },
    { path: 'products', component: AdminProductsComponent }
  ]
}
```

**Comportamiento:**
- ✅ Usuario autenticado → Permite acceso
- ❌ No autenticado → Redirige a `/admin/login`

### 2. homeDateGuard

Control temporal para el home hasta fecha de lanzamiento.

```typescript
// En app.routes.ts
{
  path: 'home',
  canActivate: [homeDateGuard],
  component: HomeComponent
}
```

**Comportamiento:**
- Verifica clave temporal: `MATEA2025`
- Almacena en sessionStorage
- Cuando llegue la fecha, se elimina este guard

### 3. authGuard (Deprecated)

⚠️ **Deprecated**: Ahora redirige a `/admin/login`. Usa `adminGuard` directamente.

---

## 🛒 Flujo de Checkout (Sin Login)

Los clientes compran sin necesidad de registro:

```typescript
// 1. Cliente añade productos al carrito
this.cartService.addItem(product, quantity);

// 2. En checkout, solo pide datos básicos
const checkoutForm = {
  customer: {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+34600123456'
  },
  address: {
    line1: 'Calle Mayor 12',
    city: 'Madrid',
    postcode: '28013',
    country: 'ES'
  },
  items: cartItems,
  shipping_cost: 5.00
};

// 3. Crear pedido (crea customer como invitado)
this.checkoutService.createOrder(checkoutForm).subscribe(response => {
  if (response.success) {
    // Redirigir a Stripe Checkout
    window.location.href = response.data.checkout_url;
  }
});

// 4. Después del pago, Stripe redirige de vuelta
// 5. Supabase envía email automático al cliente
```

**No se requiere:**
- ❌ Registro de usuario
- ❌ Login de cliente
- ❌ Contraseña

**Se guarda:**
- ✅ Datos del cliente en tabla `customers`
- ✅ Dirección en tabla `addresses`
- ✅ Pedido en tabla `orders`
- ✅ Email para notificaciones

---

## 🔧 Interceptors HTTP

### authInterceptor

Añade automáticamente el token JWT de Supabase a las peticiones HTTP.

```typescript
// Se configura automáticamente en app.config.ts
// NO necesitas hacer nada manualmente

// El interceptor añade:
Authorization: Bearer <supabase_jwt_token>
```

**Cuándo se activa:**
- Solo si hay sesión activa de admin
- Obtiene el token automáticamente de Supabase
- Se incluye en todas las peticiones HTTP

---

## 📝 Ejemplo Completo: Panel de Admin

### 1. Crear componente de login admin

```typescript
// admin-login.component.ts
export class AdminLoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private notifications: NotificationService
  ) {}

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      this.authService.loginAdmin(email!, password!).subscribe({
        next: (result) => {
          if (result.success) {
            this.notifications.success('¡Bienvenido!');
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.notifications.error(result.error || 'Error al iniciar sesión');
          }
        },
        error: (err) => {
          this.notifications.error('Error de conexión');
        }
      });
    }
  }
}
```

### 2. Proteger rutas admin

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'admin',
    children: [
      { path: 'login', component: AdminLoginComponent },
      {
        path: '',
        canActivate: [adminGuard],
        children: [
          { path: 'dashboard', component: AdminDashboardComponent },
          { path: 'orders', component: AdminOrdersListComponent },
          { path: 'orders/:id', component: AdminOrderDetailComponent },
          { path: 'products', component: AdminProductsComponent }
        ]
      }
    ]
  }
];
```

### 3. Botón de logout

```typescript
// admin-header.component.ts
logout() {
  this.authService.logout().subscribe(() => {
    this.notifications.info('Sesión cerrada');
    this.router.navigate(['/admin/login']);
  });
}
```

---

## 🎯 Resumen

### ✅  Lo que TIENES:
- Login admin con Supabase Auth (email + contraseña)
- Checkout de clientes sin login (guest checkout)
- Guards para proteger rutas admin
- Interceptor automático para tokens
- Control temporal del home por fecha

### ❌ Lo que NO tienes (y no necesitas):
- Login/registro de clientes
- Sesiones de cliente
- Roles complejos (solo admin o guest)
- Múltiples tipos de usuarios

### 📊 Flujos Simplificados:

**Admin:**
1. Login en `/admin/login` con email + contraseña
2. Supabase Auth valida credenciales
3. Sesión guardada automáticamente
4. Token JWT en todas las peticiones
5. Logout cuando termine

**Cliente:**
1. Navega por productos (sin login)
2. Añade al carrito (sin login)
3. Va a checkout (sin login)
4. Rellena formulario con email/nombre/dirección
5. Paga con Stripe
6. Recibe confirmación por email

**Home Temporal:**
1. Intenta acceder a `/home`
2. homeDateGuard solicita clave `MATEA2025`
3. Al lanzamiento, se elimina el guard

---

## 🔄 Actualizar las Rutas Existentes

### Cambiar old auth.guard por homeDateGuard

```typescript
// ANTES (old auth.guard con clave)
{
  path: 'home',
  canActivate: [authGuard],  // ❌ Antiguo
  component: HomeComponent
}

// DESPUÉS (homeDateGuard más claro)
{
  path: 'home',
  canActivate: [homeDateGuard],  // ✅ Nuevo y específico
  component: HomeComponent
}
```

---

## 📚 Configuración de Supabase Auth

### 1. Crear usuarios admin en Supabase Dashboard

1. Ve a Authentication > Users
2. Click "Invite user" o "Add user"
3. Ingresa email y contraseña del admin
4. El admin puede hacer login con esas credenciales

### 2. Políticas RLS (Opcional pero recomendado)

```sql
-- Permitir a admins autenticados ver todos los pedidos
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (true);

-- Permitir a admins actualizar pedidos
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
TO authenticated
USING (true);
```

### 3. Variables de Entorno

Asegúrate de tener configurado en `environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key'
  }
};
```

---

¡Listo! Ahora tienes una estructura de autenticación simple y clara:
- **Admins**: Login con Supabase Auth
- **Clientes**: Checkout sin login
- **Home**: Control temporal por clave (se eliminará en lanzamiento)
