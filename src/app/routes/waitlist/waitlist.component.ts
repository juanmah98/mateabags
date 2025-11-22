import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './waitlist.component.html',
  styleUrl: './waitlist.component.scss'
})
export class WaitlistComponent implements OnInit, OnDestroy {
  // FECHA OBJETIVO - Cambia esta fecha según necesites
  // Formato: año, mes (0-11), día, hora, minuto, segundo
  targetDate: Date = new Date(2026, 1, 1, 23, 59, 59); // 01 de febrero de 2026, 23:59:59
  
  // Datos del formulario
  formData = {
    nombre: '',
    email: ''
  };
  
  // Countdown timer
  countdown = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  
  private countdownInterval: any;
  
  ngOnInit() {
    this.startCountdown();
  }
  
  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
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
  
  // Método para hacer scroll al formulario
  scrollToForm() {
    const formElement = document.getElementById('waitlist-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  // Método para enviar el formulario
  onSubmit() {
    if (this.formData.nombre && this.formData.email) {
      console.log('Formulario enviado:', this.formData);
      // TODO: Integrar con Supabase aquí
      alert('¡Gracias por unirte a la lista privada!');
      this.formData = { nombre: '', email: '' }; // Limpiar formulario
    } else {
      alert('Por favor, completa todos los campos del formulario.');
    }
  }
}
