import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';


// Interfaces
export interface CheckoutItem {
    product_id: string;
    title: string;
    sku?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    is_gift?: boolean;
    gift_message?: string;
}

export interface CustomerData {
    name: string;
    email: string;
    phone?: string;
}

export interface AddressData {
    kind?: string;
    label?: string;
    recipient_name?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postcode: string;
    country?: string;
}

export interface CouponValidation {
    valid: boolean;
    coupon_id?: string;
    code?: string;
    description?: string;
    kind?: string;
    value?: number;
    discount_amount?: number;
    subtotal?: number;
    new_total?: number;
    error?: string;
}

export interface CreateCheckoutResponse {
    success: boolean;
    order_id: string;
    checkout_url: string;
    total_amount: number;
    currency: string;
}

@Injectable({
    providedIn: 'root'
})
export class StripeService {
    private supabase: SupabaseClient;

    constructor(private http: HttpClient) {
        this.supabase = createClient(
            environment.supabaseUrl,
            environment.supabaseAnonKey
        );
    }

    /**
     * Valida un cupón de descuento
     */
    validateCoupon(code: string, subtotal: number): Observable<CouponValidation> {
        if (!code || code.trim() === '') {
            // Si no hay cupón, retornar válido sin descuento
            return new Observable(observer => {
                observer.next({
                    valid: true,
                    discount_amount: 0,
                    subtotal: subtotal,
                    new_total: subtotal
                });
                observer.complete();
            });
        }

        return from(
            this.supabase.rpc('validate_coupon', {
                p_code: code.toUpperCase(),
                p_subtotal: subtotal
            })
        ).pipe(
            map(({ data, error }) => {
                if (error) {
                    console.error('Error validating coupon:', error);
                    return {
                        valid: false,
                        error: 'Error al validar el cupón'
                    };
                }
                return data as CouponValidation;
            }),
            catchError(err => {
                console.error('Coupon validation error:', err);
                return throwError(() => new Error('Error al validar cupón'));
            })
        );
    }

    /**
     * Crea una sesión de checkout en Stripe
     */
    createCheckoutSession(
        customer: CustomerData,
        address: AddressData,
        items: CheckoutItem[],
        shippingCost: number,
        couponCode?: string,
        note?: string
    ): Observable<CreateCheckoutResponse> {
        const payload = {
            customer,
            address,
            items,
            shipping_cost: shippingCost,
            coupon_code: couponCode,
            currency: 'EUR',
            note,
            success_url: `${window.location.origin}/checkout/success`,
            cancel_url: `${window.location.origin}/checkout/cancel`
        };

        // Llamar a la Edge Function de Supabase
        const functionUrl = `${environment.supabaseUrl}/functions/v1/create-checkout-session`;

        return this.http.post<CreateCheckoutResponse>(
            functionUrl,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${environment.supabaseAnonKey}`,
                    'Content-Type': 'application/json'
                }
            }
        ).pipe(
            catchError(err => {
                console.error('❌ Error creating checkout session:', err);
                console.error('❌ Status:', err.status);
                console.error('❌ Error body:', err.error);
                return throwError(() => new Error('Error al crear sesión de pago'));
            })
        );
    }

    /**
     * Redirige a la página de pago de Stripe
     */
    redirectToCheckout(checkoutUrl: string): void {
        window.location.href = checkoutUrl;
    }

    /**
     * Obtiene el estado de una orden
     */
    getOrderStatus(orderId: string): Observable<any> {
        return from(
            this.supabase.rpc('get_order_status', {
                p_order_id: orderId
            })
        ).pipe(
            map(({ data, error }) => {
                if (error) {
                    console.error('Error getting order status:', error);
                    throw error;
                }
                return data;
            }),
            catchError(err => {
                console.error('Order status error:', err);
                return throwError(() => new Error('Error al obtener estado de orden'));
            })
        );
    }
}
