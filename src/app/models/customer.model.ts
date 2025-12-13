/**
 * Modelo de cliente basado en la tabla 'customers' de Supabase
 */
export interface Customer {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    stripe_customer_id?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * DTO para crear un cliente guest en el checkout
 */
export interface CustomerDTO {
    name?: string;
    email: string;
    phone?: string;
}

/**
 * DTO para actualizar información de cliente
 */
export interface CustomerUpdateDTO {
    name?: string;
    phone?: string;
}
