import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  accessKey = '';
  errorMessage = '';
  
  private readonly validKey = 'MATEA2025'; // Cambia esta clave por la que quieras usar
  
  constructor(private router: Router) {}
  
  onSubmit() {
    if (this.accessKey.trim() === '') {
      this.errorMessage = 'Por favor, ingresa la clave de acceso.';
      return;
    }
    
    if (this.accessKey === this.validKey) {
      // Guardar la clave en sessionStorage para mantener la sesión
      sessionStorage.setItem('home_access_key', this.accessKey);
      this.errorMessage = '';
      // Redirigir al home
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Clave incorrecta. Intenta nuevamente.';
      this.accessKey = '';
    }
  }
}

