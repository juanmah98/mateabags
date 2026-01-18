import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { animate } from 'animejs';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // Variables del carrusel
  currentSlide = 0;
  totalSlides = 6;
  isDragging = false;
  startX = 0;
  currentX = 0;
  dragOffset = 0;

  // Lightbox para la galería estática
  lightboxImage: { src: string; alt: string } | null = null;

  // Observers para las animaciones de scroll
  private scrollObservers: IntersectionObserver[] = [];

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

  private errorTimeoutId?: ReturnType<typeof setTimeout>;

  constructor(private supabaseService: SupabaseService) { }

  ngOnInit() {
    // Inicialización del componente
  }

  ngAfterViewInit() {
    // Esperamos un momento para que Angular renderice completamente el DOM
    setTimeout(() => {
      this.initScrollAnimations();
    }, 100);
  }

  ngOnDestroy() {
    // Limpiar todos los observers
    this.scrollObservers.forEach(observer => observer.disconnect());
    this.scrollObservers = [];
    // Limpiar timeout de errores
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }
  }

  /**
   * Inicializa las animaciones de scroll para secciones y textos
   */
  private initScrollAnimations() {
    this.initSectionAnimations();
    this.initTextAnimations();
  }

  /**
   * Animación para secciones (fade + slide up)
   */
  private initSectionAnimations() {
    // Excluimos hero-section y main-product-section (tiene background-attachment: fixed)
    const sections = document.querySelectorAll('.section:not(.hero-section):not(.main-product-section),.polaroid-section');

    sections.forEach((section: any) => {
      // Estado inicial
      section.style.opacity = '0';
      section.style.transform = 'translateY(30px)';

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Scroll hacia abajo: aparecer
            animate(section, {
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 800,
              easing: 'easeOutExpo'
            });
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      });

      observer.observe(section);
      this.scrollObservers.push(observer);
    });
  }

  /**
   * Animación para textos (títulos h1, h2 y descripciones p)
   */
  private initTextAnimations() {
    // Seleccionar títulos y descripciones dentro de secciones (excluyendo hero-section)
    const texts = document.querySelectorAll('.section:not(.hero-section) h1, .section:not(.hero-section) h2, .section:not(.hero-section) p');

    texts.forEach((text: any) => {
      // Estado inicial
      text.style.opacity = '0';
      text.style.transform = 'translateY(20px)';

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Scroll hacia abajo: aparecer
            animate(text, {
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 700,
              easing: 'easeOutCubic'
            });
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      });

      observer.observe(text);
      this.scrollObservers.push(observer);
    });
  }

  // --- Lightbox de la galería estática ---

  openLightbox(src: string, alt: string) {
    this.lightboxImage = { src, alt };
  }

  closeLightbox() {
    this.lightboxImage = null;
  }

  // Navegación del carrusel
  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.updateCarousel(true);
    }
  }

  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateCarousel(true);
    }
  }

  goToSlide(index: number) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentSlide = index;

      // Forzar la actualización del DOM y animar
      setTimeout(() => {
        this.updateCarousel(true);
      }, 0);
    }
  }

  // Método para actualizar la posición del carrusel
  private updateCarousel(animateTransition: boolean = false) {
    const track = document.querySelector('.carousel-track') as HTMLElement;
    const container = document.querySelector('.carousel-container') as HTMLElement;

    if (track && container) {
      const cards = track.querySelectorAll('.carousel-card') as NodeListOf<HTMLElement>;
      if (!cards.length || this.currentSlide < 0 || this.currentSlide >= cards.length) {
        return;
      }

      const activeCard = cards[this.currentSlide];
      const containerWidth = container.offsetWidth;

      // Centro de la tarjeta activa dentro del track
      const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
      // Offset necesario para centrar la tarjeta en el contenedor
      const finalOffset = cardCenter - containerWidth / 2;

      if (animateTransition) {
        // Animación suave con anime.js
        animate(track, {
          translateX: -finalOffset,
          duration: 600,
          easing: 'easeOutExpo'
        });
      } else {
        // Aplicación inmediata (por ejemplo, al iniciar o durante drag)
        track.style.transform = `translateX(${-finalOffset}px)`;
      }

      // Actualizar indicadores
      this.updateIndicators();
    }
  }

  // Método para actualizar los indicadores
  private updateIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
      if (index === this.currentSlide) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }

  // Eventos de deslizamiento (swipe)
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX;
    this.currentX = this.startX;
    this.dragOffset = 0;

    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    this.currentX = event.clientX;
    this.dragOffset = this.currentX - this.startX;

    const track = document.querySelector('.carousel-track') as HTMLElement;
    const container = document.querySelector('.carousel-container') as HTMLElement;

    if (track && container) {
      const cards = track.querySelectorAll('.carousel-card') as NodeListOf<HTMLElement>;
      if (!cards.length || this.currentSlide < 0 || this.currentSlide >= cards.length) {
        return;
      }

      const activeCard = cards[this.currentSlide];
      const containerWidth = container.offsetWidth;
      const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
      const baseOffset = cardCenter - containerWidth / 2;

      // Aplicar el arrastre
      const dragTransform = baseOffset - this.dragOffset;
      track.style.transform = `translateX(${-dragTransform}px)`;
    }
  }

  onMouseUp() {
    if (!this.isDragging) return;

    this.isDragging = false;

    // Determinar si debe cambiar de slide basado en el deslizamiento
    const threshold = 100; // Píxeles mínimos para cambiar de slide

    if (this.dragOffset > threshold && this.currentSlide > 0) {
      this.previousSlide();
    } else if (this.dragOffset < -threshold && this.currentSlide < this.totalSlides - 1) {
      this.nextSlide();
    } else {
      // Volver a la posición original
      this.updateCarousel(true);
    }
  }

  // Eventos de touch para móviles
  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.startX = event.touches[0].clientX;
    this.currentX = this.startX;
    this.dragOffset = 0;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;

    this.currentX = event.touches[0].clientX;
    this.dragOffset = this.currentX - this.startX;

    const track = document.querySelector('.carousel-track') as HTMLElement;
    const container = document.querySelector('.carousel-container') as HTMLElement;

    if (track && container) {
      const cards = track.querySelectorAll('.carousel-card') as NodeListOf<HTMLElement>;
      if (!cards.length || this.currentSlide < 0 || this.currentSlide >= cards.length) {
        return;
      }

      const activeCard = cards[this.currentSlide];
      const containerWidth = container.offsetWidth;
      const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
      const baseOffset = cardCenter - containerWidth / 2;

      // Aplicar el arrastre
      const dragTransform = baseOffset - this.dragOffset;
      track.style.transform = `translateX(${-dragTransform}px)`;
    }
  }

  onTouchEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;

    // Determinar si debe cambiar de slide basado en el deslizamiento
    const threshold = 80; // Píxeles mínimos para cambiar de slide en móvil

    if (this.dragOffset > threshold && this.currentSlide > 0) {
      this.previousSlide();
    } else if (this.dragOffset < -threshold && this.currentSlide < this.totalSlides - 1) {
      this.nextSlide();
    } else {
      // Volver a la posición original
      this.updateCarousel(true);
    }
  }

  // Evento de rueda del mouse con Shift
  onWheel(event: WheelEvent) {
    if (event.shiftKey) {
      event.preventDefault();

      if (event.deltaY > 0) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }
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

  instagram() {
    this.showSuccessPopup = false;
    this.submitSuccess = false;
    window.open('https://www.instagram.com/mateabags/', '_blank');
  }

  scrollToForm() {
    const formSection = document.querySelector('.form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
