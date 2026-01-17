import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { LaunchService } from '../services/launch.service';

/**
 * Guard para el home
 * Permite el acceso solo si ya se ha lanzado la aplicación (después del countdown)
 * Antes del lanzamiento, redirige al waitlist
 */
export const homeDateGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const launchService = inject(LaunchService);

    // Si ya se lanzó, permitir acceso
    if (launchService.isLaunched()) {
        return true;
    }

    // Si no se ha lanzado, redirigir al waitlist
    router.navigate(['/waitlist']);
    return false;
};
