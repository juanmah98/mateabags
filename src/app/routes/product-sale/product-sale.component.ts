import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { Product } from '../../models/product.model';
import { APP_CONSTANTS } from '../../config/constants';

@Component({
  selector: 'app-product-sale',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-sale.component.html',
  styleUrl: './product-sale.component.scss'
})
export class ProductSaleComponent implements OnInit, AfterViewInit {
  // Inicializar con valores por defecto o vacíos
  product = {
    title: '',
    subtitle: '',
    description: '',
    price: 0,
    currency: ''
  };

  images = [
    'assets/product-sale/imagen-3.webp',
    'assets/product-sale/imagen-2.webp',
    'assets/product-sale/product-0.webp',
    'assets/product-sale/product-1.webp',
    'assets/product-sale/product-7.webp',
    'assets/product-sale/product-2.webp',
    'assets/product-sale/product-3.webp',
    'assets/product-sale/product-4.webp',
    'assets/product-sale/product-5.webp',
    'assets/product-sale/product-6.webp',

  ];

  selectedImage = this.images[0];
  quantity = 1;
  activeTab = 'tecnica';

  // Using a solid color for the implementation as seen in image
  selectedColor = '#1C352D';

  isLoading = true;

  // Gallery scroll
  @ViewChild('thumbnailsContainer') thumbnailsContainer!: ElementRef;
  scrollPosition = 0;
  maxScroll = 0;

  // Image modal
  showModal = false;
  modalImage = '';

  // Presale validation
  showValidationModal = false;
  validationEmail = '';
  validationError = '';
  isValidating = false;
  isAccessGranted = false;
  validationRequired = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkPresaleAccess();
    this.loadProduct();
  }

  ngAfterViewInit() {
    // Calcular maxScroll después de que la vista se renderice
    setTimeout(() => {
      this.updateScrollLimits();
    }, 500);
  }

  updateScrollLimits() {
    if (this.thumbnailsContainer) {
      const container = this.thumbnailsContainer.nativeElement;
      this.maxScroll = container.scrollWidth - container.clientWidth;
      this.scrollPosition = container.scrollLeft;
    }
  }

  productId: string = ''; // Store the real ID

  async loadProduct() {
    this.isLoading = true;
    // Obtener productos de Supabase
    const { data, error } = await this.supabaseService.getProducts();

    if (error) {
      console.error('Error loading product:', error);
      this.isLoading = false;
      return;
    }

    if (data && data.length > 0) {
      // Tomamos el primer producto activo que encontremos
      // Idealmente, filtraríamos por SKU o un slug específico
      const activeProduct = data.find(p => p.active) || data[0];

      this.productId = activeProduct.id; // Store ID!

      this.product = {
        title: activeProduct.title.toUpperCase(),
        subtitle: 'EDICIÓN LIMITADA', // Esto podría venir de metadata si existiera
        description: activeProduct.description || this.product.description,
        price: activeProduct.price,
        currency: activeProduct.currency || '€'
      };

      if (this.product.currency == 'EUR') {
        this.product.currency = '€';
      } else {
        this.product.currency = '$';
      }
    }

    this.isLoading = false;
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }

  scrollGallery(direction: 'left' | 'right') {
    const container = this.thumbnailsContainer.nativeElement;
    const scrollAmount = 300; // Píxeles por click

    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }

    // Actualizar posición actual
    setTimeout(() => {
      this.updateScrollLimits();
    }, 100);
  }

  openImageModal(image: string) {
    this.modalImage = image;
    this.showModal = true;
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  closeImageModal() {
    this.showModal = false;
    document.body.style.overflow = 'auto';
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  goToCheckout() {
    this.router.navigate(['/checkout'], {
      state: {
        items: [{
          id: this.productId, // Use real ID
          title: this.product.title,
          price: this.product.price,
          quantity: this.quantity,
          sku: 'MATEA-001', // Temporal
          image: this.selectedImage
        }]
      }
    });
  }

  // Presale validation methods
  private checkPresaleAccess() {
    // Get presale validation config
    const { ENABLED, DEADLINE } = APP_CONSTANTS.PRESALE_VALIDATION;

    // Check if presale validation is enabled
    if (!ENABLED) {
      this.isAccessGranted = true;
      this.validationRequired = false;
      return;
    }

    // Check if deadline has passed
    if (this.isAfterDeadline(DEADLINE)) {
      this.isAccessGranted = true;
      this.validationRequired = false;
      return;
    }

    // Check localStorage for existing validation
    const storedAccess = localStorage.getItem('presale_access_verified');
    if (storedAccess) {
      try {
        const accessData = JSON.parse(storedAccess);
        // Verify the stored data is still valid (within 7 days)
        const storedDate = new Date(accessData.timestamp);
        const daysSinceValidation = (Date.now() - storedDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceValidation < 7 && accessData.verified) {
          this.isAccessGranted = true;
          this.validationRequired = false;
          return;
        }
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem('presale_access_verified');
      }
    }

    // If we get here, validation is required
    this.validationRequired = true;
    this.showValidationModal = true;
    this.isAccessGranted = false;
  }

  private isAfterDeadline(deadline: Date): boolean {
    return new Date() > new Date(deadline);
  }

  async validatePresaleAccess() {
    // Reset error
    this.validationError = '';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.validationEmail || !emailRegex.test(this.validationEmail)) {
      this.validationError = 'Por favor, introduce un correo electrónico válido.';
      return;
    }

    this.isValidating = true;

    try {
      // Check if email exists in waitlist
      const exists = await this.supabaseService.emailExists(this.validationEmail);

      if (exists) {
        // Store validation in localStorage
        const accessData = {
          email: this.validationEmail,
          timestamp: new Date().toISOString(),
          verified: true
        };
        localStorage.setItem('presale_access_verified', JSON.stringify(accessData));

        // Grant access
        this.isAccessGranted = true;
        this.showValidationModal = false;
        this.validationRequired = false;
      } else {
        this.validationError = 'Este correo no está en la lista de preventa. Si crees que es un error, contacta con nosotros.';
      }
    } catch (error) {
      console.error('Error validating email:', error);
      this.validationError = 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
    } finally {
      this.isValidating = false;
    }
  }
}
