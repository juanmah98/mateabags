import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { ERROR_MESSAGES } from '../../config/constants';

/**
 * Interceptor HTTP para manejar errores de forma centralizada
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage: string = ERROR_MESSAGES.GENERIC_ERROR;

            // Manejar diferentes tipos de errores
            if (error.error instanceof ErrorEvent) {
                // Error del lado del cliente
                errorMessage = error.error.message || ERROR_MESSAGES.NETWORK_ERROR;
            } else {
                // Error del lado del servidor
                switch (error.status) {
                    case 0:
                        errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
                        break;
                    case 401:
                        errorMessage = ERROR_MESSAGES.AUTH_REQUIRED;
                        router.navigate(['/home/login']);
                        break;
                    case 403:
                        errorMessage = 'No tienes permisos para acceder a este recurso.';
                        break;
                    case 404:
                        errorMessage = 'Recurso no encontrado.';
                        break;
                    case 408:
                        errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
                        break;
                    case 500:
                        errorMessage = 'Error del servidor. Inténtalo más tarde.';
                        break;
                    default:
                        errorMessage = error.error?.message || ERROR_MESSAGES.GENERIC_ERROR;
                }
            }

            // Mostrar notificación de error
            notificationService.error(errorMessage);

            // Re-lanzar el error para que pueda ser manejado localmente si es necesario
            return throwError(() => error);
        })
    );
};
