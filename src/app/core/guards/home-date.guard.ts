import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { LaunchService } from '../services/launch.service';

/**
 * Guard para product-sale
 * Permite el acceso solo si ya se ha lanzado (después del 28 enero 2026, 20:00 España)
 * Antes del lanzamiento, redirige al home
 */
export const homeDateGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const launchService = inject(LaunchService);

    // Si ya se lanzó, permitir acceso
    if (launchService.isLaunched()) {
        return true;
    }

    // Si no se ha lanzado, redirigir al home
    router.navigate(['/home']);
    return false;
};
