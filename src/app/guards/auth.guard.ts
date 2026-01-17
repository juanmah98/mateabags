import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

/**
 * Guard que protege rutas con una clave simple
 * La clave se almacena en sessionStorage para mantener la sesión
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Verificar si ya está autenticado (clave guardada en sessionStorage)
  const storedKey = sessionStorage.getItem('home_access_key');
  const validKey = 'MATEA2025'; // Cambia esta clave por la que quieras usar
  
  if (storedKey === validKey) {
    return true; // Permitir acceso
  }
  
  // Si no está autenticado, redirigir a la página de login
  router.navigate(['/home/login']);
  return false;
};

