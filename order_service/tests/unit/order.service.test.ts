import { describe, expect, test, vitest, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import { OrderService } from "../../src/service/order.service.js";
import { Order, OrderStatus } from "../../src/domain/entities/Order.js";
import { OrderItem } from "../../src/domain/entities/OrderItem.js";
import { CartItem } from "../../src/domain/entities/CartItem.js";
import { IOrderRepository } from "../../src/interface/orderRepository.interface.js";

// Mock repository
const mockRepository: IOrderRepository = {
  createOrder: vitest.fn(),
  findOrderByID: vitest.fn(),
  findOrdersByUserID: vitest.fn(),
  updateOrderStatus: vitest.fn(),
  deleteOrder: vitest.fn(),
  addOrderItem: vitest.fn(),
  findOrderItemsByOrderID: vitest.fn(),
  updateOrderItem: vitest.fn(),
  removeOrderItem: vitest.fn(),
  updateOrderTotals: vitest.fn(),
};

describe("OrderService Unit Tests", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
  });

  describe("Factory Methods", () => {
    test("should create order from cart items successfully", async () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      
      const cartItems = [
        new CartItem({
          productID: faker.string.uuid(),
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: faker.commerce.price()
        }),
        new CartItem({
          productID: faker.string.uuid(),
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: faker.commerce.price()
        })
      ];

      const mockCreatedOrder = new Order({
        orderID: faker.string.uuid(),
        userID,
        shippingAddress,
        totalAmount: faker.commerce.price(),
        itemCount: cartItems.length
      });

      const mockCompleteOrder = new Order({
        orderID: mockCreatedOrder.orderID,
        userID,
        shippingAddress,
        totalAmount: faker.commerce.price(),
        itemCount: cartItems.length,
        items: cartItems.map(item => new OrderItem({
          productID: item.productID,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      });

      vitest.mocked(mockRepository.createOrder).mockResolvedValue(mockCreatedOrder);
      vitest.mocked(mockRepository.addOrderItem).mockResolvedValue(
        new OrderItem({
          productID: faker.string.uuid(),
          quantity: 1,
          unitPrice: faker.commerce.price()
        })
      );
      vitest.mocked(mockRepository.findOrderByID).mockResolvedValue(mockCompleteOrder);

      const orderService = await OrderService.createFromCart(
        userID,
        cartItems,
        shippingAddress,
        mockRepository
      );

      expect(mockRepository.createOrder).toHaveBeenCalled();
      expect(mockRepository.addOrderItem).toHaveBeenCalledTimes(cartItems.length);
      expect(mockRepository.findOrderByID).toHaveBeenCalledWith(mockCreatedOrder.orderID);
      expect(orderService).toBeInstanceOf(OrderService);
      expect(orderService.userID).toBe(userID);
    });

    test("should reject creating order from empty cart", async () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      const emptyCartItems: CartItem[] = [];

      await expect(
        OrderService.createFromCart(userID, emptyCartItems, shippingAddress, mockRepository)
      ).rejects.toThrowError("Cannot create order from empty cart");
    });

    test("should load existing order successfully", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const mockOrder = new Order({
        orderID,
        userID,
        shippingAddress
      });

      vitest.mocked(mockRepository.findOrderByID).mockResolvedValue(mockOrder);

      const orderService = await OrderService.loadExistingOrder(orderID, mockRepository);

      expect(orderService).toBeInstanceOf(OrderService);
      expect(orderService!.orderID).toBe(orderID);
      expect(orderService!.userID).toBe(userID);
    });

    test("should return null when order doesn't exist", async () => {
      const orderID = faker.string.uuid();

      vitest.mocked(mockRepository.findOrderByID).mockResolvedValue(null);

      const orderService = await OrderService.loadExistingOrder(orderID, mockRepository);

      expect(orderService).toBeNull();
    });

    test("should find orders by user successfully", async () => {
      const userID = faker.string.uuid();
      const orderCount = faker.number.int({ min: 1, max: 3 });

      const mockOrders = Array.from({ length: orderCount }, () => 
        new Order({
          orderID: faker.string.uuid(),
          userID,
          shippingAddress: faker.location.streetAddress()
        })
      );

      vitest.mocked(mockRepository.findOrdersByUserID).mockResolvedValue(mockOrders);

      const orderServices = await OrderService.findOrdersByUser(userID, mockRepository);

      expect(orderServices).toHaveLength(orderCount);
      expect(orderServices[0]).toBeInstanceOf(OrderService);
      expect(orderServices[0].userID).toBe(userID);
    });
  });

  describe("Status Operations", () => {
    test("should confirm order successfully", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const mockOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        items: [new OrderItem({
          productID: faker.string.uuid(),
          quantity: 1,
          unitPrice: faker.commerce.price()
        })]
      });

      const mockUpdatedOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        status: OrderStatus.CONFIRMED
      });

      vitest.mocked(mockRepository.findOrderByID)
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce(mockUpdatedOrder);
      vitest.mocked(mockRepository.updateOrderStatus).mockResolvedValue();

      const orderService = new OrderService(mockOrder, mockRepository);
      await orderService.confirmOrder();

      expect(mockRepository.updateOrderStatus).toHaveBeenCalledWith(orderID, OrderStatus.CONFIRMED);
      expect(mockRepository.findOrderByID).toHaveBeenCalledTimes(1);
    });

    test("should cancel order successfully", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const mockOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        status: OrderStatus.PENDING
      });

      const mockUpdatedOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        status: OrderStatus.CANCELLED
      });

      vitest.mocked(mockRepository.findOrderByID)
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce(mockUpdatedOrder);
      vitest.mocked(mockRepository.updateOrderStatus).mockResolvedValue();

      const orderService = new OrderService(mockOrder, mockRepository);
      await orderService.cancelOrder();

      expect(mockRepository.updateOrderStatus).toHaveBeenCalledWith(orderID, OrderStatus.CANCELLED);
    });

    test("should ship order successfully", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const mockOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        status: OrderStatus.CONFIRMED
      });

      const mockUpdatedOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        status: OrderStatus.SHIPPED
      });

      vitest.mocked(mockRepository.findOrderByID)
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce(mockUpdatedOrder);
      vitest.mocked(mockRepository.updateOrderStatus).mockResolvedValue();

      const orderService = new OrderService(mockOrder, mockRepository);
      await orderService.shipOrder();

      expect(mockRepository.updateOrderStatus).toHaveBeenCalledWith(orderID, OrderStatus.SHIPPED);
    });

    test("should deliver order successfully", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();

      const mockOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        status: OrderStatus.SHIPPED
      });

      const mockUpdatedOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        status: OrderStatus.DELIVERED
      });

      vitest.mocked(mockRepository.findOrderByID)
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce(mockUpdatedOrder);
      vitest.mocked(mockRepository.updateOrderStatus).mockResolvedValue();

      const orderService = new OrderService(mockOrder, mockRepository);
      await orderService.deliverOrder();

      expect(mockRepository.updateOrderStatus).toHaveBeenCalledWith(orderID, OrderStatus.DELIVERED);
    });
  });

  describe("Item Operations", () => {
    test("should add item to order successfully", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.commerce.price();

      const mockOrder = new Order({
        orderID,
        userID,
        shippingAddress
      });

      const mockOrderItem = new OrderItem({
        productID,
        quantity,
        unitPrice
      });

      const mockUpdatedOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        items: [mockOrderItem]
      });

      vitest.mocked(mockRepository.addOrderItem).mockResolvedValue(mockOrderItem);
      vitest.mocked(mockRepository.updateOrderTotals).mockResolvedValue();
      vitest.mocked(mockRepository.findOrderByID).mockResolvedValue(mockUpdatedOrder);

      const orderService = new OrderService(mockOrder, mockRepository);
      const result = await orderService.addItem(productID, quantity, unitPrice);

      expect(mockRepository.addOrderItem).toHaveBeenCalledWith(orderID, expect.any(OrderItem));
      expect(mockRepository.updateOrderTotals).toHaveBeenCalled();
      expect(result).toBeInstanceOf(OrderItem);
      expect(result.productID).toBe(productID);
    });

    test("should remove item from order successfully", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      const itemID = faker.string.uuid();

      const mockOrderItem = new OrderItem({
        id: itemID,
        productID: faker.string.uuid(),
        quantity: 1,
        unitPrice: faker.commerce.price()
      });

      const mockOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        items: [mockOrderItem]
      });

      const mockUpdatedOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        items: []
      });

      vitest.mocked(mockRepository.removeOrderItem).mockResolvedValue();
      vitest.mocked(mockRepository.updateOrderTotals).mockResolvedValue();
      vitest.mocked(mockRepository.findOrderByID).mockResolvedValue(mockUpdatedOrder);

      const orderService = new OrderService(mockOrder, mockRepository);
      await orderService.removeItem(itemID);

      expect(mockRepository.removeOrderItem).toHaveBeenCalledWith(itemID);
      expect(mockRepository.updateOrderTotals).toHaveBeenCalled();
    });

    test("should update item quantity successfully", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      const itemID = faker.string.uuid();
      const newQuantity = faker.number.int({ min: 1, max: 10 });

      const mockOrderItem = new OrderItem({
        id: itemID,
        productID: faker.string.uuid(),
        quantity: 1,
        unitPrice: faker.commerce.price()
      });

      const mockOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        items: [mockOrderItem]
      });

      const mockUpdatedOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        items: [mockOrderItem]
      });

      vitest.mocked(mockRepository.updateOrderItem).mockResolvedValue();
      vitest.mocked(mockRepository.updateOrderTotals).mockResolvedValue();
      vitest.mocked(mockRepository.findOrderByID).mockResolvedValue(mockUpdatedOrder);

      const orderService = new OrderService(mockOrder, mockRepository);
      await orderService.updateItemQuantity(itemID, newQuantity);

      expect(mockRepository.updateOrderItem).toHaveBeenCalledWith(
        itemID, 
        newQuantity, 
        mockOrderItem.unitPrice
      );
      expect(mockRepository.updateOrderTotals).toHaveBeenCalled();
    });
  });

  describe("Utility Methods", () => {
    test("should return correct order information", async () => {
      const orderID = faker.string.uuid();
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      const totalAmount = faker.commerce.price();

      const mockOrder = new Order({
        orderID,
        userID,
        shippingAddress,
        totalAmount
      });

      const orderService = new OrderService(mockOrder, mockRepository);

      expect(orderService.orderID).toBe(orderID);
      expect(orderService.userID).toBe(userID);
      expect(orderService.status).toBe(OrderStatus.PENDING);
      expect(orderService.totalAmount).toBe(totalAmount);
      expect(orderService.shippingAddress).toBe(shippingAddress);
      expect(orderService.getTotalPrice()).toBe(parseFloat(totalAmount));
      expect(orderService.isEmpty()).toBe(true);
      expect(orderService.isCompleted()).toBe(false);
      expect(orderService.canBeCancelled()).toBe(true);
    });
  });

  describe("Error Handling", () => {
    test("should handle repository failures gracefully", async () => {
      const userID = faker.string.uuid();
      const shippingAddress = faker.location.streetAddress();
      const cartItems = [new CartItem({
        productID: faker.string.uuid(),
        quantity: 1,
        price: faker.commerce.price()
      })];

      const error = new Error(faker.lorem.sentence());
      vitest.mocked(mockRepository.createOrder).mockRejectedValue(error);

      await expect(
        OrderService.createFromCart(userID, cartItems, shippingAddress, mockRepository)
      ).rejects.toThrowError(error.message);
    });

  });
});