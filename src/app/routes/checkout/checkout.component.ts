import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core';
import { CreateOrderPayload } from '../../models/checkout.model';
import { Currency } from '../../models/enums';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  subtotal = 0;
  shippingCost = 5.00;
  total = 0;
  isLoading = false;
  isSuccess = false;
  createdOrderId = '';

  currentStep = 1;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService
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
        line1: ['', Validators.required],
        line2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postcode: ['', Validators.required],
        country: ['ES', Validators.required] // Default Spain
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

  ngOnInit(): void {
    // Si no hay items (acceso directo por URL), redirigir
    /* 
    // Comentado para facilitar pruebas directas si se desea, 
    // pero idealmente deberíamos redirigir a tienda si el carrito está vacío.
    if (this.cartItems.length === 0) {
      this.router.navigate(['/home/product-sale']);
    }
    */
    this.calculateTotals();
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.shippingCost;
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

    const payload: CreateOrderPayload = {
      customer: formValue.customer,
      address: {
        ...formValue.address,
        kind: 'shipping',
        label: 'Envío',
        recipient_name: formValue.customer.name // Usamos el nombre del cliente como receptor
      },
      items: this.cartItems.map(item => ({
        product_id: item.id,
        title: item.title,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        is_gift: formValue.gift.is_gift,
        gift_message: formValue.gift.is_gift ? formValue.gift.gift_message : null
      })),
      shipping_cost: this.shippingCost,
      currency: Currency.EUR, // Asumimos EUR por defecto
      note: 'Compra Web - Simulación'
    };

    const { data, error } = await this.supabaseService.createOrder(payload);

    this.isLoading = false;

    if (error) {
      console.error('Error creating order:', error);
      alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
    } else if (data) {
      this.isSuccess = true;
      this.createdOrderId = data.order_id;
      // Limpiar estado
      this.cartItems = [];
    }
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
