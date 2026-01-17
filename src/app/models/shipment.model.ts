import { ShipmentStatus, ShippingCarrier } from './enums';

/**
 * Modelo de envío basado en la tabla 'shipments' de Supabase
 */
export interface Shipment {
    id: string;
    order_id: string;
    carrier: ShippingCarrier;
    service?: string;
    tracking_number?: string;
    cost: number;
    status: ShipmentStatus;
    label_url?: string;
    shipped_at?: string;
    delivered_at?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * DTO para crear un envío (Admin)
 */
export interface ShipmentDTO {
    order_id: string;
    carrier: ShippingCarrier;
    service?: string;
    tracking_number?: string;
    cost: number;
    status?: ShipmentStatus;
}

/**
 * DTO para actualizar el tracking de un envío
 */
export interface ShipmentTrackingUpdateDTO {
    tracking_number: string;
    status?: ShipmentStatus;
    label_url?: string;
}

/**
 * Estado de seguimiento del envío para mostrar al cliente
 */
export interface ShipmentTracking {
    tracking_number: string;
    carrier: ShippingCarrier;
    status: ShipmentStatus;
    estimated_delivery?: string;
    events?: ShipmentEvent[];
}

export interface ShipmentEvent {
    date: string;
    status: string;
    location?: string;
    description: string;
}
