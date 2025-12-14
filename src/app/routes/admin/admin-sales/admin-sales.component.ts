import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sales.component.html',
  styleUrl: './admin-sales.component.scss'
})
export class AdminSalesComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;

  // Stats
  totalSales = 0;
  shippedOrders = 0;
  processingOrders = 0;
  paidOrders = 0;

  // Modal
  selectedOrder: any = null;
  showModal = false;
  isUpdating = false;

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService.getOrdersWithDetails();

      if (error) {
        console.error('Error loading orders:', error);
        alert(`Error: ${(error as any).message || error}`);
        return;
      }

      if (data) {
        this.orders = data;
        this.calculateStats();
        // Warn if empty
        if (data.length === 0) {
          console.log('No orders found. Check RLS or if table is empty.');
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      this.isLoading = false;
    }
  }

  calculateStats() {
    this.totalSales = this.orders.length;
    this.shippedOrders = this.orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length;
    this.processingOrders = this.orders.filter(o => o.status === 'processing').length;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'shipped':
      case 'delivered':
        return 'status-shipped';
      case 'pending':
      case 'processing':
        return 'status-pending';
      case 'paid':
        return 'status-paid';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'paid': 'Pagado',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  // Modal Methods
  openModal(order: any) {
    this.selectedOrder = order;
    this.showModal = true;
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    this.selectedOrder = null;
    document.body.style.overflow = 'auto';
  }

  async updateStatus(newStatus: string) {
    if (!this.selectedOrder || this.isUpdating) return;

    this.isUpdating = true;
    try {
      const { data, error } = await this.supabaseService.updateOrderStatus(this.selectedOrder.id, newStatus);

      if (!error) {
        // Update local state
        this.selectedOrder.status = newStatus;
        const index = this.orders.findIndex(o => o.id === this.selectedOrder.id);
        if (index !== -1) {
          this.orders[index].status = newStatus;
          this.calculateStats();
        }
      } else {
        alert('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    } finally {
      this.isUpdating = false;
    }
  }

  // Helper to check if order has gift items
  hasGiftItems(order: any): boolean {
    return order.items?.some((item: any) => item.is_gift);
  }
}
