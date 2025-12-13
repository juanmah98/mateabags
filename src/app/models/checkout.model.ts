import { CustomerDTO } from './customer.model';
import { AddressDTO } from './address.model';
import { OrderItemDTO } from './order.model';
import { Currency } from './enums';

/**
 * Payload completo para crear un pedido (RPC create_order)
 */
export interface CreateOrderPayload {
    customer: CustomerDTO;
    address: AddressDTO;
    items: OrderItemDTO[];
    coupon_code?: string | null;
    shipping_cost?: number;
    currency?: Currency;
    note?: string;
}

/**
 * Respuesta del RPC create_order
 */
export interface CreateOrderResponse {
    order_id: string;
    checkout_url: string;
    total_amount: number;
}

/**
 * Item del carrito de compras
 */
export interface CartItem {
    product_id: string;
    title: string;
    sku?: string;
    price: number;
    quantity: number;
    image?: string;
}

/**
 * Estado del carrito
 */
export interface CartState {
    items: CartItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    coupon_code?: string;
    itemCount: number;
}

/**
 * Resumen del checkout
 */
export interface CheckoutSummary {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    currency: Currency;
    itemCount: number;
    appliedCoupon?: {
        code: string;
        discount_amount: number;
    };
}
