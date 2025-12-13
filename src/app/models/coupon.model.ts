import { CouponKind } from './enums';

/**
 * Modelo de cupón basado en la tabla 'coupons' de Supabase
 */
export interface Coupon {
    id: string;
    code: string;
    description?: string;
    kind: CouponKind;
    value: number;
    active: boolean;
    usage_limit?: number;
    times_redeemed: number;
    starts_at?: string;
    expires_at?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Resultado de validación de cupón (RPC)
 */
export interface CouponValidationResult {
    valid: boolean;
    discount_amount: number;
    message?: string;
    coupon?: {
        code: string;
        kind: CouponKind;
        value: number;
    };
}

/**
 * Relación entre pedido y cupón aplicado
 */
export interface OrderCoupon {
    id: string;
    order_id: string;
    coupon_id: string;
    discount_amount: number;
    applied_at?: string;
}

/**
 * DTO para validar un cupón
 */
export interface ValidateCouponDTO {
    code: string;
    subtotal: number;
}
