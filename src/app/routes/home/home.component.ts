import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { animate } from 'animejs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Variables del carrusel
  currentSlide = 0;
  totalSlides = 6;
  isDragging = false;
  startX = 0;
  currentX = 0;
  dragOffset = 0;
  
  ngOnInit() {
    // Inicialización del componente
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
}
