import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor() { }

    /**
     * Guardar item en localStorage
     */
    setLocalItem<T>(key: string, value: T): void {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Obtener item de localStorage
     */
    getLocalItem<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    /**
     * Eliminar item de localStorage
     */
    removeLocalItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    /**
     * Limpiar todo localStorage
     */
    clearLocal(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    /**
     * Guardar item en sessionStorage
     */
    setSessionItem<T>(key: string, value: T): void {
        try {
            const serialized = JSON.stringify(value);
            sessionStorage.setItem(key, serialized);
        } catch (error) {
            console.error('Error saving to sessionStorage:', error);
        }
    }

    /**
     * Obtener item de sessionStorage
     */
    getSessionItem<T>(key: string): T | null {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from sessionStorage:', error);
            return null;
        }
    }

    /**
     * Eliminar item de sessionStorage
     */
    removeSessionItem(key: string): void {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from sessionStorage:', error);
        }
    }

    /**
     * Limpiar todo sessionStorage
     */
    clearSession(): void {
        try {
            sessionStorage.clear();
        } catch (error) {
            console.error('Error clearing sessionStorage:', error);
        }
    }

    /**
     * Verificar si un key existe en localStorage
     */
    hasLocalItem(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }

    /**
     * Verificar si un key existe en sessionStorage
     */
    hasSessionItem(key: string): boolean {
        return sessionStorage.getItem(key) !== null;
    }
}
