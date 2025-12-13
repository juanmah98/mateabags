import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, CartState, Product } from '../../../models';
import { StorageService } from '../../../core/services/storage.service';
import { APP_CONSTANTS } from '../../../config/constants';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartState$ = new BehaviorSubject<CartState>(this.getInitialCartState());

    constructor(private storageService: StorageService) {
        // Cargar carrito desde localStorage al inicializar
        this.loadCartFromStorage();
    }

    /**
     * Observable del estado del carrito
     */
    get cart(): Observable<CartState> {
        return this.cartState$.asObservable();
    }

    /**
     * Obtiene el estado actual del carrito
     */
    get currentCart(): CartState {
        return this.cartState$.value;
    }

    /**
     * Estado inicial del carrito
     */
    private getInitialCartState(): CartState {
        return {
            items: [],
            subtotal: 0,
            discount: 0,
            shipping: 0,
            total: 0,
            itemCount: 0
        };
    }

    /**
     * Cargar carrito desde localStorage
     */
    private loadCartFromStorage(): void {
        const saved = this.storageService.getLocalItem<CartState>(APP_CONSTANTS.STORAGE_KEYS.CART);
        if (saved) {
            this.cartState$.next(saved);
        }
    }

    /**
     * Guardar carrito en localStorage
     */
    private saveCartToStorage(): void {
        this.storageService.setLocalItem(APP_CONSTANTS.STORAGE_KEYS.CART, this.cartState$.value);
    }

    /**
     * Añadir producto al carrito
     */
    addItem(product: Product, quantity: number = 1, image?: string): void {
        const currentState = this.cartState$.value;
        const existingItemIndex = currentState.items.findIndex(item => item.product_id === product.id);

        let updatedItems: CartItem[];

        if (existingItemIndex >= 0) {
            // Actualizar cantidad si el producto ya existe
            updatedItems = currentState.items.map((item, index) => {
                if (index === existingItemIndex) {
                    return {
                        ...item,
                        quantity: Math.min(item.quantity + quantity, APP_CONSTANTS.MAX_CART_ITEMS)
                    };
                }
                return item;
            });
        } else {
            // Añadir nuevo producto
            const newItem: CartItem = {
                product_id: product.id,
                title: product.title,
                sku: product.sku,
                price: product.price,
                quantity: Math.min(quantity, APP_CONSTANTS.MAX_CART_ITEMS),
                image
            };
            updatedItems = [...currentState.items, newItem];
        }

        this.updateCartState(updatedItems);
    }

    /**
     * Eliminar producto del carrito
     */
    removeItem(productId: string): void {
        const currentState = this.cartState$.value;
        const updatedItems = currentState.items.filter(item => item.product_id !== productId);
        this.updateCartState(updatedItems);
    }

    /**
     * Actualizar cantidad de un producto
     */
    updateQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            this.removeItem(productId);
            return;
        }

        const currentState = this.cartState$.value;
        const updatedItems = currentState.items.map(item => {
            if (item.product_id === productId) {
                return {
                    ...item,
                    quantity: Math.min(quantity, APP_CONSTANTS.MAX_CART_ITEMS)
                };
            }
            return item;
        });

        this.updateCartState(updatedItems);
    }

    /**
     * Limpiar todo el carrito
     */
    clearCart(): void {
        this.updateCartState([]);
    }

    /**
     * Aplicar descuento de cupón
     */
    applyDiscount(discountAmount: number, couponCode: string): void {
        const currentState = this.cartState$.value;
        const newState = {
            ...currentState,
            discount: discountAmount,
            coupon_code: couponCode
        };
        newState.total = this.calculateTotal(newState);
        this.cartState$.next(newState);
        this.saveCartToStorage();
    }

    /**
     * Eliminar descuento
     */
    removeDiscount(): void {
        const currentState = this.cartState$.value;
        const newState = {
            ...currentState,
            discount: 0,
            coupon_code: undefined
        };
        newState.total = this.calculateTotal(newState);
        this.cartState$.next(newState);
        this.saveCartToStorage();
    }

    /**
     * Establecer costo de envío
     */
    setShipping(shippingCost: number): void {
        const currentState = this.cartState$.value;
        const newState = {
            ...currentState,
            shipping: shippingCost
        };
        newState.total = this.calculateTotal(newState);
        this.cartState$.next(newState);
        this.saveCartToStorage();
    }

    /**
     * Actualizar el estado del carrito con nuevos items
     */
    private updateCartState(items: CartItem[]): void {
        const subtotal = this.calculateSubtotal(items);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const currentState = this.cartState$.value;

        const newState: CartState = {
            items,
            subtotal,
            discount: currentState.discount,
            shipping: currentState.shipping,
            total: 0,
            coupon_code: currentState.coupon_code,
            itemCount
        };

        newState.total = this.calculateTotal(newState);
        this.cartState$.next(newState);
        this.saveCartToStorage();
    }

    /**
     * Calcular subtotal
     */
    private calculateSubtotal(items: CartItem[]): number {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    /**
     * Calcular total
     */
    private calculateTotal(state: CartState): number {
        return Math.max(0, state.subtotal - state.discount + state.shipping);
    }

    /**
     * Obtener número de items en el carrito
     */
    getItemCount(): number {
        return this.cartState$.value.itemCount;
    }

    /**
     * Obtener total del carrito
     */
    getTotal(): number {
        return this.cartState$.value.total;
    }

    /**
     * Obtener subtotal del carrito
     */
    getSubtotal(): number {
        return this.cartState$.value.subtotal;
    }
}
