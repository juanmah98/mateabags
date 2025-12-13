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
   * Envío masivo de emails (pendiente de implementar edge function)
   */
  async sendMassEmail() {
    if (this.subscribers.length === 0) {
      this.notifications.warning('No hay suscriptores en la lista');
      return;
    }

    // Confirmación
    const confirmed = confirm(
      `¿Estás seguro de enviar un email a ${this.totalSubscribers} suscriptores?`
    );

    if (!confirmed) return;

    this.isSending = true;

    try {
      // TODO: Llamar a la Edge Function de Supabase
      // const { data, error } = await this.supabaseService['supabase']
      //   .functions.invoke('send-mass-email', {
      //     body: { subscribers: this.subscribers }
      //   });

      // Simulación por ahora
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.notifications.success('Función de envío masivo pendiente de implementar');
      console.log('Enviar email a:', this.subscribers.map(s => s.email));

    } catch (error) {
      console.error('Error sending mass email:', error);
      this.notifications.error('Error al enviar emails');
    } finally {
      this.isSending = false;
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  }
}
