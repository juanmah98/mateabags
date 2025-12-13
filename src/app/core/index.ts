/**
 * Core Module - Exports
 * 
 * Este módulo contiene servicios singleton, guards e interceptors
 * que se usan globalmente en toda la aplicación.
 */

// Services
export * from './services/auth.service';
export * from './services/storage.service';
export * from './services/notification.service';
export * from './services/loading.service';
export * from './services/supabase.service';

// Guards
export * from './guards/auth.guard';
export * from './guards/admin.guard';
export * from './guards/home-date.guard';

// Interceptors
export * from './interceptors/auth.interceptor';
export * from './interceptors/error.interceptor';
export * from './interceptors/loading.interceptor';
