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
  // Analysis Metrics
  analysisMetrics = {
    totalVisits: 0,
    conversionRate: 0,
    purchaseIntent: 0,
    formCompletionRate: 0,
    checkoutAbandonment: 0,
    paymentApprovalRate: 0,
    cancellationRate: 0,
    // Ratios Strings
    conversionRatio: '',
    purchaseIntentRatio: '',
    formCompletionRatio: '',
    formAbandonmentRatio: '',
    paymentApprovalRatio: '',
    cancellationRatio: ''
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
      const cancels = counts['payment_cancel'] || 0;

      // Ensure stable denominators
      const paymentBase = Math.max(submits, sales + cancels);

      this.analysisMetrics = {
        totalVisits: visits,
        conversionRate: visits > 0 ? (sales / visits) * 100 : 0,
        purchaseIntent: visits > 0 ? (starts / visits) * 100 : 0,

        // Funnel Step: Form
        formCompletionRate: starts > 0 ? (submits / starts) * 100 : 0,
        checkoutAbandonment: starts > 0 ? ((starts - submits) / starts) * 100 : 0,

        // Funnel Step: Payment
        paymentApprovalRate: paymentBase > 0 ? (sales / paymentBase) * 100 : 0,
        cancellationRate: paymentBase > 0 ? (cancels / paymentBase) * 100 : 0,

        // Ratios
        conversionRatio: this.getRatioString(sales, visits),
        purchaseIntentRatio: this.getRatioString(starts, visits),
        formCompletionRatio: this.getRatioString(submits, starts),
        formAbandonmentRatio: this.getRatioString(starts - submits, starts),
        paymentApprovalRatio: this.getRatioString(sales, paymentBase),
        cancellationRatio: this.getRatioString(cancels, paymentBase)
      };

    } catch (error) {
      console.error('Error loading analytics chart:', error);
    }
  }

  private getRatioString(count: number, total: number): string {
    if (total === 0 || count === 0) return '0 de cada ' + total;

    // Simplificar fracción
    const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
    const common = gcd(count, total);

    // Si la fracción es muy compleja (ej: 13/87), intentar aproximar
    const p = count / total;

    if (p > 0.99) return 'Totalidad';
    if (p < 0.01) return 'Menos del 1%';

    // Aproximaciones comunes
    if (Math.abs(p - 0.5) < 0.05) return '1 de cada 2';
    if (Math.abs(p - 0.33) < 0.05) return '1 de cada 3';
    if (Math.abs(p - 0.25) < 0.05) return '1 de cada 4';
    if (Math.abs(p - 0.2) < 0.05) return '1 de cada 5';
    if (Math.abs(p - 0.1) < 0.05) return '1 de cada 10';

    // Por defecto usar la fracción simplificada si el denominador es pequeño (< 20)
    const num = count / common;
    const den = total / common;

    if (den <= 20) return `${num} de cada ${den}`;

    // Si denominador es grande, normalizar a "de cada 10" o "de cada 100"
    const outOf10 = Math.round(p * 10);
    if (outOf10 > 0) return `${outOf10} de cada 10`;

    return `${Math.round(p * 100)} de cada 100`;
  }
}
