import { describe, expect, test } from "vitest";
import { faker } from "@faker-js/faker";
import { OrderItem } from "../../src/domain/entities/OrderItem.js";

describe("OrderItem Domain Entity Unit Tests", () => {
  describe("Constructor", () => {
    test("should create order item with all properties", () => {
      const id = faker.string.uuid();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = faker.commerce.price();
      const totalPrice = faker.commerce.price();
      const createdAt = faker.date.past();
      const updatedAt = faker.date.recent();

      const item = new OrderItem({
        id,
        productID,
        quantity,
        unitPrice,
        totalPrice,
        createdAt,
        updatedAt
      });

      expect(item.id).toBe(id);
      expect(item.productID).toBe(productID);
      expect(item.quantity).toBe(quantity);
      expect(item.unitPrice).toBe(unitPrice);
      expect(item.totalPrice).toBe(totalPrice);
      expect(item.createdAt).toBe(createdAt);
      expect(item.updatedAt).toBe(updatedAt);
    });

    test("should create order item with minimal required properties", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = faker.commerce.price();

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice
      });

      expect(item.productID).toBe(productID);
      expect(item.quantity).toBe(quantity);
      expect(item.unitPrice).toBe(unitPrice);
      expect(item.id).toBeUndefined();
      expect(item.createdAt).toBeUndefined();
      expect(item.updatedAt).toBeUndefined();
      
      // Should calculate total price automatically
      const expectedTotal = (quantity * parseFloat(unitPrice)).toFixed(2);
      expect(item.totalPrice).toBe(expectedTotal);
    });
  });

  describe("Quantity Updates", () => {
    test("should update quantity successfully", () => {
      const productID = faker.string.uuid();
      const initialQuantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();
      const newQuantity = faker.number.int({ min: 6, max: 10 });

      const item = new OrderItem({
        productID,
        quantity: initialQuantity,
        unitPrice
      });

      item.updateQuantity(newQuantity);

      expect(item.quantity).toBe(newQuantity);
      expect(item.updatedAt).toBeDefined();
      
      const expectedTotal = (newQuantity * parseFloat(unitPrice)).toFixed(2);
      expect(item.totalPrice).toBe(expectedTotal);
    });

    test("should reject zero or negative quantity updates", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice
      });

      expect(() => item.updateQuantity(0))
        .toThrowError("Quantity must be greater than 0");
      
      const negativeQuantity = faker.number.int({ min: -10, max: -1 });
      expect(() => item.updateQuantity(negativeQuantity))
        .toThrowError("Quantity must be greater than 0");
    });
  });

  describe("Price Updates", () => {
    test("should update unit price successfully", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const initialPrice = faker.commerce.price();
      const newPrice = faker.commerce.price();

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice: initialPrice
      });

      item.updateUnitPrice(newPrice);

      expect(item.unitPrice).toBe(newPrice);
      expect(item.updatedAt).toBeDefined();
      
      const expectedTotal = (quantity * parseFloat(newPrice)).toFixed(2);
      expect(item.totalPrice).toBe(expectedTotal);
    });
  });

  describe("Total Price Calculation", () => {
    test("should calculate total price correctly", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 2, max: 5 });
      const unitPrice = faker.commerce.price({ min: 10, max: 50 });

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice
      });

      const expectedTotal = quantity * parseFloat(unitPrice);
      expect(item.getTotalPrice()).toBe(expectedTotal);
    });

    test("should handle decimal prices correctly", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 2, max: 5 });
      const decimalPrice = faker.commerce.price({ min: 10, max: 20, dec: 2 });

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice: decimalPrice
      });

      const expectedTotal = quantity * parseFloat(decimalPrice);
      expect(item.getTotalPrice()).toBeCloseTo(expectedTotal, 2);
    });

    test("should handle zero price", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const zeroPrice = "0.00";

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice: zeroPrice
      });

      expect(item.getTotalPrice()).toBe(0);
    });

    test("should get unit price as number", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice
      });

      expect(item.getUnitPrice()).toBe(parseFloat(unitPrice));
    });
  });

  describe("Edge Cases", () => {
    test("should handle very large prices", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 3 });
      const largePrice = faker.commerce.price({ min: 9999, max: 99999 });

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice: largePrice
      });

      const expectedTotal = quantity * parseFloat(largePrice);
      expect(item.getTotalPrice()).toBe(expectedTotal);
    });

    test("should handle decimal precision in price calculations", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 2, max: 5 });
      const precisionPrice = "0.33";

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice: precisionPrice
      });

      const expectedTotal = quantity * parseFloat(precisionPrice);
      expect(item.getTotalPrice()).toBeCloseTo(expectedTotal, 2);
    });

    test("should handle invalid price strings gracefully", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const invalidPrice = faker.lorem.word();

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice: invalidPrice
      });

      expect(item.getTotalPrice()).toBeNaN();
      expect(item.getUnitPrice()).toBeNaN();
    });

    test("should handle empty price string", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const emptyPrice = "";

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice: emptyPrice
      });

      expect(item.getTotalPrice()).toBeNaN();
      expect(item.getUnitPrice()).toBeNaN();
    });

    test("should handle negative prices", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const negativePrice = `-${faker.commerce.price()}`;

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice: negativePrice
      });

      const expectedTotal = quantity * parseFloat(negativePrice);
      expect(item.getTotalPrice()).toBeCloseTo(expectedTotal, 2);
    });

    test("should handle very large quantities in total calculation", () => {
      const productID = faker.string.uuid();
      const largeQuantity = faker.number.int({ min: 1000, max: 10000 });
      const unitPrice = faker.commerce.price({ min: 1, max: 10 });

      const item = new OrderItem({
        productID,
        quantity: largeQuantity,
        unitPrice
      });

      const expectedTotal = largeQuantity * parseFloat(unitPrice);
      expect(item.getTotalPrice()).toBeCloseTo(expectedTotal, 2);
    });

    test("should handle price update with edge case values", () => {
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const initialPrice = faker.commerce.price();

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice: initialPrice
      });

      // Update to zero price
      const zeroPrice = "0.00";
      item.updateUnitPrice(zeroPrice);
      expect(item.unitPrice).toBe(zeroPrice);
      expect(item.updatedAt).toBeDefined();

      // Update to negative price
      const negativePrice = `-${faker.commerce.price()}`;
      item.updateUnitPrice(negativePrice);
      expect(item.unitPrice).toBe(negativePrice);

      // Update to invalid price string
      const invalidPrice = faker.lorem.word();
      item.updateUnitPrice(invalidPrice);
      expect(item.unitPrice).toBe(invalidPrice);
    });

    test("should handle quantity update boundary conditions", () => {
      const productID = faker.string.uuid();
      const initialQuantity = faker.number.int({ min: 5, max: 10 });
      const unitPrice = faker.commerce.price();

      const item = new OrderItem({
        productID,
        quantity: initialQuantity,
        unitPrice
      });

      // Update to exactly 1 (minimum valid)
      const minValidQuantity = 1;
      expect(() => item.updateQuantity(minValidQuantity)).not.toThrow();
      expect(item.quantity).toBe(minValidQuantity);

      // Try to update to boundary invalid values
      expect(() => item.updateQuantity(0)).toThrowError("Quantity must be greater than 0");
      
      const negativeQuantity = faker.number.int({ min: -10, max: -1 });
      expect(() => item.updateQuantity(negativeQuantity)).toThrowError("Quantity must be greater than 0");
    });

    test("should handle empty and special productID values", () => {
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();

      // Empty product ID
      const item1 = new OrderItem({
        productID: "",
        quantity,
        unitPrice
      });
      expect(item1.productID).toBe("");

      // Very long product ID
      const longProductID = faker.lorem.sentences(100);
      const item2 = new OrderItem({
        productID: longProductID,
        quantity,
        unitPrice
      });
      expect(item2.productID).toBe(longProductID);

      // Special characters in product ID
      const specialProductID = `${faker.string.alphanumeric(10)}-$%@#!`;
      const item3 = new OrderItem({
        productID: specialProductID,
        quantity,
        unitPrice
      });
      expect(item3.productID).toBe(specialProductID);
    });

    test("should handle concurrent updates", () => {
      const productID = faker.string.uuid();
      const initialQuantity = faker.number.int({ min: 1, max: 5 });
      const initialPrice = faker.commerce.price();

      const item = new OrderItem({
        productID,
        quantity: initialQuantity,
        unitPrice: initialPrice
      });

      const newQuantity = faker.number.int({ min: 6, max: 10 });
      const newPrice = faker.commerce.price();

      // Update both quantity and price
      item.updateQuantity(newQuantity);
      item.updateUnitPrice(newPrice);

      expect(item.quantity).toBe(newQuantity);
      expect(item.unitPrice).toBe(newPrice);
      
      const expectedTotal = (newQuantity * parseFloat(newPrice)).toFixed(2);
      expect(item.totalPrice).toBe(expectedTotal);
    });
  });
});