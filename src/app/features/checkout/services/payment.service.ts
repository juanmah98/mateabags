import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import {
    PaymentSessionResponse,
    PaymentInfo,
    CreatePaymentSessionDTO,
    ApiResponse
} from '../../../models';
import { Observable, from, map, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    constructor(private supabase: SupabaseService) { }

    /**
     * Crear una sesión de checkout de Stripe
     * Esto debería hacerse mediante un RPC o backend
     */
    createCheckoutSession(dto: CreatePaymentSessionDTO): Observable<ApiResponse<PaymentSessionResponse>> {
        return from(
            this.supabase['supabase']
                .rpc('create_checkout_session', {
                    p_order_id: dto.order_id,
                    p_success_url: dto.success_url,
                    p_cancel_url: dto.cancel_url
                })
        ).pipe(
            map(({ data, error }) => {
                if (error) {
                    return {
                        data: null,
                        error: { code: error.code, message: error.message },
                        success: false
                    };
                }

                const sessionResponse: PaymentSessionResponse = data || {
                    checkout_session_id: '',
                    checkout_url: ''
                };

                return {
                    data: sessionResponse,
                    error: null,
                    success: true
                };
            }),
            catchError(error => of({
                data: null,
                error: { code: 'UNKNOWN', message: error.message },
                success: false
            }))
        );
    }

    /**
     * Obtener el estado de un pago por order_id
     */
    getPaymentStatus(orderId: string): Observable<ApiResponse<PaymentInfo>> {
        return from(
            this.supabase['supabase']
                .from('payments')
                .select('*')
                .eq('order_id', orderId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error) {
                    return {
                        data: null,
                        error: { code: error.code, message: error.message },
                        success: false
                    };
                }

                const paymentInfo: PaymentInfo = {
                    status: data.status,
                    amount: data.amount,
                    currency: data.currency,
                    created_at: data.created_at
                };

                return {
                    data: paymentInfo,
                    error: null,
                    success: true
                };
            }),
            catchError(error => of({
                data: null,
                error: { code: 'UNKNOWN', message: error.message },
                success: false
            }))
        );
    }

    /**
     * Redirigir a la URL de checkout de Stripe
     */
    redirectToCheckout(checkoutUrl: string): void {
        window.location.href = checkoutUrl;
    }
}
