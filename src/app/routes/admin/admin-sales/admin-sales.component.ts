import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';

interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  status: string;
  created_at?: string;
  customer?: {
    name?: string;
    email: string;
  };
}

@Component({
  selector: 'app-admin-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-sales.component.html',
  styleUrl: './admin-sales.component.scss'
})
export class AdminSalesComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  totalSales = 0;
  shippedOrders = 0;
  pendingOrders = 0;

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService['supabase']
        .from('orders')
        .select(`
          *,
          customer:customers(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        this.orders = data;
        this.calculateStats();
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
    this.pendingOrders = this.orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'shipped':
      case 'delivered':
        return 'status-shipped';
      case 'pending':
      case 'processing':
        return 'status-pending';
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
}
