import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';


export interface WaitlistEntry {
  name: string;
  email: string;
  codigo?: string;
  reveal?: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  /**
   * Genera un código único de 6 caracteres basado en el email
   * @param email Email del usuario
   * @returns Código de 6 caracteres en mayúsculas
   */
  private generateCode(email: string): string {
    // Crear un hash simple del email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }

    // Usar el hash para generar un código de 6 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let num = Math.abs(hash);

    for (let i = 0; i < 6; i++) {
      code += chars[num % chars.length];
      num = Math.floor(num / chars.length);
    }

    return code;
  }

  /**
   * Genera el código completo en formato NOMBRE-CODIGO
   * @param name Nombre del usuario
   * @param email Email del usuario
   * @returns Código en formato NOMBRE-CODIGO (ej: JUAN-ABCDEF)
   */
  generateFullCode(name: string, email: string): string {
    // Tomar solo la primera palabra del nombre
    const firstName = name.trim().split(/\s+/)[0];
    const nameUpper = firstName.toUpperCase();
    const code = this.generateCode(email);
    return `${nameUpper}-${code}`;
  }

  /**
   * Guarda un nuevo registro en la lista de espera
   * @param entry Datos del formulario (name y email)
   * @returns Promise con el resultado de la inserción
   */
  async addToWaitlist(entry: WaitlistEntry): Promise<{ data: any; error: any }> {
    try {
      // Generar el código completo
      const codigo = this.generateFullCode(entry.name, entry.email);

      const { data, error } = await this.supabase
        .from('waitlist')
        .insert([
          {
            name: entry.name,
            email: entry.email,
            codigo: codigo,
            reveal: true
          }
        ])
        .select();

      return { data, error };
    } catch (error) {
      console.error('Error al agregar a la lista de espera:', error);
      return { data: null, error };
    }
  }

  /**
   * Verifica si un email ya existe en la lista de espera
   * @param email Email a verificar
   * @returns Promise con true si existe, false si no
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('waitlist')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      // Si hay error, retornar false (asumimos que no existe)
      if (error) {
        console.error('Error al verificar email:', error);
        return false;
      }

      // Retornar true si hay al menos un resultado
      return data !== null && data.length > 0;
    } catch (error) {
      console.error('Error al verificar email:', error);
      return false;
    }
  }

  /**
   * Obtiene el código de un usuario por su email
   * @param email Email del usuario
   * @returns Promise con el código o null si no existe
   */
  async getCodeByEmail(email: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('waitlist')
        .select('codigo')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error al obtener código:', error);
        return null;
      }

      return data?.codigo || null;
    } catch (error) {
      console.error('Error al obtener código:', error);
      return null;
    }
  }
}

