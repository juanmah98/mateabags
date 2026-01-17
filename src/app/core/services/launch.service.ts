import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LaunchService {
    // FECHA OBJETIVO
    // 01 de febrero de 2026, 23:59:59 (Mes es 0-indexado en JS Date, 0 = Enero, 1 = Febrero)
    // Nota: El comentario original decía "01 de febrero", pero new Date(2026, 0, 17) es 17 de Enero.
    // Respetaré la fecha configurada en el código: 17 de Enero de 2026 a las 20:00:00
    public readonly targetDate: Date = new Date(2026, 0, 18, 13, 0, 0);

    constructor() { }

    /**
     * Verifica si la fecha actual es posterior a la fecha de lanzamiento.
     * @returns true si ya se lanzó, false si aún estamos en espera.
     */
    isLaunched(): boolean {
        const now = new Date();
        return now > this.targetDate;
    }
}
