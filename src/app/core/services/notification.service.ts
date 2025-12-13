import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastMessage } from '../../models/common.model';
import { APP_CONSTANTS } from '../../config/constants';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private toasts$ = new BehaviorSubject<ToastMessage[]>([]);

    constructor() { }

    /**
     * Observable de las notificaciones activas
     */
    get toasts(): Observable<ToastMessage[]> {
        return this.toasts$.asObservable();
    }

    /**
     * Mostrar notificación de éxito
     */
    success(message: string, title?: string, duration?: number): void {
        this.show({
            type: 'success',
            message,
            title,
            duration: duration || APP_CONSTANTS.TOAST_DURATION
        });
    }

    /**
     * Mostrar notificación de error
     */
    error(message: string, title?: string, duration?: number): void {
        this.show({
            type: 'error',
            message,
            title,
            duration: duration || APP_CONSTANTS.TOAST_DURATION
        });
    }

    /**
     * Mostrar notificación de advertencia
     */
    warning(message: string, title?: string, duration?: number): void {
        this.show({
            type: 'warning',
            message,
            title,
            duration: duration || APP_CONSTANTS.TOAST_DURATION
        });
    }

    /**
     * Mostrar notificación de información
     */
    info(message: string, title?: string, duration?: number): void {
        this.show({
            type: 'info',
            message,
            title,
            duration: duration || APP_CONSTANTS.TOAST_DURATION
        });
    }

    /**
     * Mostrar una notificación toast
     */
    private show(toast: ToastMessage): void {
        const currentToasts = this.toasts$.value;
        this.toasts$.next([...currentToasts, toast]);

        // Auto-eliminar después de la duración especificada
        if (toast.duration && toast.duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, toast.duration);
        }
    }

    /**
     * Eliminar una notificación específica
     */
    remove(toast: ToastMessage): void {
        const currentToasts = this.toasts$.value;
        const filtered = currentToasts.filter(t => t !== toast);
        this.toasts$.next(filtered);
    }

    /**
     * Limpiar todas las notificaciones
     */
    clear(): void {
        this.toasts$.next([]);
    }
}
