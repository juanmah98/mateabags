/**
 * Enumeraciones para la aplicación Mateabags
 */

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export enum ShipmentStatus {
    PENDING = 'pending',
    LABEL_CREATED = 'label_created',
    PICKED_UP = 'picked_up',
    IN_TRANSIT = 'in_transit',
    OUT_FOR_DELIVERY = 'out_for_delivery',
    DELIVERED = 'delivered',
    FAILED_DELIVERY = 'failed_delivery',
    RETURNED = 'returned'
}

export enum AddressKind {
    SHIPPING = 'shipping',
    BILLING = 'billing'
}

export enum CouponKind {
    AMOUNT = 'amount',
    PERCENT = 'percent'
}

export enum Currency {
    EUR = 'EUR',
    USD = 'USD'
}

export enum ShippingCarrier {
    SEUR = 'SEUR',
    CORREOS = 'CORREOS',
    DHL = 'DHL'
}
