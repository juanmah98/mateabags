import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core';
import { StripeService } from '../../core/services/stripe.service';
import { CreateOrderPayload } from '../../models/checkout.model';
import { Currency, AddressKind } from '../../models/enums';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  subtotal = 0;
  shippingCost = 0;
  total = 0;
  discount = 0;
  isLoading = false;
  isSuccess = false;
  createdOrderId = '';
  orderHashCode = '';                // Hash corto del order ID
  orderDate: Date | null = null;
  orderData: any = null;
  completedItems: any[] = [];

  // Stripe & Cupones
  couponCode = '';
  appliedCoupon: any = null;

  currentStep = 1;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService,
    private stripeService: StripeService
  ) {
    // Recuperar items del estado de navegación
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state) {
      this.cartItems = nav.extras.state['items'] || [];
    }

    this.checkoutForm = this.fb.group({
      customer: this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required]
      }),
      address: this.fb.group({
        street: ['', Validators.required],           // Dirección (calle)
        number: ['', Validators.required],           // Número
        floor: [''],                                 // Piso (opcional)
        door: [''],                                  // Puerta (opcional)
        city: ['', Validators.required],             // Ciudad
        town: ['', Validators.required],             // Población
        postcode: ['', Validators.required],         // Código Postal
        country: ['ES', Validators.required],        // País (default Spain)
        extraInstructions: ['']                      // Indicaciones extras (opcional)
      }),
      gift: this.fb.group({
        is_gift: [false],
        gift_message: ['']
      }),
      payment: this.fb.group({
        cardName: ['Usuario Pruebas', Validators.required],
        cardNumber: ['1234567812345678', [Validators.required, Validators.pattern(/^\d{16}$/)]],
        expiry: ['12/28', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
        cvv: ['123', [Validators.required, Validators.pattern(/^\d{3}$/)]]
      })
    });
  }

  get customerForm() { return this.checkoutForm.get('customer') as FormGroup; }
  get addressForm() { return this.checkoutForm.get('address') as FormGroup; }
  get giftForm() { return this.checkoutForm.get('gift') as FormGroup; }
  get paymentForm() { return this.checkoutForm.get('payment') as FormGroup; }

  get progressPercentage(): number {
    return (this.currentStep / 4) * 100;
  }

  ngOnInit(): void {
    // Si no hay items (acceso directo por URL), redirigir
    if (this.cartItems.length === 0) {
      console.warn('⚠️ Checkout vacío - redirigiendo a producto');
      this.router.navigate(['/home/product-sale']);
      return;
    }

    this.calculateTotals();
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Si hay descuento aplicado, mantenerlo
    const finalSubtotal = this.appliedCoupon ? (this.appliedCoupon.new_total || this.subtotal) - this.shippingCost : this.subtotal;
    this.total = finalSubtotal + this.shippingCost;
  }

  validateCoupon() {
    if (!this.couponCode || this.couponCode.trim() === '') {
      alert('Por favor ingresa un código de cupón');
      return;
    }

    this.isLoading = true;
    this.stripeService.validateCoupon(this.couponCode, this.subtotal).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.valid) {
          this.appliedCoupon = result;
          this.discount = result.discount_amount || 0;
          this.total = (result.new_total || this.total) + this.shippingCost;
          alert(`✅ Cupón "${result.code}" aplicado! Descuento: €${this.discount.toFixed(2)}`);
        } else {
          alert(`❌ Cupón inválido: ${result.error || 'Código no encontrado'}`);
          this.couponCode = '';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al validar cupón:', err);
        alert('Error al validar el cupón. Intenta nuevamente.');
      }
    });
  }

  removeCoupon() {
    this.couponCode = '';
    this.appliedCoupon = null;
    this.discount = 0;
    this.calculateTotals();
  }

  nextStep() {
    switch (this.currentStep) {
      case 1:
        if (this.customerForm.valid) this.currentStep++;
        else this.customerForm.markAllAsTouched();
        break;
      case 2:
        if (this.addressForm.valid) this.currentStep++;
        else this.addressForm.markAllAsTouched();
        break;
      case 3:
        // Gift form is always valid (optional)
        this.currentStep++;
        break;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  async onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.checkoutForm.value;

    // Transformar dirección
    const addressForm = formValue.address;
    let line1 = `${addressForm.street} ${addressForm.number}`;

    if (addressForm.floor || addressForm.door) {
      const floorDoor = [];
      if (addressForm.floor) floorDoor.push('Piso ' + addressForm.floor);
      if (addressForm.door) floorDoor.push('Puerta ' + addressForm.door);
      line1 += `, ${floorDoor.join(' ')}`;
    }

    // Preparar datos para Stripe
    const customer = {
      name: formValue.customer.name,
      email: formValue.customer.email,
      phone: formValue.customer.phone
    };

    const address = {
      line1: line1,
      line2: addressForm.extraInstructions || undefined,
      city: addressForm.city,
      state: addressForm.town,
      postcode: addressForm.postcode,
      country: addressForm.country
    };

    const items = this.cartItems.map(item => ({
      product_id: item.id,
      title: item.title,
      sku: item.sku || '',
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      is_gift: formValue.gift.is_gift,
      gift_message: formValue.gift.is_gift ? formValue.gift.gift_message : undefined
    }));

    // Llamar a Stripe para crear sesión
    this.stripeService.createCheckoutSession(
      customer,
      address,
      items,
      this.shippingCost,
      this.appliedCoupon?.code,
      'Compra Web - Stripe Checkout'
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Checkout session created:', response);

        // Guardar order_id por si el usuario vuelve
        localStorage.setItem('pending_order_id', response.order_id);

        // Redirigir a Stripe
        this.stripeService.redirectToCheckout(response.checkout_url);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating checkout session:', err);
        alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
      }
    });
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
    if (!receiptElement) return;

    try {
      // Capturar el HTML como imagen con escala reducida para mejor ajuste
      const canvas = await html2canvas(receiptElement, {
        scale: 1.5,  // Reducido de 2 a 1.5 para mejor ajuste
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10; // Márgenes
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

      pdf.save(`comprobante-pedido-${this.createdOrderId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intenta nuevamente.');
    }
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
