import { describe, expect, test } from "vitest";
import { faker } from "@faker-js/faker";
import { CartItem } from "../../src/domain/entities/CartItem.js";

describe("CartItem Domain Entity Unit Tests", () => {
  describe("Quantity Updates", () => {
    test("should update quantity successfully", () => {
      const item = new CartItem({
        productID: "product1",
        quantity: 5,
        price: "10.00"
      });
      
      item.updateQuantity(10);
      
      expect(item.quantity).toBe(10);
      expect(item.updatedAt).toBeDefined();
    });

    test("should reject zero or negative quantity updates", () => {
      const item = new CartItem({
        productID: "product1",
        quantity: 5,
        price: "10.00"
      });
      
      expect(() => item.updateQuantity(0))
        .toThrowError("Quantity must be greater than 0");
      expect(() => item.updateQuantity(-1))
        .toThrowError("Quantity must be greater than 0");
    });
  });

  describe("Price Updates", () => {
    test("should update price successfully", () => {
      const item = new CartItem({
        productID: "product1",
        quantity: 5,
        price: "10.00"
      });
      
      item.updatePrice("15.99");
      
      expect(item.price).toBe("15.99");
      expect(item.updatedAt).toBeDefined();
    });
  });

  describe("Total Price Calculation", () => {
    test("should calculate total price correctly", () => {
      const item = new CartItem({
        productID: "product1",
        quantity: 3,
        price: "10.50"
      });
      
      expect(item.getTotalPrice()).toBe(31.5); // 3 * 10.50
    });

    test("should handle decimal prices correctly", () => {
      const item = new CartItem({
        productID: "product1",
        quantity: 2,
        price: "19.99"
      });
      
      expect(item.getTotalPrice()).toBe(39.98); // 2 * 19.99
    });

    test("should handle zero quantity", () => {
      const item = new CartItem({
        productID: "product1",
        quantity: 0,
        price: "10.00"
      });
      
      expect(item.getTotalPrice()).toBe(0);
    });
  });

  describe("Constructor", () => {
    test("should create item with all properties", () => {
      const id = faker.string.uuid();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 10 });
      const price = faker.commerce.price();
      const createdAt = new Date();
      const updatedAt = new Date();

      const item = new CartItem({
        productID,
        quantity,
        price,
        id,
        createdAt,
        updatedAt
      });

      expect(item.productID).toBe(productID);
      expect(item.quantity).toBe(quantity);
      expect(item.price).toBe(price);
      expect(item.id).toBe(id);
      expect(item.createdAt).toBe(createdAt);
      expect(item.updatedAt).toBe(updatedAt);
    });

    test("should create item with minimal required properties", () => {
      const item = new CartItem({
        productID: "test-product",
        quantity: 1,
        price: "10.00"
      });

      expect(item.productID).toBe("test-product");
      expect(item.quantity).toBe(1);
      expect(item.price).toBe("10.00");
      expect(item.id).toBeUndefined();
      expect(item.createdAt).toBeUndefined();
      expect(item.updatedAt).toBeUndefined();
    });
  });
});