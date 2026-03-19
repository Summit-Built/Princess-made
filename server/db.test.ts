import { describe, it, expect } from 'vitest';
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  getUserOrders,
  getUserAddresses,
  getUserFavorites,
  isFavorited,
} from './db';

describe('Database Functions', () => {
  describe('Products', () => {
    it('should have getProducts function', () => {
      expect(typeof getProducts).toBe('function');
    });

    it('should have getProductById function', () => {
      expect(typeof getProductById).toBe('function');
    });

    it('should have getProductsByCategory function', () => {
      expect(typeof getProductsByCategory).toBe('function');
    });
  });

  describe('Orders', () => {
    it('should have getUserOrders function', () => {
      expect(typeof getUserOrders).toBe('function');
    });
  });

  describe('Addresses', () => {
    it('should have getUserAddresses function', () => {
      expect(typeof getUserAddresses).toBe('function');
    });
  });

  describe('Favorites', () => {
    it('should have getUserFavorites function', () => {
      expect(typeof getUserFavorites).toBe('function');
    });

    it('should have isFavorited function', () => {
      expect(typeof isFavorited).toBe('function');
    });
  });
});
