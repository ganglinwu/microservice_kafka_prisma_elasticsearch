import express from "express";
import { OrderService } from "../service/order.service.js";
import { OrderRepository } from "../repository/order.repository.js";
import { CartService } from "../service/cart.service.js";
import { CartRepository } from "../repository/cart.repository.js";
import { db } from "../config/index.js";
import { validateUserID, validateProductID, validateQuantity, validatePrice } from "../utils/validation.js";

const orderRouter = express.Router();
const orderRepository = new OrderRepository(db);
const cartRepository = new CartRepository(db);

// Error handling wrapper
const handleAsync = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// POST /api/orders - Create order from cart
orderRouter.post("/", handleAsync(async (req: express.Request, res: express.Response) => {
  const { userID, shippingAddress } = req.body;
  
  // Basic validation
  const userIDError = validateUserID(userID);
  if (userIDError) {
    return res.status(400).json({ error: userIDError });
  }
  
  if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim() === '') {
    return res.status(400).json({ error: 'Valid shipping address is required' });
  }
  
  // Load user's cart
  const cartService = await CartService.loadExistingCart(userID, cartRepository);
  if (!cartService) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  const cart = await cartService.getCart();
  if (cart.isEmpty()) {
    return res.status(400).json({ error: 'Cannot create order from empty cart' });
  }
  
  // Create order from cart items
  const orderService = await OrderService.createFromCart(
    userID,
    cart.getItems(),
    shippingAddress.trim(),
    orderRepository
  );
  
  const order = await orderService.getOrder();
  
  res.status(201).json({
    success: true,
    data: {
      orderID: order.orderID,
      userID: order.userID,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.itemCount,
      shippingAddress: order.shippingAddress,
      items: order.getItems(),
      createdAt: order.createdAt
    }
  });
}));

// GET /api/orders/:orderID - Get order by ID
orderRouter.get("/:orderID", handleAsync(async (req: express.Request, res: express.Response) => {
  const { orderID } = req.params;
  if (!orderID) {
    return res.status(400).json({ error: 'orderID parameter is required' });
  }
  
  const orderService = await OrderService.loadExistingOrder(orderID, orderRepository);
  if (!orderService) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const order = await orderService.getOrder();
  
  res.status(200).json({
    success: true,
    data: {
      orderID: order.orderID,
      userID: order.userID,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.itemCount,
      shippingAddress: order.shippingAddress,
      items: order.getItems(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      isEmpty: order.isEmpty(),
      isCompleted: order.isCompleted(),
      canBeCancelled: order.canBeCancelled()
    }
  });
}));

// GET /api/orders/user/:userID - Get orders by user ID
orderRouter.get("/user/:userID", handleAsync(async (req: express.Request, res: express.Response) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID parameter is required' });
  }
  
  const userIDError = validateUserID(userID);
  if (userIDError) {
    return res.status(400).json({ error: userIDError });
  }
  
  const orderServices = await OrderService.findOrdersByUser(userID, orderRepository);
  
  const orders = await Promise.all(
    orderServices.map(async (service) => {
      const order = await service.getOrder();
      return {
        orderID: order.orderID,
        status: order.status,
        totalAmount: order.totalAmount,
        itemCount: order.itemCount,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        isEmpty: order.isEmpty(),
        isCompleted: order.isCompleted(),
        canBeCancelled: order.canBeCancelled()
      };
    })
  );
  
  res.status(200).json({
    success: true,
    data: {
      orders,
      count: orders.length
    }
  });
}));

// PUT /api/orders/:orderID/confirm - Confirm order
orderRouter.put("/:orderID/confirm", handleAsync(async (req: express.Request, res: express.Response) => {
  const { orderID } = req.params;
  if (!orderID) {
    return res.status(400).json({ error: 'orderID parameter is required' });
  }
  
  const orderService = await OrderService.loadExistingOrder(orderID, orderRepository);
  if (!orderService) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  await orderService.confirmOrder();
  const order = await orderService.getOrder();
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Order confirmed successfully',
      orderID: order.orderID,
      status: order.status,
      updatedAt: order.updatedAt
    }
  });
}));

// PUT /api/orders/:orderID/cancel - Cancel order
orderRouter.put("/:orderID/cancel", handleAsync(async (req: express.Request, res: express.Response) => {
  const { orderID } = req.params;
  if (!orderID) {
    return res.status(400).json({ error: 'orderID parameter is required' });
  }
  
  const orderService = await OrderService.loadExistingOrder(orderID, orderRepository);
  if (!orderService) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  await orderService.cancelOrder();
  const order = await orderService.getOrder();
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Order cancelled successfully',
      orderID: order.orderID,
      status: order.status,
      updatedAt: order.updatedAt
    }
  });
}));

// PUT /api/orders/:orderID/ship - Ship order
orderRouter.put("/:orderID/ship", handleAsync(async (req: express.Request, res: express.Response) => {
  const { orderID } = req.params;
  if (!orderID) {
    return res.status(400).json({ error: 'orderID parameter is required' });
  }
  
  const orderService = await OrderService.loadExistingOrder(orderID, orderRepository);
  if (!orderService) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  await orderService.shipOrder();
  const order = await orderService.getOrder();
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Order shipped successfully',
      orderID: order.orderID,
      status: order.status,
      updatedAt: order.updatedAt
    }
  });
}));

// PUT /api/orders/:orderID/deliver - Mark order as delivered
orderRouter.put("/:orderID/deliver", handleAsync(async (req: express.Request, res: express.Response) => {
  const { orderID } = req.params;
  if (!orderID) {
    return res.status(400).json({ error: 'orderID parameter is required' });
  }
  
  const orderService = await OrderService.loadExistingOrder(orderID, orderRepository);
  if (!orderService) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  await orderService.deliverOrder();
  const order = await orderService.getOrder();
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Order delivered successfully',
      orderID: order.orderID,
      status: order.status,
      updatedAt: order.updatedAt
    }
  });
}));

export default orderRouter;
