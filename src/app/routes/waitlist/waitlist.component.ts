import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { animate, stagger } from 'animejs';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './waitlist.component.html',
  styleUrl: './waitlist.component.scss'
})
export class WaitlistComponent implements OnInit, OnDestroy, AfterViewInit {
  // FECHA OBJETIVO - Cambia esta fecha según necesites
  // Formato: año, mes (0-11), día, hora, minuto, segundo
  targetDate: Date = new Date(2026, 1, 1, 23, 59, 59); // 01 de febrero de 2026, 23:59:59

  // Datos del formulario
  formData = {
    nombre: '',
    email: ''
  };

  // Estados del formulario
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  showSuccessPopup = false;

  // Countdown timer
  countdown = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  private countdownInterval: any;
  private errorTimeoutId?: ReturnType<typeof setTimeout>;
  constructor(private supabaseService: SupabaseService) { }

  ngOnInit() {
    this.startCountdown();
  }

  ngAfterViewInit() {
    // Esperamos un momento para que Angular renderice completamente el DOM
    setTimeout(() => {
      this.initCountdownAnimation();
    }, 100);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }
  }

  startCountdown() {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  updateCountdown() {
    const now = new Date().getTime();
    const target = this.targetDate.getTime();
    const difference = target - now;

    if (difference > 0) {
      this.countdown.days = Math.floor(difference / (1000 * 60 * 60 * 24));
      this.countdown.hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.countdown.minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      this.countdown.seconds = Math.floor((difference % (1000 * 60)) / 1000);
    } else {
      // Si la fecha ya pasó, mostrar ceros
      this.countdown.days = 0;
      this.countdown.hours = 0;
      this.countdown.minutes = 0;
      this.countdown.seconds = 0;
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    }
  }

  // Método helper para formatear números con dos dígitos
  formatNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }

  /**
   * Inicializa la animación del countdown timer cuando entra en el viewport
   * 
   * Explicación del código:
   * 1. Buscamos el contenedor del countdown y los items individuales
   * 2. Configuramos el estado inicial (ocultos y escalados hacia abajo)
   * 3. Usamos Intersection Observer para detectar cuando el elemento entra en vista
   * 4. Cuando entra en vista, activamos la animación con anime.js usando stagger
   */
  initCountdownAnimation() {
    const countdownContainer = document.querySelector('.countdown-container');
    const countdownItems = document.querySelectorAll('.countdown-item');

    if (!countdownContainer || countdownItems.length === 0) {
      return;
    }

    // Configuramos el estado inicial de los elementos (ocultos)
    // Esto se hace antes de la animación para que no se vean hasta que entren en vista
    countdownItems.forEach((item: any) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px) scale(0.8)';
    });

    // Variable para asegurar que la animación solo se ejecute una vez
    let hasAnimated = false;

    // Usamos Intersection Observer para detectar cuando el elemento entra en el viewport
    // Es más compatible y funciona igual de bien que el Scroll Observer de anime.js
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Cuando el elemento entra en vista (isIntersecting = true) y no se ha animado aún
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;

          // Animamos los items del countdown con anime.js
          animate(countdownItems, {
            opacity: [0, 1],                    // Fade in: de invisible a visible
            translateY: [0, 0],                // Se mueve desde abajo hacia su posición
            scale: [1, 1],                    // Escala desde pequeño a tamaño normal
            duration: 800,                      // Duración de 800ms
            delay: stagger(100),                // Cada item se anima 100ms después del anterior
            ease: 'easeOutExpo'                 // Easing suave y elegante
          });

          // Dejamos de observar una vez que se ha animado
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3,  // Se activa cuando el 30% del elemento es visible
      rootMargin: '0px 0px -100px 0px'  // Se activa un poco antes de que entre completamente
    });

    // Empezamos a observar el contenedor del countdown
    observer.observe(countdownContainer);
  }


  // Método para hacer scroll al formulario
  scrollToForm() {
    const formElement = document.getElementById('waitlist-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Método para enviar el formulario
  async onSubmit() {
    // Validar campos
    if (!this.formData.nombre || !this.formData.email) {
      this.showError('Por favor, completa todos los campos del formulario.');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.showError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // Resetear estados
    this.submitError = '';
    this.submitSuccess = false;
    this.isSubmitting = true;

    try {
      // Normalizar el email (minúsculas y sin espacios)
      const normalizedEmail = this.formData.email.toLowerCase().trim();

      // Verificar si el email ya existe
      const emailExists = await this.supabaseService.emailExists(normalizedEmail);

      if (emailExists) {
        this.showError('Este correo electrónico ya está registrado en la lista.');
        this.isSubmitting = false;
        return;
      }

      // Guardar en Supabase
      const { data, error } = await this.supabaseService.addToWaitlist({
        name: this.formData.nombre.trim(),
        email: normalizedEmail
      });

      if (error) {
        console.error('Error al guardar:', error);
        this.showError('Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.');
      } else {
        this.submitSuccess = true;
        this.showSuccessPopup = true;
        this.formData = { nombre: '', email: '' }; // Limpiar formulario

      }
    } catch (error) {
      console.error('Error inesperado:', error);
      this.showError('Hubo un error inesperado. Por favor, intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  private showError(message: string) {
    this.submitError = message;
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }
    this.errorTimeoutId = setTimeout(() => {
      this.submitError = '';
      this.errorTimeoutId = undefined;
    }, 4000);
  }

  closeSuccessPopup() {
    this.showSuccessPopup = false;
    this.submitSuccess = false;
  }
}
