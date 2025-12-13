import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rutas de administración
 * Verifica que el usuario tenga sesión activa de Supabase Auth
 * Espera a que se cargue la sesión antes de verificar
 */
export const adminGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Esperar a que se complete la inicialización de auth
    await authService.waitForInitialization();

    if (authService.isAdmin()) {
        return true;
    }

    // Redirigir al login de admin
    router.navigate(['/admin/login'], {
        queryParams: { returnUrl: state.url }
    });
    return false;
};
