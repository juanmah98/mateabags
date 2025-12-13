import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { CouponValidationResult, ValidateCouponDTO, ApiResponse } from '../../../models';
import { Observable, from, map, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CouponService {

    constructor(private supabase: SupabaseService) { }

    /**
     * Validar un cupón mediante RPC
     * Llama a la función de Supabase 'validate_coupon'
     */
    validateCoupon(code: string, subtotal: number): Observable<ApiResponse<CouponValidationResult>> {
        return from(
            this.supabase['supabase']
                .rpc('validate_coupon', {
                    p_code: code,
                    p_subtotal: subtotal
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

                // Si el RPC devuelve los datos esperados
                const validationResult: CouponValidationResult = data || {
                    valid: false,
                    discount_amount: 0,
                    message: 'Cupón inválido'
                };

                return {
                    data: validationResult,
                    error: null,
                    success: validationResult.valid
                };
            }),
            catchError(error => of({
                data: {
                    valid: false,
                    discount_amount: 0,
                    message: error.message || 'Error al validar cupón'
                },
                error: { code: 'UNKNOWN', message: error.message },
                success: false
            }))
        );
    }

    /**
     * Obtener información de un cupón por código (sin aplicar)
     */
    getCouponByCode(code: string): Observable<ApiResponse<any>> {
        return from(
            this.supabase['supabase']
                .from('coupons')
                .select('*')
                .eq('code', code.toUpperCase())
                .eq('active', true)
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
     * Verificar si un cupón está vigente
     */
    isCouponValid(startsAt?: string, expiresAt?: string): boolean {
        const now = new Date();

        if (startsAt) {
            const startDate = new Date(startsAt);
            if (now < startDate) return false;
        }

        if (expiresAt) {
            const expireDate = new Date(expiresAt);
            if (now > expireDate) return false;
        }

        return true;
    }
}
