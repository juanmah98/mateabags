import { Currency } from './enums';

/**
 * Modelo de producto basado en la tabla 'products' de Supabase
 */
export interface Product {
    id: string;
    sku?: string;
    title: string;
    description?: string;
    price: number;
    currency?: Currency;
    stock?: number;
    active?: boolean;
    metadata?: ProductMetadata;
    created_at?: string;
    updated_at?: string;
}

export interface ProductMetadata {
    images?: string[];
    category?: string;
    tags?: string[];
    weight?: number;
    dimensions?: {
        width: number;
        height: number;
        depth: number;
    };
    [key: string]: any;
}

/**
 * DTO para crear o actualizar productos (Admin)
 */
export interface ProductDTO {
    sku?: string;
    title: string;
    description?: string;
    price: number;
    currency?: Currency;
    stock?: number;
    active?: boolean;
    metadata?: ProductMetadata;
}

/**
 * Producto con información adicional para la vista
 */
export interface ProductView extends Product {
    formattedPrice?: string;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
}
