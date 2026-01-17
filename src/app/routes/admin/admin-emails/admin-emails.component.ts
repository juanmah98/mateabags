import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';

interface WaitlistSubscriber {
  id: number;
  name: string;
  email: string;
  codigo?: string;
  created_at?: string;
}

@Component({
  selector: 'app-admin-emails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-emails.component.html',
  styleUrl: './admin-emails.component.scss'
})
export class AdminEmailsComponent implements OnInit {
  subscribers: WaitlistSubscriber[] = [];
  isLoading = true;
  isSending = false;
  totalSubscribers = 0;

  constructor(
    private supabaseService: SupabaseService,
    private notifications: NotificationService
  ) { }

  async ngOnInit() {
    await this.loadSubscribers();
  }

  async loadSubscribers() {
    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService['supabase']
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        this.subscribers = data;
        this.totalSubscribers = data.length;
      }
    } catch (error) {
      console.error('Error loading waitlist subscribers:', error);
      this.notifications.error('Error al cargar la lista de suscriptores');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Envío masivo de emails a todos los suscriptores de la waitlist
   */
  async sendMassEmail() {
    if (this.subscribers.length === 0) {
      this.notifications.warning('No hay suscriptores en la lista');
      return;
    }

    // Confirmación
    const confirmed = confirm(
      `¿Estás seguro de enviar un email a ${this.totalSubscribers} suscriptores?\n\nEsto enviará un email de código de acceso a cada suscriptor.`
    );

    if (!confirmed) return;

    this.isSending = true;

    try {
      console.log('Iniciando envío masivo de emails...');

      // Llamar a la Edge Function de Supabase
      const { data, error } = await this.supabaseService['supabase']
        .functions.invoke('revealEmail', {
          body: {}
        });

      if (error) {
        console.error('Error en Edge Function:', error);
        this.notifications.error('Error al enviar emails: ' + error.message);
        return;
      }

      // Procesar respuesta
      if (data) {
        const { total, sent, failed } = data;

        console.log('Resultado del envío:', { total, sent, failed });

        if (failed > 0) {
          this.notifications.warning(
            `Envío completado: ${sent} exitosos, ${failed} fallidos de ${total} total`
          );
        } else {
          this.notifications.success(
            `¡Emails enviados exitosamente! ${sent} de ${total} suscriptores`
          );
        }

        // Recargar la lista para mostrar los campos actualizados
        await this.loadSubscribers();
      } else {
        this.notifications.warning('No se recibió respuesta del servidor');
      }

    } catch (error: any) {
      console.error('Error sending mass email:', error);
      this.notifications.error(
        'Error al enviar emails: ' + (error?.message || 'Error desconocido')
      );
    } finally {
      this.isSending = false;
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  }
}
