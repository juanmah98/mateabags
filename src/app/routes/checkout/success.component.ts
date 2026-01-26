import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-checkout-success',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="success-container">
      <div class="container py-5">
        <div class="card shadow-sm mx-auto" style="max-width: 600px;">
          <div class="card-body text-center py-5">
            <div class="icon-circle mx-auto mb-4">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 80px;"></i>
            </div>
            
            <h1 class="mb-3">¡Pago Exitoso!</h1>
            <p class="text-muted mb-4">
              Tu pedido ha sido procesado correctamente.<br>
              Recibirás un email de confirmación pronto.
            </p>
            
            <div class="alert alert-info mb-4">
              <i class="bi bi-info-circle me-2"></i>
              Tu pedido está siendo preparado para el envío.
            </div>
            
            <div class="d-grid gap-2 col-md-6 mx-auto">
              <button class="btn btn-primary" (click)="goHome()">
                <i class="bi bi-house-fill me-2"></i>Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .success-container {
      min-height: 80vh;
      background: linear-gradient(to bottom, #f8f9fa, #ffffff);
    }
    
    .icon-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: #f0f9ff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CheckoutSuccessComponent implements OnInit {
    constructor(private router: Router) { }

    ngOnInit() {
        // Limpiar order_id pendiente del localStorage
        localStorage.removeItem('pending_order_id');
    }

    goHome() {
        this.router.navigate(['/']);
    }
}
