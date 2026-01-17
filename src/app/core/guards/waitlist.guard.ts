import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { LaunchService } from '../services/launch.service';

/**
 * Guard para la lista de espera
 * Si ya se lanzó la aplicación, redirige al home
 */
export const waitlistGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const launchService = inject(LaunchService);

    if (launchService.isLaunched()) {
        router.navigate(['/home']);
        return false;
    }

    return true;
};
