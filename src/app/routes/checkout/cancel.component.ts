import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-cancel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cancel-container">
      <div class="container py-5">
        <div class="card shadow-sm mx-auto" style="max-width: 600px;">
          <div class="card-body text-center py-5">
            <div class="icon-circle mx-auto mb-4">
              <i class="bi bi-x-circle-fill text-warning" style="font-size: 80px;"></i>
            </div>
            
            <h1 class="mb-3">Pago Cancelado</h1>
            <p class="text-muted mb-4">
              No se realizó ningún cargo a tu tarjeta.<br>
              Puedes volver al checkout para intentar nuevamente.
            </p>
            
            <div class="alert alert-warning mb-4">
              <i class="bi bi-info-circle me-2"></i>
              Puedes volver a intentarlo cuando quieras
            </div>
            
            <div class="d-grid gap-2 col-md-8 mx-auto">
              <button class="btn btn-primary" (click)="goBack()">
                <i class="bi bi-bag-fill me-2"></i>Ver Producto
              </button>
              <button class="btn btn-outline-secondary" (click)="goHome()">
                <i class="bi bi-house-fill me-2"></i>Ir al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cancel-container {
      min-height: 80vh;
      background: linear-gradient(to bottom, #fff3cd, #ffffff);
    }
    
    .icon-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: #fff9e6;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CheckoutCancelComponent {
  constructor(private router: Router) { }

  goBack() {
    // Redirigir al producto en lugar de volver al checkout vacío
    this.router.navigate(['/home/product-sale']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
