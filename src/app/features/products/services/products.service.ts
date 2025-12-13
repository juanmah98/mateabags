import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Product, ProductDTO, ApiResponse } from '../../../models';
import { Observable, from, map, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    constructor(private supabase: SupabaseService) { }

    /**
     * Obtener todos los productos activos
     */
    getProducts(): Observable<ApiResponse<Product[]>> {
        return from(
            this.supabase['supabase']
                .from('products')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false })
        ).pipe(
            map(({ data, error }) => ({
                data: data as Product[] || null,
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
     * Obtener un producto por ID
     */
    getProductById(id: string): Observable<ApiResponse<Product>> {
        return from(
            this.supabase['supabase']
                .from('products')
                .select('*')
                .eq('id', id)
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data as Product || null,
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
     * Buscar productos por término
     */
    searchProducts(query: string): Observable<ApiResponse<Product[]>> {
        return from(
            this.supabase['supabase']
                .from('products')
                .select('*')
                .eq('active', true)
                .or(`title.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`)
        ).pipe(
            map(({ data, error }) => ({
                data: data as Product[] || null,
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
     * Verificar disponibilidad de stock
     */
    checkStock(productId: string): Observable<number | null> {
        return from(
            this.supabase['supabase']
                .from('products')
                .select('stock')
                .eq('id', productId)
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error || !data) return null;
                return data.stock ?? 0;
            }),
            catchError(() => of(null))
        );
    }

    /**
     * Crear un producto (Admin)
     */
    createProduct(product: ProductDTO): Observable<ApiResponse<Product>> {
        return from(
            this.supabase['supabase']
                .from('products')
                .insert([product])
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data as Product || null,
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
     * Actualizar un producto (Admin)
     */
    updateProduct(id: string, updates: Partial<ProductDTO>): Observable<ApiResponse<Product>> {
        return from(
            this.supabase['supabase']
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => ({
                data: data as Product || null,
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
     * Eliminar un producto (Admin - soft delete)
     */
    deleteProduct(id: string): Observable<ApiResponse<boolean>> {
        return from(
            this.supabase['supabase']
                .from('products')
                .update({ active: false })
                .eq('id', id)
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
}
