import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP para añadir tokens de autenticación a las peticiones
 * Añade el header Authorization si el usuario está autenticado
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Obtener el token de autenticación de Supabase si existe
    const accessToken = authService.getAccessToken();

    // Si hay token, añadirlo a los headers
    if (accessToken) {
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return next(clonedRequest);
    }

    return next(req);
};
