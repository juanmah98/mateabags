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
   * Carga los datos del gráfico de waitlist de los últimos 7 días
   */
  async loadWaitlistChart() {
    try {
      // Obtener registros de waitlist a través del servicio
      const { data, error } = await this.supabaseService.getWaitlistDataForChart(7);

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
      // Usar fecha local para el key, no UTC
      const dateKey = this.getLocalISODate(date);
      countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1);
    });

    // Generar array de los últimos N días
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      // No necesitamos setHours a 0 si usamos getLocalISODate que extrae YYYY-MM-DD

      const dateKey = this.getLocalISODate(date);
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
   * Convierte una fecha a string YYYY-MM-DD en hora local
   */
  private getLocalISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
        date: this.getLocalISODate(date),
        value: 0
      };
    });
  }
}
