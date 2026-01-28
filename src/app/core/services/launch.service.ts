import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LaunchService {
    /**
     * SALE LAUNCH DATE
     * January 28, 2026 at 20:00 Spain time (CET = UTC+1)
     * After this date, home page will redirect to product sale instead of waitlist
     */
    public readonly targetDate: Date = new Date('2026-01-28T20:00:00+01:00');

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
