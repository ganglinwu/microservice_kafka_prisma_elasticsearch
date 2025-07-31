import { describe, expect, test } from "vitest";
import { faker } from "@faker-js/faker";
import { Cart } from "../../src/domain/entities/Cart.js";

describe("Cart Domain Entity Unit Tests", () => {
  describe("Cart Expiration Logic", () => {
    test("should not be expired when cart is new", () => {
      const cart = new Cart({
        cartID: faker.string.uuid(),
        userID: faker.string.uuid(),
        items: new Map(),
        createdAt: new Date() // Created now
      });

      expect(cart.isExpired()).toBe(false);
    });

    test("should be expired after expiry hours", () => {
      const expiredTime = new Date(Date.now() - (Cart.CART_EXPIRY_HOURS + 1) * 60 * 60 * 1000);
      const cart = new Cart({
        cartID: faker.string.uuid(),
        userID: faker.string.uuid(),
        items: new Map(),
        createdAt: expiredTime
      });

      expect(cart.isExpired()).toBe(true);
    });

    test("should not be expired at exactly expiry hours", () => {
      const exactExpiryTime = new Date(Date.now() - Cart.CART_EXPIRY_HOURS * 60 * 60 * 1000);
      const cart = new Cart({
        cartID: faker.string.uuid(),
        userID: faker.string.uuid(),
        items: new Map(),
        createdAt: exactExpiryTime
      });

      expect(cart.isExpired()).toBe(false);
    });

    test("should throw error when trying to validate expired cart", () => {
      const expiredCart = new Cart({
        cartID: faker.string.uuid(),
        userID: faker.string.uuid(),
        items: new Map(),
        createdAt: new Date(Date.now() - (Cart.CART_EXPIRY_HOURS + 1) * 60 * 60 * 1000)
      });

      expect(() => expiredCart.validateNotExpired())
        .toThrowError(`Cart has expired (${Cart.CART_EXPIRY_HOURS} hours limit)`);
    });
  });

  describe("Quantity Validation", () => {
    const cart = new Cart({
      cartID: faker.string.uuid(),
      userID: faker.string.uuid()
    });

    test("should validate positive quantities up to max limit", () => {
      expect(() => cart.validateQuantity(1)).not.toThrow();
      expect(() => cart.validateQuantity(Cart.MAX_QUANTITY_PER_ITEM)).not.toThrow();
    });

    test("should reject zero quantity", () => {
      expect(() => cart.validateQuantity(0))
        .toThrowError("Quantity must be greater than 0");
    });

    test("should reject negative quantities", () => {
      expect(() => cart.validateQuantity(-1))
        .toThrowError("Quantity must be greater than 0");
    });

    test("should reject quantities over max limit", () => {
      expect(() => cart.validateQuantity(Cart.MAX_QUANTITY_PER_ITEM + 1))
        .toThrowError(`Maximum quantity per item is ${Cart.MAX_QUANTITY_PER_ITEM}`);
    });

    test("should validate quantity addition doesn't exceed limit", () => {
      const halfMax = Math.floor(Cart.MAX_QUANTITY_PER_ITEM / 2);
      const almostMax = Cart.MAX_QUANTITY_PER_ITEM - 1;
      
      expect(cart.canAddQuantity(halfMax, halfMax)).toBe(true);  // Should be within limit
      expect(cart.canAddQuantity(almostMax, 2)).toBe(false);    // Would exceed limit
    });
  });

  describe("Cart State Management", () => {
    test("should initialize as empty cart", () => {
      const cart = new Cart({
        cartID: faker.string.uuid(),
        userID: faker.string.uuid()
      });

      expect(cart.isEmpty()).toBe(true);
      expect(cart.getItemCount()).toBe(0);
      expect(cart.getItems()).toEqual([]);
      expect(cart.getTotalPrice()).toBe(0);
    });

    test("should calculate total price correctly for empty cart", () => {
      const cart = new Cart({
        cartID: faker.string.uuid(),
        userID: faker.string.uuid()
      });
      expect(cart.getTotalPrice()).toBe(0);
    });
  });

  describe("Constants Access", () => {
    test("should expose cart expiry hours constant", () => {
      expect(Cart.CART_EXPIRY_HOURS).toBe(24);
      expect(typeof Cart.CART_EXPIRY_HOURS).toBe('number');
    });

    test("should expose max quantity per item constant", () => {
      expect(Cart.MAX_QUANTITY_PER_ITEM).toBe(50);
      expect(typeof Cart.MAX_QUANTITY_PER_ITEM).toBe('number');
    });
  });
});