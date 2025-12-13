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

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    await this.loadStats();
    await this.loadWaitlistChart();
  }

  async loadStats() {
    this.isLoading = true;

    try {
      // Obtener total de waitlist
      const waitlistCount = await this.getWaitlistCount();
      this.stats.totalWaitlist = waitlistCount;

      // Obtener total de clientes (customers table)
      const customersCount = await this.getCustomersCount();
      this.stats.totalCustomers = customersCount;

      // Obtener total de ventas (orders table)
      const salesCount = await this.getOrdersCount();
      this.stats.totalSales = salesCount;

      // Obtener pedidos pendientes
      const pendingCount = await this.getPendingOrdersCount();
      this.stats.pendingOrders = pendingCount;

    } catch (error) {
      console.error('Error loading stats', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async getWaitlistCount(): Promise<number> {
    try {
      const { count, error } = await this.supabaseService['supabase']
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      return count || 0;
    } catch {
      return 0;
    }
  }

  private async getCustomersCount(): Promise<number> {
    try {
      const { count, error } = await this.supabaseService['supabase']
        .from('customers')
        .select('*', { count: 'exact', head: true });

      return count || 0;
    } catch {
      return 0;
    }
  }

  private async getOrdersCount(): Promise<number> {
    try {
      const { count, error } = await this.supabaseService['supabase']
        .from('orders')
        .select('*', { count: 'exact', head: true });

      return count || 0;
    } catch {
      return 0;
    }
  }

  private async getPendingOrdersCount(): Promise<number> {
    try {
      const { count, error } = await this.supabaseService['supabase']
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Carga los datos del gráfico de waitlist de los últimos 7 días
   */
  async loadWaitlistChart() {
    try {
      // Calcular fecha de hace 7 días
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); // Incluye hoy, por eso -6
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Obtener registros de waitlist de los últimos 7 días
      const { data, error } = await this.supabaseService['supabase']
        .from('waitlist')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading waitlist chart data:', error);
        this.setDefaultChartData();
        return;
      }

      // Agrupar por día
      const countsByDay = this.groupByDay(data || [], 7);
      this.chartData = countsByDay;

    } catch (error) {
      console.error('Error loading waitlist chart:', error);
      this.setDefaultChartData();
    }
  }

  /**
   * Agrupa los registros por día y cuenta cuántos hay en cada uno
   */
  private groupByDay(records: any[], daysCount: number): ChartDataPoint[] {
    const today = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const result: ChartDataPoint[] = [];

    // Crear un mapa de fechas con conteos
    const countMap = new Map<string, number>();

    // Contar registros por fecha
    records.forEach(record => {
      const date = new Date(record.created_at);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1);
    });

    // Generar array de los últimos N días
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateKey = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      const count = countMap.get(dateKey) || 0;

      result.push({
        day: dayName,
        date: dateKey,
        value: count
      });
    }

    return result;
  }

  /**
   * Establece datos por defecto si no hay datos reales
   */
  private setDefaultChartData() {
    const today = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    this.chartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));

      return {
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        value: 0
      };
    });
  }
}
