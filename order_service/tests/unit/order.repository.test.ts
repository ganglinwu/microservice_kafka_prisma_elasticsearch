import { describe, expect, test, vitest, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import { OrderRepository } from "../../src/repository/order.repository.js";
import { Order, OrderStatus } from "../../src/domain/entities/Order.js";
import { OrderItem } from "../../src/domain/entities/OrderItem.js";

// Mock database
const mockDb = {
  insert: vitest.fn(),
  select: vitest.fn(),
  update: vitest.fn(),
  delete: vitest.fn(),
};

// Mock database query builders
const createMockQuery = () => ({
  values: vitest.fn().mockReturnThis(),
  returning: vitest.fn().mockReturnThis(),
  from: vitest.fn().mockReturnThis(),
  where: vitest.fn().mockReturnThis(),
  limit: vitest.fn().mockReturnThis(),
  set: vitest.fn().mockReturnThis(),
});

// Reset mocks to return fresh query objects
const resetMocks = () => {
  mockDb.insert.mockReturnValue(createMockQuery());
  mockDb.select.mockReturnValue(createMockQuery());
  mockDb.update.mockReturnValue(createMockQuery());
  mockDb.delete.mockReturnValue(createMockQuery());
};

describe("OrderRepository Unit Tests", () => {
  let orderRepository: OrderRepository;

  beforeEach(() => {
    vitest.clearAllMocks();
    resetMocks();
    orderRepository = new OrderRepository(mockDb as any);
  });

  describe("Create Order", () => {
    test("should create order successfully", async () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      const totalAmount = faker.commerce.price();
      const itemCount = faker.number.int({ min: 1, max: 5 });

      const order = new Order({
        userID,
        shippingAddress,
        totalAmount,
        itemCount
      });

      const mockInsertedOrder = {
        orderID: faker.string.uuid(),
        userID,
        status: OrderStatus.PENDING,
        totalAmount,
        itemCount,
        shippingAddress,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };

      const mockInsertQuery = createMockQuery();
      mockInsertQuery.returning.mockResolvedValue([mockInsertedOrder]);
      mockDb.insert.mockReturnValue(mockInsertQuery);

      const result = await orderRepository.createOrder(order);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockInsertQuery.values).toHaveBeenCalledWith({
        userID,
        status: OrderStatus.PENDING,
        totalAmount,
        itemCount,
        shippingAddress
      });
      expect(result).toBeInstanceOf(Order);
      expect(result.orderID).toBe(mockInsertedOrder.orderID);
      expect(result.userID).toBe(userID);
    });
  });

  describe("Find Order By ID", () => {
    test("should find order by ID successfully", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const mockOrderData = {
        orderID,
        userID,
        status: OrderStatus.PENDING,
        totalAmount: faker.commerce.price(),
        itemCount: faker.number.int({ min: 1, max: 5 }),
        shippingAddress,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };

      mockQuery.limit.mockResolvedValue([mockOrderData]);

      // Mock findOrderItemsByOrderID call
      const mockItems = [
        {
          id: faker.string.uuid(),
          productID: faker.string.uuid(),
          quantity: faker.number.int({ min: 1, max: 5 }),
          unitPrice: faker.commerce.price(),
          totalPrice: faker.commerce.price(),
          createdAt: faker.date.past()
        }
      ];

      // Mock the select call for items
      const mockItemsQuery = { ...mockQuery };
      mockItemsQuery.where = vitest.fn().mockResolvedValue(mockItems);
      mockDb.select.mockReturnValueOnce(mockQuery).mockReturnValueOnce(mockItemsQuery);

      const result = await orderRepository.findOrderByID(orderID);

      expect(result).toBeInstanceOf(Order);
      expect(result!.orderID).toBe(orderID);
      expect(result!.userID).toBe(userID);
      expect(result!.items).toHaveLength(1);
    });

    test("should return null when order not found", async () => {
      const orderID = faker.string.uuid();

      mockQuery.limit.mockResolvedValue([]);

      const result = await orderRepository.findOrderByID(orderID);

      expect(result).toBeNull();
    });
  });

  describe("Find Orders By User ID", () => {
    test("should find orders by user ID successfully", async () => {
      const userID = faker.string.uuid();
      const orderCount = faker.number.int({ min: 1, max: 3 });

      const mockOrders = Array.from({ length: orderCount }, () => ({
        orderID: faker.string.uuid(),
        userID,
        status: faker.helpers.enumValue(OrderStatus),
        totalAmount: faker.commerce.price(),
        itemCount: faker.number.int({ min: 1, max: 5 }),
        shippingAddress: faker.location.streetAddress(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      }));

      mockQuery.where.mockResolvedValue(mockOrders);

      // Mock findOrderItemsByOrderID for each order
      for (let i = 0; i < orderCount; i++) {
        const mockItemQuery = { ...mockQuery };
        mockItemQuery.where = vitest.fn().mockResolvedValue([]);
        mockDb.select.mockReturnValueOnce(mockItemQuery);
      }

      const result = await orderRepository.findOrdersByUserID(userID);

      expect(result).toHaveLength(orderCount);
      expect(result[0]).toBeInstanceOf(Order);
      expect(result[0].userID).toBe(userID);
    });

    test("should return empty array when no orders found", async () => {
      const userID = faker.string.uuid();

      mockQuery.where.mockResolvedValue([]);

      const result = await orderRepository.findOrdersByUserID(userID);

      expect(result).toEqual([]);
    });
  });

  describe("Update Order Status", () => {
    test("should update order status successfully", async () => {
      const orderID = faker.string.uuid();
      const newStatus = faker.helpers.enumValue(OrderStatus);

      mockQuery.where.mockResolvedValue();

      await orderRepository.updateOrderStatus(orderID, newStatus);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockQuery.set).toHaveBeenCalledWith({
        status: newStatus,
        updatedAt: expect.any(Date)
      });
      expect(mockQuery.where).toHaveBeenCalled();
    });
  });

  describe("Delete Order", () => {
    test("should delete order successfully", async () => {
      const orderID = faker.string.uuid();

      mockQuery.where.mockResolvedValue();

      await orderRepository.deleteOrder(orderID);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockQuery.where).toHaveBeenCalled();
    });
  });

  describe("Add Order Item", () => {
    test("should add order item successfully", async () => {
      const orderID = faker.string.uuid();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();

      const orderItem = new OrderItem({
        productID,
        quantity,
        unitPrice
      });

      const mockInsertedItem = {
        id: faker.string.uuid(),
        orderID,
        productID,
        quantity,
        unitPrice,
        totalPrice: orderItem.totalPrice,
        createdAt: faker.date.past()
      };

      mockQuery.returning.mockResolvedValue([mockInsertedItem]);

      const result = await orderRepository.addOrderItem(orderID, orderItem);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockQuery.values).toHaveBeenCalledWith({
        orderID,
        productID,
        quantity,
        unitPrice,
        totalPrice: orderItem.totalPrice
      });
      expect(result).toBeInstanceOf(OrderItem);
      expect(result.productID).toBe(productID);
    });
  });

  describe("Find Order Items By Order ID", () => {
    test("should find order items successfully", async () => {
      const orderID = faker.string.uuid();
      const itemCount = faker.number.int({ min: 1, max: 3 });

      const mockItems = Array.from({ length: itemCount }, () => ({
        id: faker.string.uuid(),
        productID: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 5 }),
        unitPrice: faker.commerce.price(),
        totalPrice: faker.commerce.price(),
        createdAt: faker.date.past()
      }));

      mockQuery.where.mockResolvedValue(mockItems);

      const result = await orderRepository.findOrderItemsByOrderID(orderID);

      expect(result).toHaveLength(itemCount);
      expect(result[0]).toBeInstanceOf(OrderItem);
    });
  });

  describe("Update Order Item", () => {
    test("should update order item successfully", async () => {
      const itemID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = faker.commerce.price();
      const expectedTotalPrice = (quantity * parseFloat(unitPrice)).toFixed(2);

      mockQuery.where.mockResolvedValue();

      await orderRepository.updateOrderItem(itemID, quantity, unitPrice);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockQuery.set).toHaveBeenCalledWith({
        quantity,
        unitPrice,
        totalPrice: expectedTotalPrice
      });
      expect(mockQuery.where).toHaveBeenCalled();
    });
  });

  describe("Remove Order Item", () => {
    test("should remove order item successfully", async () => {
      const itemID = faker.string.uuid();

      mockQuery.where.mockResolvedValue();

      await orderRepository.removeOrderItem(itemID);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockQuery.where).toHaveBeenCalled();
    });
  });

  describe("Update Order Totals", () => {
    test("should update order totals successfully", async () => {
      const orderID = faker.string.uuid();
      const totalAmount = faker.commerce.price();
      const itemCount = faker.number.int({ min: 1, max: 10 });

      mockQuery.where.mockResolvedValue();

      await orderRepository.updateOrderTotals(orderID, totalAmount, itemCount);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockQuery.set).toHaveBeenCalledWith({
        totalAmount,
        itemCount,
        updatedAt: expect.any(Date)
      });
      expect(mockQuery.where).toHaveBeenCalled();
    });
  });

  describe("Domain Mapping", () => {
    test("should map database data to Order domain correctly", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const status = faker.helpers.enumValue(OrderStatus);
      const totalAmount = faker.commerce.price();
      const itemCount = faker.number.int({ min: 1, max: 5 });
      const shippingAddress = faker.location.streetAddress();
      const createdAt = faker.date.past();
      const updatedAt = faker.date.recent();

      const mockOrderData = {
        orderID,
        userID,
        status,
        totalAmount,
        itemCount,
        shippingAddress,
        createdAt,
        updatedAt
      };

      mockQuery.limit.mockResolvedValue([mockOrderData]);

      // Mock empty items array
      const mockItemsQuery = { ...mockQuery };
      mockItemsQuery.where = vitest.fn().mockResolvedValue([]);
      mockDb.select.mockReturnValueOnce(mockQuery).mockReturnValueOnce(mockItemsQuery);

      const result = await orderRepository.findOrderByID(orderID);

      expect(result).toBeInstanceOf(Order);
      expect(result!.orderID).toBe(orderID);
      expect(result!.userID).toBe(userID);
      expect(result!.status).toBe(status);
      expect(result!.totalAmount).toBe(totalAmount);
      expect(result!.itemCount).toBe(itemCount);
      expect(result!.shippingAddress).toBe(shippingAddress);
      expect(result!.createdAt).toBe(createdAt);
      expect(result!.updatedAt).toBe(updatedAt);
    });

    test("should map database data to OrderItem domain correctly", async () => {
      const orderID = faker.string.uuid();

      const itemData = {
        id: faker.string.uuid(),
        productID: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 5 }),
        unitPrice: faker.commerce.price(),
        totalPrice: faker.commerce.price(),
        createdAt: faker.date.past()
      };

      mockQuery.where.mockResolvedValue([itemData]);

      const result = await orderRepository.findOrderItemsByOrderID(orderID);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(OrderItem);
      expect(result[0].id).toBe(itemData.id);
      expect(result[0].productID).toBe(itemData.productID);
      expect(result[0].quantity).toBe(itemData.quantity);
      expect(result[0].unitPrice).toBe(itemData.unitPrice);
      expect(result[0].totalPrice).toBe(itemData.totalPrice);
      expect(result[0].createdAt).toBe(itemData.createdAt);
    });
  });

  describe("Error Handling", () => {
    test("should handle database errors during order creation", async () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const order = new Order({
        userID,
        shippingAddress
      });

      const dbError = new Error(faker.lorem.sentence());
      mockQuery.returning.mockRejectedValue(dbError);

      await expect(orderRepository.createOrder(order))
        .rejects.toThrowError(dbError.message);
    });

    test("should handle database errors during order retrieval", async () => {
      const orderID = faker.string.uuid();
      const dbError = new Error(faker.lorem.sentence());

      mockQuery.limit.mockRejectedValue(dbError);

      await expect(orderRepository.findOrderByID(orderID))
        .rejects.toThrowError(dbError.message);
    });

    test("should handle database errors during status update", async () => {
      const orderID = faker.string.uuid();
      const status = faker.helpers.enumValue(OrderStatus);
      const dbError = new Error(faker.lorem.sentence());

      mockQuery.where.mockRejectedValue(dbError);

      await expect(orderRepository.updateOrderStatus(orderID, status))
        .rejects.toThrowError(dbError.message);
    });
  });
});