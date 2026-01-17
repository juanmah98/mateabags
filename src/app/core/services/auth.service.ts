import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { APP_CONSTANTS } from '../../config/constants';
import type { User, Session } from '@supabase/supabase-js';
import { StorageService } from './storage.service';

export interface AuthState {
    isAuthenticated: boolean;
    isAdmin: boolean;
    user?: User | null;
    session?: Session | null;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authState$ = new BehaviorSubject<AuthState>({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        session: null
    });
    private supabaseService = inject(SupabaseService);
    private storageService = inject(StorageService);
    private initialized = false;
    private initPromise: Promise<void>;

    constructor() {
        this.initPromise = this.initAuthState();
    }

    /**
     * Espera a que se complete la inicialización
     */
    async waitForInitialization(): Promise<void> {
        return this.initPromise;
    }

    /**
     * Inicializa el estado de autenticación desde Supabase
     */
    private async initAuthState(): Promise<void> {
        if (this.initialized) return;

        try {
            const { data: { session } } = await this.supabaseService['supabase'].auth.getSession();

            if (session) {
                this.authState$.next({
                    isAuthenticated: true,
                    isAdmin: true, // Si tiene sesión de Supabase Auth, es admin
                    user: session.user,
                    session: session
                });
            }

            // Escuchar cambios en la autenticación
            this.supabaseService['supabase'].auth.onAuthStateChange((event, session) => {
                if (session) {
                    this.authState$.next({
                        isAuthenticated: true,
                        isAdmin: true,
                        user: session.user,
                        session: session
                    });
                } else {
                    this.authState$.next({
                        isAuthenticated: false,
                        isAdmin: false,
                        user: null,
                        session: null
                    });
                }
            });

            this.initialized = true;
        } catch (error) {
            console.error('Error initializing auth state:', error);
            this.initialized = true; // Marcar como inicializado incluso si hay error
        }
    }

    /**
     * Observable del estado de autenticación
     */
    get authState(): Observable<AuthState> {
        return this.authState$.asObservable();
    }

    /**
     * Obtiene el estado actual de autenticación
     */
    get currentAuthState(): AuthState {
        return this.authState$.value;
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        return this.authState$.value.isAuthenticated;
    }

    /**
     * Verifica si el usuario es administrador
     */
    isAdmin(): boolean {
        return this.authState$.value.isAdmin;
    }

    /**
     * Login de administrador con Supabase Auth
     * @param email Email del administrador
     * @param password Contraseña
     */
    loginAdmin(email: string, password: string): Observable<{ success: boolean; error?: string }> {
        return from(
            this.supabaseService['supabase'].auth.signInWithPassword({
                email,
                password
            })
        ).pipe(
            map(({ data, error }) => {
                if (error) {
                    return { success: false, error: error.message };
                }

                if (data.session) {
                    this.authState$.next({
                        isAuthenticated: true,
                        isAdmin: true,
                        user: data.user,
                        session: data.session
                    });
                    return { success: true };
                }

                return { success: false, error: 'No session created' };
            }),
            catchError(error => of({ success: false, error: error.message }))
        );
    }

    /**
     * Cierra la sesión del administrador
     */
    logout(): Observable<{ success: boolean; error?: string }> {
        return from(
            this.supabaseService['supabase'].auth.signOut()
        ).pipe(
            map(({ error }) => {
                if (error) {
                    return { success: false, error: error.message };
                }

                this.authState$.next({
                    isAuthenticated: false,
                    isAdmin: false,
                    user: null,
                    session: null
                });

                return { success: true };
            }),
            catchError(error => of({ success: false, error: error.message }))
        );
    }

    /**
     * Obtiene el token de acceso actual
     */
    getAccessToken(): string | null {
        return this.authState$.value.session?.access_token || null;
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser(): User | null {
        return this.authState$.value.user || null;
    }
}
