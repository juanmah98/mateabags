import { OrderStatus, Currency } from './enums';

/**
 * Modelo de pedido basado en la tabla 'orders' de Supabase
 */
export interface Order {
    id: string;
    customer_id: string;
    shipping_address_id: string;
    subtotal_amount: number;
    discount_amount: number;
    shipping_cost: number;
    total_amount: number;
    currency: Currency;
    status: OrderStatus;
    note?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Item individual de un pedido basado en 'order_items'
 */
export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    title: string;
    sku?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at?: string;
}

/**
 * DTO para crear un item de pedido
 */
export interface OrderItemDTO {
    product_id: string;
    title: string;
    sku?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

/**
 * Pedido completo con items, customer y dirección
 */
export interface OrderWithDetails extends Order {
    items?: OrderItem[];
    customer?: {
        name?: string;
        email: string;
        phone?: string;
    };
    shipping_address?: {
        line1: string;
        line2?: string;
        city: string;
        postcode: string;
        country: string;
    };
}

/**
 * DTO para actualizar el estado de un pedido (Admin)
 */
export interface OrderStatusUpdateDTO {
    status: OrderStatus;
    note?: string;
}
