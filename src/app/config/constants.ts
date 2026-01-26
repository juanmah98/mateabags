/**
 * Constantes de la aplicación Mateabags
 */

export const APP_CONSTANTS = {
    // Nombre de la aplicación
    APP_NAME: 'Mateabags',

    // Configuración de paginación
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,

    // Configuración de productos
    LOW_STOCK_THRESHOLD: 5,

    // Configuración de carrito
    MAX_CART_ITEMS: 99,
    MIN_ORDER_AMOUNT: 10,

    // Configuración de envío
    DEFAULT_SHIPPING_COST: 0, // Envío incluido en precio de producto
    FREE_SHIPPING_THRESHOLD: 0,

    // Moneda por defecto
    DEFAULT_CURRENCY: 'EUR',

    // URLs de Stripe
    STRIPE_SUCCESS_URL: '/checkout/success',
    STRIPE_CANCEL_URL: '/checkout/cancel',

    // Timeouts y durations
    TOAST_DURATION: 5000,
    API_TIMEOUT: 30000,

    // Storage keys
    STORAGE_KEYS: {
        ACCESS_KEY: 'home_access_key',
        CART: 'mateabags_cart',
        USER_PREFERENCES: 'user_preferences'
    },

    // Validaciones
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 8,
        MAX_NAME_LENGTH: 100,
        MAX_EMAIL_LENGTH: 255,
        PHONE_REGEX: /^(\+34|0034|34)?[6789]\d{8}$/,
        POSTCODE_ES_REGEX: /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/
    }
} as const;

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
    // Errores de red
    NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
    TIMEOUT_ERROR: 'La solicitud ha tardado demasiado. Inténtalo de nuevo.',

    // Errores de autenticación
    AUTH_REQUIRED: 'Debes iniciar sesión para acceder a esta página.',
    INVALID_CREDENTIALS: 'Credenciales inválidas.',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',

    // Errores de validación
    REQUIRED_FIELD: 'Este campo es obligatorio.',
    INVALID_EMAIL: 'Correo electrónico inválido.',
    INVALID_PHONE: 'Número de teléfono inválido.',
    INVALID_POSTCODE: 'Código postal inválido.',

    // Errores de productos
    PRODUCT_NOT_FOUND: 'Producto no encontrado.',
    OUT_OF_STOCK: 'Producto agotado.',
    INSUFFICIENT_STOCK: 'Stock insuficiente.',

    // Errores de carrito
    CART_EMPTY: 'Tu carrito está vacío.',
    INVALID_QUANTITY: 'Cantidad inválida.',
    MAX_QUANTITY_EXCEEDED: 'Has excedido la cantidad máxima permitida.',

    // Errores de cupones
    COUPON_INVALID: 'El cupón es inválido o ha expirado.',
    COUPON_ALREADY_USED: 'Este cupón ya ha sido utilizado.',
    COUPON_NOT_APPLICABLE: 'Este cupón no es aplicable a tu pedido.',

    // Errores de pedidos
    ORDER_NOT_FOUND: 'Pedido no encontrado.',
    ORDER_CREATION_FAILED: 'No se pudo crear el pedido. Inténtalo de nuevo.',

    // Errores de pago
    PAYMENT_FAILED: 'El pago ha fallado. Inténtalo de nuevo.',
    PAYMENT_CANCELLED: 'El pago ha sido cancelado.',

    // Errores generales
    GENERIC_ERROR: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
    UNKNOWN_ERROR: 'Error desconocido.'
} as const;

/**
 * Mensajes de éxito
 */
export const SUCCESS_MESSAGES = {
    PRODUCT_ADDED_TO_CART: 'Producto añadido al carrito.',
    PRODUCT_REMOVED_FROM_CART: 'Producto eliminado del carrito.',
    CART_UPDATED: 'Carrito actualizado.',
    COUPON_APPLIED: 'Cupón aplicado correctamente.',
    ORDER_CREATED: 'Pedido creado exitosamente.',
    PROFILE_UPDATED: 'Perfil actualizado correctamente.',
    EMAIL_SENT: 'Correo enviado correctamente.'
} as const;

/**
 * Etiquetas de estados para mostrar al usuario
 */
export const STATUS_LABELS = {
    ORDER_STATUS: {
        pending: 'Pendiente',
        paid: 'Pagado',
        processing: 'Procesando',
        shipped: 'Enviado',
        delivered: 'Entregado',
        cancelled: 'Cancelado',
        refunded: 'Reembolsado'
    },
    PAYMENT_STATUS: {
        pending: 'Pendiente',
        processing: 'Procesando',
        succeeded: 'Exitoso',
        failed: 'Fallido',
        cancelled: 'Cancelado',
        refunded: 'Reembolsado'
    },
    SHIPMENT_STATUS: {
        pending: 'Pendiente',
        label_created: 'Etiqueta creada',
        picked_up: 'Recogido',
        in_transit: 'En tránsito',
        out_for_delivery: 'En reparto',
        delivered: 'Entregado',
        failed_delivery: 'Entrega fallida',
        returned: 'Devuelto'
    }
} as const;
