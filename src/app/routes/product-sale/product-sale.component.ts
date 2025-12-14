import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-sale',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-sale.component.html',
  styleUrl: './product-sale.component.scss'
})
export class ProductSaleComponent implements OnInit {
  // Inicializar con valores por defecto o vacíos
  product = {
    title: 'MATEA ORIGIN',
    subtitle: 'EDICION LIMITADA',
    description: 'Un compartimento exterior diseñado para sujetarlo cuando está servido.',
    price: 128,
    currency: '€'
  };

  images = [
    'assets/carrusel/imagen-1.jpg ',
    'assets/carrusel/imagen-2.jpg',
    'assets/carrusel/imagen-3.jpg',
    'assets/carrusel/imagen-4.jpg'
  ];

  selectedImage = this.images[0];
  quantity = 1;
  activeTab = 'descripcion';

  // Using a solid color for the implementation as seen in image
  selectedColor = '#1C352D';

  isLoading = true;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProduct();
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
        subtitle: 'EDICION LIMITADA', // Esto podría venir de metadata si existiera
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
}
