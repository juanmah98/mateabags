import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import {
    OrderWithDetails,
    OrderStatusUpdateDTO,
    ApiResponse,
    PaginatedResponse,
    OrderStatus
} from '../../../models';
import { Observable, from, map, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminOrdersService {

    constructor(private supabase: SupabaseService) { }

    /**
     * Listar todos los pedidos con filtros opcionales
     */
    listOrders(
        page: number = 1,
        pageSize: number = 20,
        status?: OrderStatus
    ): Observable<ApiResponse<PaginatedResponse<OrderWithDetails>>> {
        const from_index = (page - 1) * pageSize;
        const to_index = from_index + pageSize - 1;

        let query = this.supabase['supabase']
            .from('orders')
            .select(`
        *,
        items:order_items(*),
        customer:customers(name, email, phone),
        shipping_address:addresses(line1, line2, city, postcode, country)
      `, { count: 'exact' })
            .range(from_index, to_index)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        return from(query).pipe(
            map(({ data, error, count }) => {
                if (error) {
                    return {
                        data: null,
                        error: { code: error.code, message: error.message },
                        success: false
                    };
                }

                const paginatedResult: PaginatedResponse<OrderWithDetails> = {
                    data: data as OrderWithDetails[] || [],
                    total: count || 0,
                    page,
                    pageSize,
                    hasMore: (count || 0) > to_index + 1
                };

                return {
                    data: paginatedResult,
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
     * Obtener detalles completos de un pedido
     */
    getOrderDetails(orderId: string): Observable<ApiResponse<OrderWithDetails>> {
        return from(
            this.supabase['supabase']
                .from('orders')
                .select(`
          *,
          items:order_items(*),
          customer:customers(name, email, phone),
          shipping_address:addresses(*),
          payments(*),
          shipments(*)
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
     * Actualizar el estado de un pedido
     */
    updateOrderStatus(orderId: string, update: OrderStatusUpdateDTO): Observable<ApiResponse<boolean>> {
        return from(
            this.supabase['supabase']
                .from('orders')
                .update({
                    status: update.status,
                    note: update.note,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
        ).pipe(
            map(({ error }) => ({
                data: !error,
                error: error ? { code: error.code, message: error.message } : null,
                success: !error
            })),
            catchError(error => of({
                data: false,
                error: { code: 'UNKNOWN', message: error.message },
                success: false
            }))
        );
    }

    /**
     * Buscar pedidos por email de cliente
     */
    searchOrdersByEmail(email: string): Observable<ApiResponse<OrderWithDetails[]>> {
        return from(
            this.supabase['supabase']
                .from('orders')
                .select(`
          *,
          items:order_items(*),
          customer:customers!inner(name, email, phone),
          shipping_address:addresses(*)
        `)
                .ilike('customer.email', `%${email}%`)
                .order('created_at', { ascending: false })
        ).pipe(
            map(({ data, error }) => ({
                data: data as OrderWithDetails[] || null,
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
     * Obtener estadísticas de pedidos
     */
    getOrderStats(): Observable<ApiResponse<any>> {
        return from(
            this.supabase['supabase']
                .rpc('get_order_stats')
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
}
