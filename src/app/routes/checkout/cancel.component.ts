import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../core';

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
            
            <div *ngIf="isUpdating" class="mb-3 text-muted small">
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Actualizando estado del pedido...
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
export class CheckoutCancelComponent implements OnInit {
  isUpdating = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) { }

  ngOnInit(): void {
    // Obtener order_id de la URL y marcar como cancelado
    this.route.queryParams.subscribe(async params => {
      const orderId = params['order_id'];
      if (orderId) {
        console.log('❌ Cancel page loaded for order:', orderId);
        this.markOrderAsCancelled(orderId);
      }
    });
  }

  async markOrderAsCancelled(orderId: string) {
    this.isUpdating = true;
    try {
      const { error } = await this.supabaseService.updateOrderStatus(orderId, 'cancelled');
      if (error) {
        console.error('Error marking order as cancelled:', error);
      } else {
        console.log('✅ Order marked as cancelled successfully');
      }
    } catch (err) {
      console.error('Exception marking order as cancelled:', err);
    } finally {
      this.isUpdating = false;
    }
  }

  goBack() {
    // Redirigir al producto en lugar de volver al checkout vacío
    this.router.navigate(['/home/product-sale']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
