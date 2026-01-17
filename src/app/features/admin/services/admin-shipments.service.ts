import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import {
    Shipment,
    ShipmentDTO,
    ShipmentTrackingUpdateDTO,
    ApiResponse
} from '../../../models';
import { Observable, from, map, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminShipmentsService {

    constructor(private supabase: SupabaseService) { }

    /**
     * Crear un nuevo envío
     */
    createShipment(shipment: ShipmentDTO): Observable<ApiResponse<Shipment>> {
        return from(
            this.supabase['supabase']
                .from('shipments')
                .insert([shipment])
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data as Shipment || null,
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
     * Actualizar tracking de un envío
     */
    updateTracking(shipmentId: string, update: ShipmentTrackingUpdateDTO): Observable<ApiResponse<Shipment>> {
        return from(
            this.supabase['supabase']
                .from('shipments')
                .update({
                    tracking_number: update.tracking_number,
                    status: update.status,
                    label_url: update.label_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', shipmentId)
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data as Shipment || null,
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
     * Obtener estado de un envío
     */
    getShipmentStatus(shipmentId: string): Observable<ApiResponse<Shipment>> {
        return from(
            this.supabase['supabase']
                .from('shipments')
                .select('*')
                .eq('id', shipmentId)
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data as Shipment || null,
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
     * Obtener envío por order_id
     */
    getShipmentByOrderId(orderId: string): Observable<ApiResponse<Shipment>> {
        return from(
            this.supabase['supabase']
                .from('shipments')
                .select('*')
                .eq('order_id', orderId)
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data as Shipment || null,
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
     * Listar todos los envíos
     */
    listShipments(): Observable<ApiResponse<Shipment[]>> {
        return from(
            this.supabase['supabase']
                .from('shipments')
                .select('*')
                .order('created_at', { ascending: false })
        ).pipe(
            map(({ data, error }) => ({
                data: data as Shipment[] || null,
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
     * Marcar envío como enviado
     */
    markAsShipped(shipmentId: string): Observable<ApiResponse<Shipment>> {
        return from(
            this.supabase['supabase']
                .from('shipments')
                .update({
                    status: 'in_transit',
                    shipped_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', shipmentId)
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data as Shipment || null,
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
     * Marcar envío como entregado
     */
    markAsDelivered(shipmentId: string): Observable<ApiResponse<Shipment>> {
        return from(
            this.supabase['supabase']
                .from('shipments')
                .update({
                    status: 'delivered',
                    delivered_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', shipmentId)
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data as Shipment || null,
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
