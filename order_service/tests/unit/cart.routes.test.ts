import { describe, expect, test, vitest, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import request from "supertest";
import express from "express";
import cartRouter from "../../src/routes/cart.routes.js";
import { CartService } from "../../src/service/cart.service.js";
import { Cart } from "../../src/domain/entities/Cart.js";
import { CartItem } from "../../src/domain/entities/CartItem.js";

// Mock dependencies
vitest.mock("../../src/service/cart.service.js");
vitest.mock("../../src/config/index.js", () => ({
  db: {}
}));

// Create test app
const app = express();
app.use(express.json());
app.use("/api/carts", cartRouter);

// Add error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(error.status || 500).json({ error: error.message });
});

describe("Cart Routes Unit Tests", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
  });

  describe("POST /api/carts - Create Cart", () => {
    test("should create cart successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      
      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      const mockCartService = {
        getCart: vitest.fn().mockResolvedValue(mockCart),
        cartID: cartID,
        userID: userID,
        isExpired: vitest.fn().mockReturnValue(false),
        getTotalPrice: vitest.fn().mockReturnValue(0),
        getItemCount: vitest.fn().mockReturnValue(0),
        isEmpty: vitest.fn().mockReturnValue(true)
      };

      vitest.mocked(CartService.createNewCart).mockResolvedValue(mockCartService as any);

      const response = await request(app)
        .post("/api/carts")
        .send({ userID })
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          cartID: cartID,
          userID: userID,
          items: [],
          itemCount: 0,
          totalPrice: 0,
          createdAt: mockCart.createdAt.toISOString(),
          isEmpty: true
        }
      });

      expect(CartService.createNewCart).toHaveBeenCalledWith(userID, expect.any(Object));
    });

    test("should return 400 for missing userID", async () => {
      const response = await request(app)
        .post("/api/carts")
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: "Valid userID is required"
      });
    });

    test("should return 400 for empty userID", async () => {
      const response = await request(app)
        .post("/api/carts")
        .send({ userID: "" })
        .expect(400);

      expect(response.body).toEqual({
        error: "Valid userID is required"
      });
    });

    test("should return 400 for non-string userID", async () => {
      const response = await request(app)
        .post("/api/carts")
        .send({ userID: 123 })
        .expect(400);

      expect(response.body).toEqual({
        error: "Valid userID is required"
      });
    });
  });

  describe("GET /api/carts/:userID - Get Cart", () => {
    test("should get cart successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      
      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const mockCartService = {
        getCart: vitest.fn().mockResolvedValue(mockCart),
        isExpired: vitest.fn().mockReturnValue(false)
      };

      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(mockCartService as any);

      const response = await request(app)
        .get(`/api/carts/${userID}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cartID).toBe(cartID);
      expect(response.body.data.userID).toBe(userID);
      expect(response.body.data.isExpired).toBe(false);

      expect(CartService.loadExistingCart).toHaveBeenCalledWith(userID, expect.any(Object));
    });

    test("should return 404 when cart not found", async () => {
      const userID = faker.string.uuid();

      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/carts/${userID}`)
        .expect(404);

      expect(response.body).toEqual({
        error: "Cart not found"
      });
    });

    test("should return 404 for invalid userID", async () => {
      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(null);

      const response = await request(app)
        .get("/api/carts/invalid-id")
        .expect(404);

      expect(response.body.error).toBe("Cart not found");
    });
  });

  describe("POST /api/carts/:userID/items - Add Item", () => {
    test("should add item to existing cart", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 10 });
      const price = faker.commerce.price();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      const mockCartItem = new CartItem({
        productID: productID,
        quantity: quantity,
        price: price
      });

      const mockCartService = {
        addItem: vitest.fn().mockResolvedValue(mockCartItem),
        getCart: vitest.fn().mockResolvedValue(mockCart)
      };

      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(mockCartService as any);

      const response = await request(app)
        .post(`/api/carts/${userID}/items`)
        .send({ productID, quantity, price })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.addedItem).toEqual(expect.objectContaining({
        productID: productID,
        quantity: quantity,
        price: price
      }));

      expect(mockCartService.addItem).toHaveBeenCalledWith(productID, quantity, price);
    });

    test("should create cart and add item when cart doesn't exist", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 10 });
      const price = faker.commerce.price();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      const mockCartItem = new CartItem({
        productID: productID,
        quantity: quantity,
        price: price
      });

      const mockCartService = {
        addItem: vitest.fn().mockResolvedValue(mockCartItem),
        getCart: vitest.fn().mockResolvedValue(mockCart)
      };

      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(null);
      vitest.mocked(CartService.createNewCart).mockResolvedValue(mockCartService as any);

      const response = await request(app)
        .post(`/api/carts/${userID}/items`)
        .send({ productID, quantity, price })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(CartService.createNewCart).toHaveBeenCalledWith(userID, expect.any(Object));
      expect(mockCartService.addItem).toHaveBeenCalledWith(productID, quantity, price);
    });

    test("should return 400 for missing productID", async () => {
      const userID = faker.string.uuid();

      const response = await request(app)
        .post(`/api/carts/${userID}/items`)
        .send({ quantity: 1, price: "10.00" })
        .expect(400);

      expect(response.body.error).toContain("productID");
    });

    test("should return 400 for invalid quantity", async () => {
      const userID = faker.string.uuid();
      const productID = faker.string.uuid();

      const response = await request(app)
        .post(`/api/carts/${userID}/items`)
        .send({ productID, quantity: 0, price: "10.00" })
        .expect(400);

      expect(response.body.error).toContain("quantity");
    });
  });

  describe("PUT /api/carts/:userID/items/:itemID/quantity - Update Quantity", () => {
    test("should update item quantity successfully", async () => {
      const userID = faker.string.uuid();
      const itemID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const newQuantity = faker.number.int({ min: 1, max: 10 });

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      const mockCartService = {
        updateItemQuantity: vitest.fn().mockResolvedValue(undefined),
        getCart: vitest.fn().mockResolvedValue(mockCart)
      };

      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(mockCartService as any);

      const response = await request(app)
        .put(`/api/carts/${userID}/items/${itemID}/quantity`)
        .send({ quantity: newQuantity })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Item quantity updated");
      expect(mockCartService.updateItemQuantity).toHaveBeenCalledWith(itemID, newQuantity);
    });

    test("should remove item when quantity is 0", async () => {
      const userID = faker.string.uuid();
      const itemID = faker.string.uuid();
      const cartID = faker.string.uuid();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      const mockCartService = {
        updateItemQuantity: vitest.fn().mockResolvedValue(undefined),
        getCart: vitest.fn().mockResolvedValue(mockCart)
      };

      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(mockCartService as any);

      const response = await request(app)
        .put(`/api/carts/${userID}/items/${itemID}/quantity`)
        .send({ quantity: 0 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Item removed from cart");
    });

    test("should return 404 when cart not found", async () => {
      const userID = faker.string.uuid();
      const itemID = faker.string.uuid();

      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/carts/${userID}/items/${itemID}/quantity`)
        .send({ quantity: 5 })
        .expect(404);

      expect(response.body.error).toBe("Cart not found");
    });
  });

  describe("DELETE /api/carts/:userID/items/:itemID - Remove Item", () => {
    test("should remove item successfully", async () => {
      const userID = faker.string.uuid();
      const itemID = faker.string.uuid();
      const cartID = faker.string.uuid();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      const mockCartService = {
        removeItem: vitest.fn().mockResolvedValue(undefined),
        getCart: vitest.fn().mockResolvedValue(mockCart)
      };

      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(mockCartService as any);

      const response = await request(app)
        .delete(`/api/carts/${userID}/items/${itemID}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Item removed from cart");
      expect(mockCartService.removeItem).toHaveBeenCalledWith(itemID);
    });
  });

  describe("DELETE /api/carts/:userID/items - Clear Cart", () => {
    test("should clear cart successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      const mockCartService = {
        clearCart: vitest.fn().mockResolvedValue(undefined),
        getCart: vitest.fn().mockResolvedValue(mockCart)
      };

      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(mockCartService as any);

      const response = await request(app)
        .delete(`/api/carts/${userID}/items`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Cart cleared successfully");
      expect(mockCartService.clearCart).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/carts/:userID - Delete Cart", () => {
    test("should delete cart successfully", async () => {
      const userID = faker.string.uuid();

      const mockCartService = {
        deleteCart: vitest.fn().mockResolvedValue(undefined)
      };

      vitest.mocked(CartService.loadExistingCart).mockResolvedValue(mockCartService as any);

      const response = await request(app)
        .delete(`/api/carts/${userID}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe("Cart deleted successfully");
      expect(mockCartService.deleteCart).toHaveBeenCalled();
    });
  });
});