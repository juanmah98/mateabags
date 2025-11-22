import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
      this.updateCarousel();
    }
  }
  
  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateCarousel();
    }
  }
  
  goToSlide(index: number) {
    if (index >= 0 && index < this.totalSlides) {
      console.log(`Navegando a slide ${index} desde slide ${this.currentSlide}`);
      this.currentSlide = index;
      
      // Forzar la actualización del DOM
      setTimeout(() => {
        this.updateCarousel();
      }, 0);
    }
  }
  
  // Método para actualizar la posición del carrusel
  private updateCarousel() {
    const track = document.querySelector('.carousel-track') as HTMLElement;
    const container = document.querySelector('.carousel-container') as HTMLElement;
    
    if (track && container) {
      const cardWidth = 400; // Ancho de cada tarjeta
      const gap = 60; // Espacio entre tarjetas (debe coincidir con CSS)
      const containerWidth = container.offsetWidth;
      const trackPadding = 50; // Padding del track (debe coincidir con CSS)
      
      // Calcular la posición para centrar la tarjeta
      const cardPosition = this.currentSlide * (cardWidth + gap) + trackPadding;
      const centerOffset = (containerWidth - cardWidth) / 2;
      const finalOffset = cardPosition - centerOffset;
      
      console.log(`Slide ${this.currentSlide}: cardPosition=${cardPosition}, centerOffset=${centerOffset}, finalOffset=${finalOffset}, containerWidth=${containerWidth}`);
      
      // Aplicar el transform correctamente
      // Si finalOffset es negativo, necesitamos mover hacia la derecha (valor positivo)
      // Si finalOffset es positivo, necesitamos mover hacia la izquierda (valor negativo)
      const transformValue = `translateX(${-finalOffset}px)`;
      track.style.transform = transformValue;
      console.log(`Transform aplicado: ${transformValue}`);
      
      // Verificar que se aplicó correctamente
      const computedStyle = window.getComputedStyle(track);
      console.log(`Transform real: ${computedStyle.transform}`);
      
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
      const cardWidth = 400;
      const gap = 60;
      const containerWidth = container.offsetWidth;
      const trackPadding = 50;
      
      // Calcular la posición base centrada
      const cardPosition = this.currentSlide * (cardWidth + gap) + trackPadding;
      const centerOffset = (containerWidth - cardWidth) / 2;
      const baseOffset = cardPosition - centerOffset;
      
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
      this.updateCarousel();
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
      const cardWidth = 400;
      const gap = 60;
      const containerWidth = container.offsetWidth;
      const trackPadding = 50;
      
      // Calcular la posición base centrada
      const cardPosition = this.currentSlide * (cardWidth + gap) + trackPadding;
      const centerOffset = (containerWidth - cardWidth) / 2;
      const baseOffset = cardPosition - centerOffset;
      
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
      this.updateCarousel();
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
