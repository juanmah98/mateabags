import { AddressKind } from './enums';

/**
 * Modelo de dirección basado en la tabla 'addresses' de Supabase
 */
export interface Address {
    id: string;
    customer_id: string;
    kind: AddressKind;
    label?: string;
    recipient_name?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * DTO para crear una dirección
 */
export interface AddressDTO {
    customer_id?: string;
    kind: AddressKind;
    label?: string;
    recipient_name?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
}

/**
 * Dirección formateada para mostrar
 */
export interface AddressFormatted {
    fullAddress: string;
    recipientName?: string;
    city: string;
    postcode: string;
    country: string;
}
