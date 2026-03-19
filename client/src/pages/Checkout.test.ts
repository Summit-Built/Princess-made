import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/stores/cartStore';

describe('Checkout Flow', () => {
  beforeEach(() => {
    // Reset cart before each test
    const store = useCartStore.getState();
    store.clearCart();
  });

  it('should display empty cart message when cart is empty', () => {
    const store = useCartStore.getState();
    const items = store.items;
    expect(items.length).toBe(0);
  });

  it('should calculate correct total price for cart items', () => {
    const store = useCartStore.getState();
    
    // Add items to cart
    store.addItem({
      productId: 1,
      name: 'Fluffy Bag',
      price: 9999, // $99.99
      quantity: 2,
      imageUrl: 'https://example.com/bag.jpg',
    });

    const totalPrice = store.getTotalPrice();
    expect(totalPrice).toBe(19998); // 2 * 9999 = 19998 cents
  });

  it('should handle multiple items in cart', () => {
    const store = useCartStore.getState();
    
    store.addItem({
      productId: 1,
      name: 'Fluffy Bag',
      price: 9999,
      quantity: 1,
      imageUrl: 'https://example.com/bag.jpg',
    });

    store.addItem({
      productId: 2,
      name: 'Elegant Bracelet',
      price: 4999,
      quantity: 1,
      imageUrl: 'https://example.com/bracelet.jpg',
    });

    const totalPrice = store.getTotalPrice();
    expect(totalPrice).toBe(14998); // 9999 + 4999
    expect(store.items.length).toBe(2);
  });

  it('should update item quantity correctly', () => {
    const store = useCartStore.getState();
    
    store.addItem({
      productId: 1,
      name: 'Fluffy Bag',
      price: 9999,
      quantity: 1,
      imageUrl: 'https://example.com/bag.jpg',
    });

    store.updateQuantity(1, 3);
    
    const item = store.items.find(i => i.productId === 1);
    expect(item?.quantity).toBe(3);
  });

  it('should remove item from cart', () => {
    const store = useCartStore.getState();
    
    store.addItem({
      productId: 1,
      name: 'Fluffy Bag',
      price: 9999,
      quantity: 1,
      imageUrl: 'https://example.com/bag.jpg',
    });

    expect(store.items.length).toBe(1);
    
    store.removeItem(1);
    expect(store.items.length).toBe(0);
  });

  it('should clear entire cart', () => {
    const store = useCartStore.getState();
    
    store.addItem({
      productId: 1,
      name: 'Fluffy Bag',
      price: 9999,
      quantity: 1,
      imageUrl: 'https://example.com/bag.jpg',
    });

    store.addItem({
      productId: 2,
      name: 'Elegant Bracelet',
      price: 4999,
      quantity: 1,
      imageUrl: 'https://example.com/bracelet.jpg',
    });

    expect(store.items.length).toBe(2);
    
    store.clearCart();
    expect(store.items.length).toBe(0);
    expect(store.getTotalPrice()).toBe(0);
  });

  it('should persist cart to localStorage', () => {
    const store = useCartStore.getState();
    
    store.addItem({
      productId: 1,
      name: 'Fluffy Bag',
      price: 9999,
      quantity: 1,
      imageUrl: 'https://example.com/bag.jpg',
    });

    // Check localStorage
    const savedCart = localStorage.getItem('cart-store');
    expect(savedCart).toBeTruthy();
    
    const parsed = JSON.parse(savedCart || '{}');
    expect(parsed.state?.items?.length).toBe(1);
  });

  it('should get correct total items count', () => {
    const store = useCartStore.getState();
    
    store.addItem({
      productId: 1,
      name: 'Fluffy Bag',
      price: 9999,
      quantity: 2,
      imageUrl: 'https://example.com/bag.jpg',
    });

    store.addItem({
      productId: 2,
      name: 'Elegant Bracelet',
      price: 4999,
      quantity: 3,
      imageUrl: 'https://example.com/bracelet.jpg',
    });

    const totalItems = store.getTotalItems();
    expect(totalItems).toBe(5); // 2 + 3
  });
});
