import { describe, expect, test } from "vitest";
import { faker } from "@faker-js/faker";
import { Order, OrderStatus } from "../../src/domain/entities/Order.js";
import { OrderItem } from "../../src/domain/entities/OrderItem.js";

describe("Order Domain Entity Unit Tests", () => {
  describe("Constructor", () => {
    test("should create order with all properties", () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const status = OrderStatus.PENDING;
      const totalAmount = faker.commerce.price();
      const itemCount = faker.number.int({ min: 1, max: 5 });
      const shippingAddress = faker.location.streetAddress();
      const createdAt = faker.date.past();
      const updatedAt = faker.date.recent();

      const order = new Order({
        orderID,
        userID,
        status,
        totalAmount,
        itemCount,
        shippingAddress,
        createdAt,
        updatedAt
      });

      expect(order.orderID).toBe(orderID);
      expect(order.userID).toBe(userID);
      expect(order.status).toBe(status);
      expect(order.totalAmount).toBe(totalAmount);
      expect(order.itemCount).toBe(itemCount);
      expect(order.shippingAddress).toBe(shippingAddress);
      expect(order.createdAt).toBe(createdAt);
      expect(order.updatedAt).toBe(updatedAt);
    });

    test("should create order with minimal required properties", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      expect(order.userID).toBe(userID);
      expect(order.shippingAddress).toBe(shippingAddress);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.totalAmount).toBe("0");
      expect(order.itemCount).toBe(0);
      expect(order.items).toEqual([]);
    });
  });

  describe("Status Transitions", () => {
    test("should confirm pending order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();

      const order = new Order({
        userID,
        shippingAddress,
        items: [new OrderItem({
          productID,
          quantity,
          unitPrice
        })]
      });

      order.confirm();
      expect(order.status).toBe(OrderStatus.CONFIRMED);
      expect(order.updatedAt).toBeDefined();
    });

    test("should not confirm order with no items", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      expect(() => order.confirm()).toThrowError("Cannot confirm order with no items");
    });

    test("should not confirm non-pending order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        status: OrderStatus.CONFIRMED
      });

      expect(() => order.confirm()).toThrowError("Only pending orders can be confirmed");
    });

    test("should ship confirmed order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        status: OrderStatus.CONFIRMED
      });

      order.ship();
      expect(order.status).toBe(OrderStatus.SHIPPED);
    });

    test("should not ship non-confirmed order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        status: OrderStatus.PENDING
      });

      expect(() => order.ship()).toThrowError("Only confirmed orders can be shipped");
    });

    test("should deliver shipped order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        status: OrderStatus.SHIPPED
      });

      order.deliver();
      expect(order.status).toBe(OrderStatus.DELIVERED);
    });

    test("should not deliver non-shipped order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        status: OrderStatus.CONFIRMED
      });

      expect(() => order.deliver()).toThrowError("Only shipped orders can be delivered");
    });

    test("should cancel pending order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      order.cancel();
      expect(order.status).toBe(OrderStatus.CANCELLED);
    });

    test("should cancel confirmed order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        status: OrderStatus.CONFIRMED
      });

      order.cancel();
      expect(order.status).toBe(OrderStatus.CANCELLED);
    });

    test("should not cancel delivered order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        status: OrderStatus.DELIVERED
      });

      expect(() => order.cancel()).toThrowError("Cannot cancel delivered order");
    });

    test("should not cancel already cancelled order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        status: OrderStatus.CANCELLED
      });

      expect(() => order.cancel()).toThrowError("Order is already cancelled");
    });
  });

  describe("Generic Status Updates", () => {
    test("should update status with valid transition", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      order.updateStatus(OrderStatus.CONFIRMED);
      expect(order.status).toBe(OrderStatus.CONFIRMED);
    });

    test("should reject invalid status transition", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        status: OrderStatus.DELIVERED
      });

      expect(() => order.updateStatus(OrderStatus.PENDING))
        .toThrowError("Invalid status transition from DELIVERED to PENDING");
    });
  });

  describe("Item Management", () => {
    test("should add item to order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price({ min: 10, max: 20 });

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice
      });

      order.addItem(item);

      expect(order.items).toHaveLength(1);
      expect(order.itemCount).toBe(1);
      expect(parseFloat(order.totalAmount)).toBeCloseTo(quantity * parseFloat(unitPrice), 2);
      expect(order.updatedAt).toBeDefined();
    });

    test("should not add item to completed order", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();

      const order = new Order({
        userID,
        shippingAddress,
        status: OrderStatus.DELIVERED
      });

      const item = new OrderItem({
        productID,
        quantity,
        unitPrice
      });

      expect(() => order.addItem(item)).toThrowError("Cannot modify completed order");
    });

    test("should remove item from order", () => {
      const itemID = faker.string.uuid();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();
      const totalPrice = (quantity * parseFloat(unitPrice)).toFixed(2);

      const item = new OrderItem({
        id: itemID,
        productID,
        quantity,
        unitPrice
      });

      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        items: [item],
        totalAmount: totalPrice,
        itemCount: 1
      });

      order.removeItem(itemID);

      expect(order.items).toHaveLength(0);
      expect(order.itemCount).toBe(0);
      expect(order.totalAmount).toBe("0.00");
    });

    test("should throw error when removing non-existent item", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      const nonExistentItemID = faker.string.uuid();

      expect(() => order.removeItem(nonExistentItemID))
        .toThrowError("Order item not found");
    });

    test("should update item quantity", () => {
      const itemID = faker.string.uuid();
      const productID = faker.string.uuid();
      const initialQuantity = faker.number.int({ min: 1, max: 3 });
      const unitPrice = faker.commerce.price({ min: 10, max: 20 });
      const newQuantity = faker.number.int({ min: 4, max: 10 });

      const item = new OrderItem({
        id: itemID,
        productID,
        quantity: initialQuantity,
        unitPrice
      });

      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      const initialTotal = (initialQuantity * parseFloat(unitPrice)).toFixed(2);

      const order = new Order({
        userID,
        shippingAddress,
        items: [item],
        totalAmount: initialTotal,
        itemCount: 1
      });

      order.updateItemQuantity(itemID, newQuantity);

      expect(order.items[0].quantity).toBe(newQuantity);
      const expectedTotal = (newQuantity * parseFloat(unitPrice)).toFixed(2);
      expect(order.totalAmount).toBe(expectedTotal);
    });

    test("should reject invalid quantity update", () => {
      const itemID = faker.string.uuid();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();

      const item = new OrderItem({
        id: itemID,
        productID,
        quantity,
        unitPrice
      });

      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        items: [item]
      });

      const invalidQuantity = 0;

      expect(() => order.updateItemQuantity(itemID, invalidQuantity))
        .toThrowError("Quantity must be greater than 0");
    });
  });

  describe("Utility Methods", () => {
    test("should check if order is empty", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      expect(order.isEmpty()).toBe(true);

      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();

      order.addItem(new OrderItem({
        productID,
        quantity,
        unitPrice
      }));

      expect(order.isEmpty()).toBe(false);
    });

    test("should check if order is completed", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      expect(order.isCompleted()).toBe(false);

      const deliveredOrder = new Order({
        userID: faker.string.uuid(),
        shippingAddress: faker.location.streetAddress(),
        status: OrderStatus.DELIVERED
      });
      expect(deliveredOrder.isCompleted()).toBe(true);

      const cancelledOrder = new Order({
        userID: faker.string.uuid(),
        shippingAddress: faker.location.streetAddress(),
        status: OrderStatus.CANCELLED
      });
      expect(cancelledOrder.isCompleted()).toBe(true);
    });

    test("should check if order can be cancelled", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const pendingOrder = new Order({
        userID,
        shippingAddress
      });
      expect(pendingOrder.canBeCancelled()).toBe(true);

      const confirmedOrder = new Order({
        userID: faker.string.uuid(),
        shippingAddress: faker.location.streetAddress(),
        status: OrderStatus.CONFIRMED
      });
      expect(confirmedOrder.canBeCancelled()).toBe(true);

      const shippedOrder = new Order({
        userID: faker.string.uuid(),
        shippingAddress: faker.location.streetAddress(),
        status: OrderStatus.SHIPPED
      });
      expect(shippedOrder.canBeCancelled()).toBe(false);
    });

    test("should get total price as number", () => {
      const totalAmount = faker.commerce.price({ min: 100, max: 200 });
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress,
        totalAmount
      });

      expect(order.getTotalPrice()).toBe(parseFloat(totalAmount));
    });
  });

  describe("Edge Cases", () => {
    test("should handle multiple items with different prices", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      const quantity1 = faker.number.int({ min: 1, max: 3 });
      const unitPrice1 = faker.commerce.price({ min: 10, max: 15 });
      const quantity2 = faker.number.int({ min: 1, max: 3 });
      const unitPrice2 = faker.commerce.price({ min: 20, max: 30 });

      const item1 = new OrderItem({
        productID: faker.string.uuid(),
        quantity: quantity1,
        unitPrice: unitPrice1
      });

      const item2 = new OrderItem({
        productID: faker.string.uuid(),
        quantity: quantity2,
        unitPrice: unitPrice2
      });

      order.addItem(item1);
      order.addItem(item2);

      expect(order.itemCount).toBe(2);
      const expectedTotal = (quantity1 * parseFloat(unitPrice1)) + (quantity2 * parseFloat(unitPrice2));
      expect(parseFloat(order.totalAmount)).toBeCloseTo(expectedTotal, 2);
    });

    test("should handle zero price items", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      const quantity = faker.number.int({ min: 1, max: 5 });
      const freeItem = new OrderItem({
        productID: faker.string.uuid(),
        quantity,
        unitPrice: "0.00"
      });

      order.addItem(freeItem);

      expect(order.totalAmount).toBe("0.00");
      expect(order.itemCount).toBe(1);
    });

    test("should handle large quantities and prices", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      const largeQuantity = faker.number.int({ min: 50, max: 100 });
      const expensivePrice = faker.commerce.price({ min: 500, max: 1000 });

      const expensiveItem = new OrderItem({
        productID: faker.string.uuid(),
        quantity: largeQuantity,
        unitPrice: expensivePrice
      });

      order.addItem(expensiveItem);

      const expectedTotal = (largeQuantity * parseFloat(expensivePrice)).toFixed(2);
      expect(order.totalAmount).toBe(expectedTotal);
      expect(order.itemCount).toBe(1);
    });

    test("should handle decimal precision in totals", () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      const quantity = faker.number.int({ min: 2, max: 5 });
      const precisionPrice = "0.33";

      const item = new OrderItem({
        productID: faker.string.uuid(),
        quantity,
        unitPrice: precisionPrice
      });

      order.addItem(item);

      const expectedTotal = quantity * parseFloat(precisionPrice);
      expect(parseFloat(order.totalAmount)).toBeCloseTo(expectedTotal, 2);
    });

    test("should validate status transitions correctly", () => {
      const transitions = Order.VALID_STATUS_TRANSITIONS;

      expect(transitions[OrderStatus.PENDING]).toEqual([OrderStatus.CONFIRMED, OrderStatus.CANCELLED]);
      expect(transitions[OrderStatus.CONFIRMED]).toEqual([OrderStatus.SHIPPED, OrderStatus.CANCELLED]);
      expect(transitions[OrderStatus.SHIPPED]).toEqual([OrderStatus.DELIVERED]);
      expect(transitions[OrderStatus.DELIVERED]).toEqual([]);
      expect(transitions[OrderStatus.CANCELLED]).toEqual([]);
    });

    test("should handle empty shipping address", () => {
      const userID = faker.string.uuid();
      const emptyAddress = "";

      const order = new Order({
        userID,
        shippingAddress: emptyAddress
      });

      expect(order.shippingAddress).toBe(emptyAddress);
    });

    test("should handle very long shipping address", () => {
      const userID = faker.string.uuid();
      const longAddress = faker.lorem.sentences(50);

      const order = new Order({
        userID,
        shippingAddress: longAddress
      });

      expect(order.shippingAddress).toBe(longAddress);
    });
  });
});