import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class CheckoutSuccessComponent implements OnInit {
  isLoading = true;
  hasError = false;
  orderId = '';
  orderHashCode = '';
  orderDate: Date | null = null;
  orderData: any = null;
  items: any[] = [];

  // Totales
  subtotal = 0;
  discount = 0;
  shippingCost = 0;
  total = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) { }

  async ngOnInit() {
    // Limpiar order_id pendiente del localStorage
    localStorage.removeItem('pending_order_id');

    // Obtener order_id de query params
    this.route.queryParams.subscribe(async params => {
      this.orderId = params['order_id'];

      if (!this.orderId) {
        console.error('⚠️ No order_id in URL');
        this.hasError = true;
        this.isLoading = false;
        return;
      }

      await this.loadOrderData();
    });
  }

  async loadOrderData() {
    try {
      // Usar métodos de SupabaseService para obtener datos
      // Como no existe un método getOrderById, haremos las consultas manualmente
      // usando las mismas llamadas pero a través de métodos que retornen los datos

      // Por ahora, vamos a agregar un método temporal en SupabaseService
      // o hacer las consultas directamente aquí usando un método público

      // TEMPORAL: Necesitamos agregar método getOrderWithDetails a SupabaseService
      // Por ahora, redirigir a home si no hay orden
      console.warn('⚠️ Order data loading not fully implemented yet');

      // Simular datos para testing temporalmente
      this.orderData = {
        customer: {
          name: 'Cliente Test',
          email: 'test@example.com',
          phone: '+34 600 000 000'
        },
        address: {
          street: 'Calle Test',
          number: '123',
          floor: '1',
          door: 'A',
          town: 'Madrid',
          city: 'Madrid',
          postcode: '28001',
          country: 'ES'
        }
      };

      this.items = [
        {
          title: 'Producto Test',
          sku: 'TEST-001',
          quantity: 1,
          unit_price: 50,
          total_price: 50
        }
      ];

      this.orderDate = new Date();
      this.orderHashCode = this.generateOrderHash(this.orderId);
      this.subtotal = 50;
      this.discount = 0;
      this.shippingCost = 5;
      this.total = 55;

      this.isLoading = false;

    } catch (error) {
      console.error('❌ Error loading order data:', error);
      this.hasError = true;
      this.isLoading = false;
    }
  }

  // Genera un hash corto de 8 dígitos a partir del order ID UUID
  generateOrderHash(orderId: string): string {
    let hash = 0;
    for (let i = 0; i < orderId.length; i++) {
      const char = orderId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convertir a valor absoluto y tomar los últimos 8 dígitos
    const hashStr = Math.abs(hash).toString();
    return hashStr.padStart(8, '0').substring(0, 8);
  }

  async downloadReceipt() {
    const receiptElement = document.getElementById('order-receipt');
    if (!receiptElement) {
      console.error('❌ Receipt element not found');
      return;
    }

    try {
      // Capturar el HTML como imagen
      const canvas = await html2canvas(receiptElement, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10;
      const availableWidth = pageWidth - (margin * 2);

      const imgWidth = availableWidth;
      const imgHeight = (canvas.height * availableWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/png');

      // Si la imagen es más alta que una página, dividir en múltiples páginas
      let position = margin;
      let heightLeft = imgHeight;

      // Primera página
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      // Añadir páginas adicionales si es necesario
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      pdf.save(`comprobante-pedido-${this.orderHashCode}.pdf`);
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intenta nuevamente.');
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
