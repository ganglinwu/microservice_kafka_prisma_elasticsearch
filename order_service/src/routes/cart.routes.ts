import express from "express";
import { CartService } from "../service/cart.service.js";
import { CartRepository } from "../repository/cart.repository.js";
import { db } from "../config/index.js";
import { validateUserID, createUserIDValidator, createAddItemValidator, createQuantityUpdateValidator } from "../utils/validation.js";

const cartRouter = express.Router();
const cartRepository = new CartRepository(db);

// Error handling wrapper
const handleAsync = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware
const validateUserIDParam = createUserIDValidator();
const validateAddItemInput = createAddItemValidator();
const validateQuantityUpdate = createQuantityUpdateValidator();

// POST /api/carts - Create new cart
cartRouter.post("/", handleAsync(async (req: express.Request, res: express.Response) => {
  const { userID } = req.body;
  
  // Basic validation using helper
  const userIDError = validateUserID(userID);
  if (userIDError) {
    return res.status(400).json({ error: userIDError });
  }
  
  const cartService = await CartService.createNewCart(userID, cartRepository);
  const cart = await cartService.getCart();
  
  res.status(201).json({
    success: true,
    data: {
      cartID: cart.cartID,
      userID: cart.userID,
      items: cart.getItems(),
      itemCount: cart.getItemCount(),
      totalPrice: cart.getTotalPrice(),
      createdAt: cart.createdAt,
      isEmpty: cart.isEmpty()
    }
  });
}));

// GET /api/carts/:userID - Get cart by user ID
cartRouter.get("/:userID", validateUserIDParam, handleAsync(async (req: express.Request, res: express.Response) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID parameter is required' });
  }
  
  const cartService = await CartService.loadExistingCart(userID, cartRepository);
  
  if (!cartService) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  const cart = await cartService.getCart();
  
  res.status(200).json({
    success: true,
    data: {
      cartID: cart.cartID,
      userID: cart.userID,
      items: cart.getItems(),
      itemCount: cart.getItemCount(),
      totalPrice: cart.getTotalPrice(),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      isEmpty: cart.isEmpty(),
      isExpired: cartService.isExpired()
    }
  });
}));

// POST /api/carts/:userID/items - Add item to cart
cartRouter.post("/:userID/items", validateUserIDParam, validateAddItemInput, handleAsync(async (req: express.Request, res: express.Response) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID parameter is required' });
  }
  const { productID, quantity, price } = req.body;
  
  let cartService = await CartService.loadExistingCart(userID, cartRepository);
  
  // Create cart if it doesn't exist
  if (!cartService) {
    cartService = await CartService.createNewCart(userID, cartRepository);
  }
  
  const addedItem = await cartService.addItem(productID, quantity, price);
  const cart = await cartService.getCart();
  
  res.status(201).json({
    success: true,
    data: {
      addedItem,
      cart: {
        cartID: cart.cartID,
        userID: cart.userID,
        itemCount: cart.getItemCount(),
        totalPrice: cart.getTotalPrice(),
        isEmpty: cart.isEmpty()
      }
    }
  });
}));

// PUT /api/carts/:userID/items/:itemID/quantity - Update item quantity
cartRouter.put("/:userID/items/:itemID/quantity", validateUserIDParam, validateQuantityUpdate, handleAsync(async (req: express.Request, res: express.Response) => {
  const { userID, itemID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID parameter is required' });
  }
  if (!itemID) {
    return res.status(400).json({ error: 'itemID parameter is required' });
  }
  const { quantity } = req.body;
  
  const cartService = await CartService.loadExistingCart(userID, cartRepository);
  
  if (!cartService) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  await cartService.updateItemQuantity(itemID, quantity);
  const cart = await cartService.getCart();
  
  res.status(200).json({
    success: true,
    data: {
      message: quantity === 0 ? 'Item removed from cart' : 'Item quantity updated',
      cart: {
        cartID: cart.cartID,
        userID: cart.userID,
        itemCount: cart.getItemCount(),
        totalPrice: cart.getTotalPrice(),
        isEmpty: cart.isEmpty()
      }
    }
  });
}));

// DELETE /api/carts/:userID/items/:itemID - Remove item from cart
cartRouter.delete("/:userID/items/:itemID", validateUserIDParam, handleAsync(async (req: express.Request, res: express.Response) => {
  const { userID, itemID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID parameter is required' });
  }
  if (!itemID) {
    return res.status(400).json({ error: 'itemID parameter is required' });
  }
  
  const cartService = await CartService.loadExistingCart(userID, cartRepository);
  
  if (!cartService) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  await cartService.removeItem(itemID);
  const cart = await cartService.getCart();
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Item removed from cart',
      cart: {
        cartID: cart.cartID,
        userID: cart.userID,
        itemCount: cart.getItemCount(),
        totalPrice: cart.getTotalPrice(),
        isEmpty: cart.isEmpty()
      }
    }
  });
}));

// DELETE /api/carts/:userID/items - Clear all items from cart
cartRouter.delete("/:userID/items", validateUserIDParam, handleAsync(async (req: express.Request, res: express.Response) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID parameter is required' });
  }
  
  const cartService = await CartService.loadExistingCart(userID, cartRepository);
  
  if (!cartService) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  await cartService.clearCart();
  const cart = await cartService.getCart();
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Cart cleared successfully',
      cart: {
        cartID: cart.cartID,
        userID: cart.userID,
        itemCount: cart.getItemCount(), // Should be 0
        totalPrice: cart.getTotalPrice(), // Should be 0
        isEmpty: cart.isEmpty() // Should be true
      }
    }
  });
}));

// DELETE /api/carts/:userID - Delete entire cart
cartRouter.delete("/:userID", validateUserIDParam, handleAsync(async (req: express.Request, res: express.Response) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID parameter is required' });
  }
  
  const cartService = await CartService.loadExistingCart(userID, cartRepository);
  
  if (!cartService) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  await cartService.deleteCart();
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Cart deleted successfully'
    }
  });
}));

export default cartRouter;
