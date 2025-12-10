import { Component } from '@angular/core';

@Component({
  selector: 'app-product-sale',
  imports: [],
  templateUrl: './product-sale.component.html',
  styleUrl: './product-sale.component.scss'
})
export class ProductSaleComponent {
  product = {
    title: 'MATEA ORIGIN',
    subtitle: 'EDICION LIMITADA',
    description: 'Un compartimento exterior diseñado para sujetarlo cuando está servido. Extraíble, elegante y práctico: lo usás cuando lo necesitás y desaparece cuando no. MATEA entiende que cada detalle debe adaptarse a vos.',
    price: 128,
    currency: '€'
  };

  images = [
    'assets/carrusel/imagen-1.jpg ', // Placeholder, using what I have or generic
    'assets/carrusel/imagen-2.jpg',
    'assets/carrusel/imagen-3.jpg',
    'assets/carrusel/imagen-4.jpg'
  ];

  selectedImage = this.images[0];
  quantity = 1;
  activeTab = 'descripcion';

  // Using a solid color for the implementation as seen in image
  selectedColor = '#3F4C3C';

  constructor() { }

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
}
