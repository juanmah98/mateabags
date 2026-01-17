import { PaymentStatus, Currency } from './enums';

/**
 * Modelo de pago basado en la tabla 'payments' de Supabase
 */
export interface Payment {
    id: string;
    order_id: string;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    stripe_payment_intent_id?: string;
    stripe_checkout_session_id?: string;
    stripe_charge_id?: string;
    stripe_raw?: any;
    created_at?: string;
    updated_at?: string;
}

/**
 * DTO para crear una sesión de pago en Stripe
 */
export interface CreatePaymentSessionDTO {
    order_id: string;
    success_url: string;
    cancel_url: string;
}

/**
 * Respuesta al crear una sesión de checkout de Stripe
 */
export interface PaymentSessionResponse {
    checkout_session_id: string;
    checkout_url: string;
}

/**
 * Información de pago para mostrar al usuario
 */
export interface PaymentInfo {
    status: PaymentStatus;
    amount: number;
    currency: Currency;
    payment_method?: string;
    created_at?: string;
}
