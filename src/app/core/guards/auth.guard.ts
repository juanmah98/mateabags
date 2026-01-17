import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * @deprecated Este guard ahora se usa para autenticación de admin con Supabase.
 * Para el control temporal del home por fecha, usa homeDateGuard
 * 
 * Guard que protege rutas que requieren autenticación de administrador
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar a que se complete la inicialización
  await authService.waitForInitialization();

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir al login de admin
  router.navigate(['/admin/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
