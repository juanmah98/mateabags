import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import {
    CreateOrderPayload,
    CreateOrderResponse,
    ApiResponse,
    CustomerDTO,
    OrderWithDetails
} from '../../../models';
import { Observable, from, map, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CheckoutService {

    constructor(private supabase: SupabaseService) { }

    /**
     * Crear un cliente guest
     */
    createGuestCustomer(customer: CustomerDTO): Observable<ApiResponse<any>> {
        return from(
            this.supabase['supabase']
                .from('customers')
                .insert([{
                    name: customer.name,
                    email: customer.email.toLowerCase(),
                    phone: customer.phone
                }])
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data || null,
                error: error ? { code: error.code, message: error.message } : null,
                success: !error
            })),
            catchError(error => of({
                data: null,
                error: { code: 'UNKNOWN', message: error.message },
                success: false
            }))
        );
    }

    /**
     * Crear un pedido completo mediante RPC
     * Llama a la función 'create_order' que crea customer, address, order, order_items
     * y devuelve la URL de checkout de Stripe
     */
    createOrder(payload: CreateOrderPayload): Observable<ApiResponse<CreateOrderResponse>> {
        return from(
            this.supabase['supabase']
                .rpc('create_order', payload)
        ).pipe(
            map(({ data, error }) => {
                if (error) {
                    return {
                        data: null,
                        error: { code: error.code, message: error.message },
                        success: false
                    };
                }

                const orderResponse: CreateOrderResponse = data || {
                    order_id: '',
                    checkout_url: '',
                    total_amount: 0
                };

                return {
                    data: orderResponse,
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
     * Obtener detalles de un pedido por ID
     */
    getOrderById(orderId: string): Observable<ApiResponse<OrderWithDetails>> {
        return from(
            this.supabase['supabase']
                .from('orders')
                .select(`
          *,
          items:order_items(*),
          customer:customers(name, email, phone),
          shipping_address:addresses(line1, line2, city, postcode, country)
        `)
                .eq('id', orderId)
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data as OrderWithDetails || null,
                error: error ? { code: error.code, message: error.message } : null,
                success: !error
            })),
            catchError(error => of({
                data: null,
                error: { code: 'UNKNOWN', message: error.message },
                success: false
            }))
        );
    }

    /**
     * Verificar si un email ya existe como customer
     */
    checkEmailExists(email: string): Observable<boolean> {
        return from(
            this.supabase['supabase']
                .from('customers')
                .select('email')
                .eq('email', email.toLowerCase())
                .limit(1)
        ).pipe(
            map(({ data, error }) => {
                if (error) return false;
                return data !== null && data.length > 0;
            }),
            catchError(() => of(false))
        );
    }
}
