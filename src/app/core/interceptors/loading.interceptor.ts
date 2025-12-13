import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';


/**
 * Interceptor HTTP para mostrar indicadores de carga
 * Incrementa el contador al iniciar una petición y lo decrementa al finalizar
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService);

    // Incrementar el contador de peticiones activas
    loadingService.show();

    return next(req).pipe(
        finalize(() => {
            // Decrementar el contador cuando la petición finalice
            loadingService.hide();
        })
    );
};
