import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';

interface Customer {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  created_at?: string;
}

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-customers.component.html',
  styleUrl: './admin-customers.component.scss'
})
export class AdminCustomersComponent implements OnInit {
  customers: Customer[] = [];
  isLoading = true;

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    await this.loadCustomers();
  }

  async loadCustomers() {
    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService['supabase']
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        this.customers = data;
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  }
}
