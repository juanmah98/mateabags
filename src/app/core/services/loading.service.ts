import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingCount = 0;
    private loading$ = new BehaviorSubject<boolean>(false);

    constructor() { }

    /**
     * Observable del estado de carga
     */
    get isLoading(): Observable<boolean> {
        return this.loading$.asObservable();
    }

    /**
     * Obtiene el estado actual de carga
     */
    get currentLoadingState(): boolean {
        return this.loading$.value;
    }

    /**
     * Mostrar indicador de carga
     */
    show(): void {
        this.loadingCount++;
        if (this.loadingCount > 0) {
            this.loading$.next(true);
        }
    }

    /**
     * Ocultar indicador de carga
     */
    hide(): void {
        this.loadingCount--;
        if (this.loadingCount <= 0) {
            this.loadingCount = 0;
            this.loading$.next(false);
        }
    }

    /**
     * Forzar ocultar el indicador de carga
     */
    forceHide(): void {
        this.loadingCount = 0;
        this.loading$.next(false);
    }
}
