import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({ items: [] });
  });

  it('should add item to cart', () => {
    const store = useCartStore.getState();
    store.addItem({
      productId: 1,
      quantity: 1,
      price: 5000,
      name: 'Fluffy Bag',
    });

    expect(store.items).toHaveLength(1);
    expect(store.items[0]).toEqual({
      productId: 1,
      quantity: 1,
      price: 5000,
      name: 'Fluffy Bag',
    });
  });

  it('should increase quantity when adding same product', () => {
    const store = useCartStore.getState();
    store.addItem({
      productId: 1,
      quantity: 1,
      price: 5000,
      name: 'Fluffy Bag',
    });
    store.addItem({
      productId: 1,
      quantity: 2,
      price: 5000,
      name: 'Fluffy Bag',
    });

    expect(store.items).toHaveLength(1);
    expect(store.items[0]?.quantity).toBe(3);
  });

  it('should remove item from cart', () => {
    const store = useCartStore.getState();
    store.addItem({
      productId: 1,
      quantity: 1,
      price: 5000,
      name: 'Fluffy Bag',
    });
    store.removeItem(1);

    expect(store.items).toHaveLength(0);
  });

  it('should update quantity', () => {
    const store = useCartStore.getState();
    store.addItem({
      productId: 1,
      quantity: 1,
      price: 5000,
      name: 'Fluffy Bag',
    });
    store.updateQuantity(1, 5);

    expect(store.items[0]?.quantity).toBe(5);
  });

  it('should remove item when quantity is set to 0', () => {
    const store = useCartStore.getState();
    store.addItem({
      productId: 1,
      quantity: 1,
      price: 5000,
      name: 'Fluffy Bag',
    });
    store.updateQuantity(1, 0);

    expect(store.items).toHaveLength(0);
  });

  it('should calculate total price correctly', () => {
    const store = useCartStore.getState();
    store.addItem({
      productId: 1,
      quantity: 2,
      price: 5000,
      name: 'Fluffy Bag',
    });
    store.addItem({
      productId: 2,
      quantity: 3,
      price: 3000,
      name: 'Accessory',
    });

    const total = store.getTotalPrice();
    expect(total).toBe(2 * 5000 + 3 * 3000); // 19000
  });

  it('should calculate total items correctly', () => {
    const store = useCartStore.getState();
    store.addItem({
      productId: 1,
      quantity: 2,
      price: 5000,
      name: 'Fluffy Bag',
    });
    store.addItem({
      productId: 2,
      quantity: 3,
      price: 3000,
      name: 'Accessory',
    });

    const total = store.getTotalItems();
    expect(total).toBe(5);
  });

  it('should clear cart', () => {
    const store = useCartStore.getState();
    store.addItem({
      productId: 1,
      quantity: 1,
      price: 5000,
      name: 'Fluffy Bag',
    });
    store.clearCart();

    expect(store.items).toHaveLength(0);
    expect(store.getTotalItems()).toBe(0);
    expect(store.getTotalPrice()).toBe(0);
  });
});
