import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';

interface DashboardStats {
  totalWaitlist: number;
  totalSales: number;
  totalCustomers: number;
  pendingOrders: number;
}

interface ChartDataPoint {
  day: string;
  date: string;
  value: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalWaitlist: 0,
    totalSales: 0,
    totalCustomers: 0,
    pendingOrders: 0
  };

  isLoading = true;

  chartData: ChartDataPoint[] = [];
  maxChartValue: number = 0;
  chartType: 'bar' | 'analysis' = 'bar';

  // Analysis Metrics
  analysisMetrics = {
    totalVisits: 0,         // Visitas Totales
    conversionRate: 0,      // Ventas / Visitas
    purchaseIntent: 0,      // Inicios de Checkout / Visitas
    checkoutSuccess: 0,     // Ventas / Inicios de Checkout
    paymentSuccessRate: 0   // Ventas / Submit
  };

  constructor(private supabaseService: SupabaseService) { }

  setChartType(type: 'bar' | 'analysis') {
    this.chartType = type;
  }

  async ngOnInit() {
    await this.loadStats();
    await this.loadAnalyticsChart();
  }

  async loadStats() {
    this.isLoading = true;

    try {
      // Usar Promise.all para cargar todo en paralelo
      const [waitlistCount, customersCount, salesCount, pendingCount] = await Promise.all([
        this.supabaseService.getWaitlistCount(),
        this.supabaseService.getCustomersCount(),
        this.supabaseService.getOrdersCount(),
        this.supabaseService.getPendingOrdersCount()
      ]);

      this.stats = {
        totalWaitlist: waitlistCount,
        totalCustomers: customersCount,
        totalSales: salesCount,
        pendingOrders: pendingCount
      };

    } catch (error) {
      console.error('Error loading stats', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Carga los datos de analíticas (Embudo)
   */
  async loadAnalyticsChart() {
    try {
      // Obtener estadísticas de los últimos 30 días
      const { data, error } = await this.supabaseService.getAnalyticsStats(30);

      if (error) {
        console.error('Error loading analytics data:', error);
        return;
      }

      // Mapear datos al formato del gráfico
      // Eventos: view_page (product), start_checkout, submit_checkout, payment_success, payment_cancel

      const counts: Record<string, number> = {};
      if (data) {
        data.forEach((item: any) => {
          counts[item.event_type] = Number(item.count);
        });
      }

      // Definir el embudo
      this.chartData = [
        { day: 'Visitas', date: '', value: counts['view_page'] || 0 }, // Product Page Views
        { day: 'Inicio Check.', date: '', value: counts['start_checkout'] || 0 },
        { day: 'Submit Check.', date: '', value: counts['submit_checkout'] || 0 },
        { day: 'Pagado', date: '', value: counts['payment_success'] || 0 },
        { day: 'Cancelado', date: '', value: counts['payment_cancel'] || 0 }
      ];

      // Calcular valor máximo para escalado
      this.maxChartValue = Math.max(...this.chartData.map(d => d.value));
      // Evitar división por cero y dar un pequeño margen
      if (this.maxChartValue === 0) this.maxChartValue = 10;
      else this.maxChartValue = Math.ceil(this.maxChartValue * 1.1);

      // Calcular Métricas de Análisis
      const visits = counts['view_page'] || 0;
      const starts = counts['start_checkout'] || 0;
      const submits = counts['submit_checkout'] || 0;
      const sales = counts['payment_success'] || 0;

      this.analysisMetrics = {
        totalVisits: visits,
        conversionRate: visits > 0 ? (sales / visits) * 100 : 0,
        purchaseIntent: visits > 0 ? (starts / visits) * 100 : 0,
        checkoutSuccess: starts > 0 ? (sales / starts) * 100 : 0,
        paymentSuccessRate: submits > 0 ? (sales / submits) * 100 : 0
      };

    } catch (error) {
      console.error('Error loading analytics chart:', error);
    }
  }
}
