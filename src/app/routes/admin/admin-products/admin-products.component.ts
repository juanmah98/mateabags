import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Product, ProductDTO } from '../../../models/product.model';
import { Currency } from '../../../models/enums';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;
  showModal = false;
  isEditing = false;
  currentProductId: string | null = null;
  productForm: FormGroup;

  // Opciones para el select de moneda
  currencies = Object.values(Currency);

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      sku: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['EUR', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts() {
    this.isLoading = true;
    const { data, error } = await this.supabaseService.getProducts();

    if (error) {
      console.error('Error loading products:', error);
    } else {
      this.products = data || [];
    }

    this.isLoading = false;
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentProductId = null;
    this.productForm.reset({
      price: 0,
      currency: 'EUR',
      stock: 0,
      active: true
    });
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.isEditing = true;
    this.currentProductId = product.id;
    this.productForm.patchValue({
      sku: product.sku,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency || 'EUR',
      stock: product.stock,
      active: product.active
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.productForm.reset();
  }

  async onSubmit() {
    if (this.productForm.invalid) return;

    const formValue = this.productForm.value;
    const productData: ProductDTO = {
      ...formValue,
      price: Number(formValue.price),
      stock: Number(formValue.stock)
    };

    this.isLoading = true;
    let result;

    if (this.isEditing && this.currentProductId) {
      result = await this.supabaseService.updateProduct(this.currentProductId, productData);
    } else {
      result = await this.supabaseService.createProduct(productData);
    }

    this.isLoading = false;

    if (result.error) {
      console.error('Error saving product:', result.error);
      alert('Error al guardar el producto');
    } else {
      this.closeModal();
      this.loadProducts();
    }
  }

  async deleteProduct(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    this.isLoading = true;
    const { error } = await this.supabaseService.deleteProduct(id);
    this.isLoading = false;

    if (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    } else {
      this.loadProducts();
    }
  }
}
