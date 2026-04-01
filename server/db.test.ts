import { describe, it, expect } from 'vitest';
import {
  getUserOrders,
  getUserAddresses,
  getUserFavorites,
  isFavorited,
  createOrder,
  createOrderItem,
  createAddress,
  addFavorite,
  removeFavorite,
} from './db';

describe('Database Functions', () => {
  describe('Orders', () => {
    it('should have getUserOrders function', () => {
      expect(typeof getUserOrders).toBe('function');
    });

    it('should have createOrder function', () => {
      expect(typeof createOrder).toBe('function');
    });

    it('should have createOrderItem function', () => {
      expect(typeof createOrderItem).toBe('function');
    });
  });

  describe('Addresses', () => {
    it('should have getUserAddresses function', () => {
      expect(typeof getUserAddresses).toBe('function');
    });

    it('should have createAddress function', () => {
      expect(typeof createAddress).toBe('function');
    });
  });

  describe('Favorites', () => {
    it('should have getUserFavorites function', () => {
      expect(typeof getUserFavorites).toBe('function');
    });

    it('should have isFavorited function', () => {
      expect(typeof isFavorited).toBe('function');
    });

    it('should have addFavorite function', () => {
      expect(typeof addFavorite).toBe('function');
    });

    it('should have removeFavorite function', () => {
      expect(typeof removeFavorite).toBe('function');
    });
  });
});
