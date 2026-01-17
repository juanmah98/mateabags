import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';

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
  private router = inject(Router);
  private storageService = inject(StorageService);

  onSubmit() {
    if (this.accessKey.trim() === '') {
      this.errorMessage = 'Por favor, ingresa la clave de acceso.';
      return;
    }

    if (this.accessKey === this.validKey) {
      // Guardar la clave en sessionStorage usando StorageService
      this.storageService.setSessionItem('home_access_key', this.accessKey);
      this.errorMessage = '';
      // Redirigir al home
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Clave incorrecta. Intenta nuevamente.';
      this.accessKey = '';
    }
  }
}

