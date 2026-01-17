import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';


export interface WaitlistEntry {
  name: string;
  email: string;
  codigo?: string;
  reveal?: boolean;
  created_at?: string;
}

import { Product, ProductDTO } from '../../models/product.model';
import { CreateOrderPayload, CreateOrderResponse } from '../../models/checkout.model';
import { CustomerDTO } from '../../models/customer.model';
import { AddressDTO } from '../../models/address.model';
import { OrderStatus } from '../../models/enums';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  /**
   * Genera un código único de 6 caracteres basado en el email
   * @param email Email del usuario
   * @returns Código de 6 caracteres en mayúsculas
   */
  private generateCode(email: string): string {
    // Crear un hash simple del email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }

    // Usar el hash para generar un código de 6 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let num = Math.abs(hash);

    for (let i = 0; i < 6; i++) {
      code += chars[num % chars.length];
      num = Math.floor(num / chars.length);
    }

    return code;
  }

  /**
   * Genera el código completo en formato NOMBRE-CODIGO
   * @param name Nombre del usuario
   * @param email Email del usuario
   * @returns Código en formato NOMBRE-CODIGO (ej: JUAN-ABCDEF)
   */
  generateFullCode(name: string, email: string): string {
    // Tomar solo la primera palabra del nombre
    const firstName = name.trim().split(/\s+/)[0];
    const nameUpper = firstName.toUpperCase();
    const code = this.generateCode(email);
    return `${nameUpper}-${code}`;
  }

  /**
   * Guarda un nuevo registro en la lista de espera
   * @param entry Datos del formulario (name y email)
   * @returns Promise con el resultado de la inserción
   */
  async addToWaitlist(entry: WaitlistEntry): Promise<{ data: any; error: any }> {
    try {
      // Generar el código completo
      const codigo = this.generateFullCode(entry.name, entry.email);

      const { data, error } = await this.supabase
        .from('waitlist')
        .insert([
          {
            name: entry.name,
            email: entry.email,
            codigo: codigo,
            reveal: true
          }
        ])
        .select();

      return { data, error };
    } catch (error) {
      console.error('Error al agregar a la lista de espera:', error);
      return { data: null, error };
    }
  }

  /**
   * Verifica si un email ya existe en la lista de espera
   * @param email Email a verificar
   * @returns Promise con true si existe, false si no
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('waitlist')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      // Si hay error, retornar false (asumimos que no existe)
      if (error) {
        console.error('Error al verificar email:', error);
        return false;
      }

      // Retornar true si hay al menos un resultado
      return data !== null && data.length > 0;
    } catch (error) {
      console.error('Error al verificar email:', error);
      return false;
    }
  }

  /**
   * Obtiene el código de un usuario por su email
   * @param email Email del usuario
   * @returns Promise con el código o null si no existe
   */
  async getCodeByEmail(email: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('waitlist')
        .select('codigo')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error al obtener código:', error);
        return null;
      }

      return data?.codigo || null;
    } catch (error) {
      console.error('Error al obtener código:', error);
      return null;
    }
  }

  // Dashboard Methods

  async getWaitlistCount(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      return count || 0;
    } catch {
      return 0;
    }
  }

  async getCustomersCount(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      return count || 0;
    } catch {
      return 0;
    }
  }

  async getOrdersCount(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      return count || 0;
    } catch {
      return 0;
    }
  }

  async getPendingOrdersCount(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return count || 0;
    } catch {
      return 0;
    }
  }

  async getWaitlistDataForChart(days: number): Promise<{ data: any[] | null, error: any }> {
    try {
      // Calcular fecha de inicio
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);

      const { data, error } = await this.supabase
        .from('waitlist')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Error fetching waitlist chart data:', error);
      return { data: null, error };
    }
  }

  // Product Methods

  async getProducts(): Promise<{ data: Product[] | null, error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: null, error };
    }
  }

  async getProductById(id: string): Promise<{ data: Product | null, error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { data: null, error };
    }
  }

  async createProduct(product: ProductDTO): Promise<{ data: Product | null, error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating product:', error);
      return { data: null, error };
    }
  }

  async updateProduct(id: string, product: ProductDTO): Promise<{ data: Product | null, error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating product:', error);
      return { data: null, error };
    }
  }

  async deleteProduct(id: string): Promise<{ error: any }> {
    try {
      // Opción 1: Borrado físico
      const { error } = await this.supabase
        .from('products')
        .delete()
        .eq('id', id);

      // Opción 2: Borrado lógico (soft delete) - Descomentar si se prefiere
      /*
      const { error } = await this.supabase
        .from('products')
        .update({ active: false })
        .eq('id', id);
      */

      return { error };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { error };
    }
  }

  // Clientes

  async getCustomerByEmail(email: string) {
    return this.supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .limit(1)
      .maybeSingle();
  }

  async createCustomer(customer: CustomerDTO) {
    return this.supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
  }

  // Direcciones

  async createAddress(address: AddressDTO, customerId: string) {
    return this.supabase
      .from('addresses')
      .insert([{ ...address, customer_id: customerId }])
      .select()
      .single();
  }

  // Order Flow

  async createOrder(payload: CreateOrderPayload): Promise<{ data: CreateOrderResponse | null, error: any }> {
    try {
      // 1. Customer: Check if exists or create
      let customerId: string;
      const { data: existingCustomer } = await this.getCustomerByEmail(payload.customer.email);

      if (existingCustomer) {
        customerId = existingCustomer.id;
        // Opcional: actualizar datos si es necesario
      } else {
        const { data: newCustomer, error: customerError } = await this.createCustomer(payload.customer);
        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // 2. Address
      const { data: address, error: addressError } = await this.createAddress(payload.address, customerId);
      if (addressError) throw addressError;

      // 3. Order
      const subtotal_amount = payload.items.reduce((sum, item) => sum + item.total_price, 0);
      const total_amount = subtotal_amount + (payload.shipping_cost || 0); // Descuentos luego

      const orderData = {
        customer_id: customerId,
        shipping_address_id: address.id,
        subtotal_amount: subtotal_amount,
        discount_amount: 0, // Por ahora 0
        shipping_cost: payload.shipping_cost || 0,
        total_amount: total_amount,
        currency: payload.currency || 'EUR',
        status: 'pending', // Inicialmente pending
        note: payload.note
      };

      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // 4. Order Items
      const itemsData = payload.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        title: item.title,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        is_gift: item.is_gift,
        gift_message: item.gift_message
      }));

      const { error: itemsError } = await this.supabase
        .from('order_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      // 5. Simulate Payment (Mock) -> Update status to 'paid'
      // En un flujo real, aquí iríamos a Stripe. Para la simulación, marcamos como pagado.
      await this.supabase
        .from('orders')
        .update({ status: 'paid' }) // OrderStatus.PAID
        .eq('id', order.id);

      return {
        data: {
          order_id: order.id,
          // Url ficticia por ahora
          checkout_url: `/checkout/success/${order.id}`,
          total_amount: total_amount
        },
        error: null
      };

    } catch (error) {
      console.error('Error in createOrder sequence:', error);
      return { data: null, error };
    }
  }
  async getOrdersWithDetails() {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          customer:customers (*),
          shipping_address:addresses!shipping_address_id (*),
          items:order_items (*)
        `)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching orders with details:', error);
      return { data: null, error };
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { data: null, error };
    }
  }
}

