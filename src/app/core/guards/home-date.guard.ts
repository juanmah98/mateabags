import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { LaunchService } from '../services/launch.service';

/**
 * Guard temporal para el home
 * Protege el acceso hasta una fecha específica usando una clave temporal
 * O permite el acceso libre si ya se ha lanzado
 */
export const homeDateGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const storageService = inject(StorageService);
    const launchService = inject(LaunchService);

    // Si ya se lanzó, permitir acceso libre
    if (launchService.isLaunched()) {
        return true;
    }

    // Verificar si ya tiene la clave de acceso temporal guardada
    const storedKey = storageService.getSessionItem<string>('home_access_key');
    const validKey = 'MATEA2025'; // Clave temporal hasta lanzamiento

    if (storedKey === validKey) {
        return true;
    }

    // Si no tiene la clave, redirigir al login temporal
    router.navigate(['/home/login']);
    return false;
};
