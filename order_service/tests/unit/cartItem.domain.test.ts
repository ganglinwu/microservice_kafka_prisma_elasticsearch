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

  describe("Edge Cases", () => {
    test("should handle zero price correctly", () => {
      const item = new CartItem({
        productID: faker.string.uuid(),
        quantity: 5,
        price: "0"
      });

      expect(item.getTotalPrice()).toBe(0);
    });

    test("should handle very large prices", () => {
      const largePrice = "999999999.99";
      const item = new CartItem({
        productID: faker.string.uuid(),
        quantity: 2,
        price: largePrice
      });

      expect(item.getTotalPrice()).toBe(1999999999.98);
    });

    test("should handle decimal precision in price calculations", () => {
      const item = new CartItem({
        productID: faker.string.uuid(),
        quantity: 3,
        price: "0.33"
      });

      // JavaScript floating point precision issues
      expect(item.getTotalPrice()).toBeCloseTo(0.99, 2);
    });

    test("should handle invalid price strings gracefully", () => {
      const item = new CartItem({
        productID: faker.string.uuid(),
        quantity: 2,
        price: "invalid-price"
      });

      // parseFloat("invalid-price") returns NaN
      expect(item.getTotalPrice()).toBeNaN();
    });

    test("should handle empty price string", () => {
      const item = new CartItem({
        productID: faker.string.uuid(),
        quantity: 2,
        price: ""
      });

      // parseFloat("") returns NaN
      expect(item.getTotalPrice()).toBeNaN();
    });

    test("should handle negative prices", () => {
      const item = new CartItem({
        productID: faker.string.uuid(),
        quantity: 2,
        price: "-10.50"
      });

      expect(item.getTotalPrice()).toBe(-21); // 2 * -10.50
    });

    test("should handle very large quantities in total calculation", () => {
      const item = new CartItem({
        productID: faker.string.uuid(),
        quantity: Number.MAX_SAFE_INTEGER,
        price: "1"
      });

      expect(item.getTotalPrice()).toBe(Number.MAX_SAFE_INTEGER);
    });

    test("should handle price update with edge case values", () => {
      const item = new CartItem({
        productID: faker.string.uuid(),
        quantity: 1,
        price: "10.00"
      });

      // Update to zero price
      item.updatePrice("0");
      expect(item.price).toBe("0");
      expect(item.updatedAt).toBeDefined();

      // Update to negative price
      item.updatePrice("-5.00");
      expect(item.price).toBe("-5.00");

      // Update to invalid price string
      item.updatePrice("invalid");
      expect(item.price).toBe("invalid");
    });

    test("should handle quantity update boundary conditions", () => {
      const item = new CartItem({
        productID: faker.string.uuid(),
        quantity: 10,
        price: "5.00"
      });

      // Update to exactly 1 (minimum valid)
      expect(() => item.updateQuantity(1)).not.toThrow();
      expect(item.quantity).toBe(1);

      // Try to update to boundary invalid values
      expect(() => item.updateQuantity(0)).toThrowError("Quantity must be greater than 0");
      expect(() => item.updateQuantity(-1)).toThrowError("Quantity must be greater than 0");
    });

    test("should handle empty and special productID values", () => {
      // Empty product ID
      const item1 = new CartItem({
        productID: "",
        quantity: 1,
        price: "10.00"
      });
      expect(item1.productID).toBe("");

      // Very long product ID
      const longProductID = "a".repeat(1000);
      const item2 = new CartItem({
        productID: longProductID,
        quantity: 1,
        price: "10.00"
      });
      expect(item2.productID).toBe(longProductID);

      // Special characters in product ID
      const specialProductID = "product-123_$%@#!";
      const item3 = new CartItem({
        productID: specialProductID,
        quantity: 1,
        price: "10.00"
      });
      expect(item3.productID).toBe(specialProductID);
    });
  });
});