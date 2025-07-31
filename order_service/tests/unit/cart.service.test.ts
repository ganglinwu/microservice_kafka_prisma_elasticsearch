import { describe, expect, test, vitest, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import { CartService } from "../../src/service/cart.service.js";
import { Cart } from "../../src/domain/entities/Cart.js";
import { CartItem } from "../../src/domain/entities/CartItem.js";
import { ICartRepository } from "../../src/interface/cartRepository.interface.js";

// Mock repository
const mockRepository: ICartRepository = {
  createCart: vitest.fn(),
  findCartByUserID: vitest.fn(),
  deleteCartByID: vitest.fn(),
  findCartItemByProduct: vitest.fn(),
  addOrUpdateCartItem: vitest.fn(),
  updateCartItemQuantity: vitest.fn(),
  removeCartItem: vitest.fn(),
  clearCartItems: vitest.fn(),
};

describe("CartService Unit Tests", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
  });

  describe("Factory Methods", () => {
    test("should create new cart service successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);

      const cartService = await CartService.createNewCart(userID, mockRepository);

      expect(mockRepository.createCart).toHaveBeenCalledWith(userID);
      expect(cartService).toBeInstanceOf(CartService);
      expect(cartService.cartID).toBe(cartID);
      expect(cartService.userID).toBe(userID);
    });

    test("should load existing cart service successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.findCartByUserID).mockResolvedValue(mockCart);

      const cartService = await CartService.loadExistingCart(userID, mockRepository);

      expect(mockRepository.findCartByUserID).toHaveBeenCalledWith(userID);
      expect(cartService).toBeInstanceOf(CartService);
      expect(cartService!.cartID).toBe(cartID);
    });

    test("should return null when cart doesn't exist", async () => {
      const userID = faker.string.uuid();
      vitest.mocked(mockRepository.findCartByUserID).mockResolvedValue(null);

      const cartService = await CartService.loadExistingCart(userID, mockRepository);

      expect(cartService).toBeNull();
    });
  });

  describe("Add Item", () => {
    test("should add new item successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const productID = faker.string.uuid();
      const productName = faker.commerce.productName();
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

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);
      vitest.mocked(mockRepository.findCartItemByProduct).mockResolvedValue(null);
      vitest.mocked(mockRepository.addOrUpdateCartItem).mockResolvedValue(mockCartItem);

      const cartService = await CartService.createNewCart(userID, mockRepository);
      const result = await cartService.addItem(productID, quantity, price);

      expect(mockRepository.findCartItemByProduct).toHaveBeenCalledWith(cartID, productID);
      expect(mockRepository.addOrUpdateCartItem).toHaveBeenCalledWith(cartID, productID, quantity, price);
      expect(result).toBe(mockCartItem);
    });

    test("should validate quantity when adding to existing item", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const productID = faker.string.uuid();
      const price = faker.commerce.price();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      const existingItem = new CartItem({
        productID: productID,
        quantity: 45, // Close to max limit
        price: price
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);
      vitest.mocked(mockRepository.findCartItemByProduct).mockResolvedValue(existingItem);

      const cartService = await CartService.createNewCart(userID, mockRepository);

      // Should throw error when total would exceed max (45 + 10 = 55 > 50)
      await expect(cartService.addItem(productID, 10, price))
        .rejects.toThrowError(`Maximum quantity per item is ${Cart.MAX_QUANTITY_PER_ITEM}`);
    });

    test("should reject adding to expired cart", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const productID = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 5 });
      const price = faker.commerce.price();

      const expiredDate = new Date(Date.now() - (Cart.CART_EXPIRY_HOURS + 1) * 60 * 60 * 1000);
      const expiredCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: expiredDate
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(expiredCart);

      const cartService = await CartService.createNewCart(userID, mockRepository);

      await expect(cartService.addItem(productID, quantity, price))
        .rejects.toThrowError(`Cart has expired (${Cart.CART_EXPIRY_HOURS} hours limit)`);
    });

    test("should reject invalid quantities", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const productID = faker.string.uuid();
      const price = faker.commerce.price();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);

      const cartService = await CartService.createNewCart(userID, mockRepository);

      await expect(cartService.addItem(productID, 0, price))
        .rejects.toThrowError("Quantity must be greater than 0");

      await expect(cartService.addItem(productID, -1, price))
        .rejects.toThrowError("Quantity must be greater than 0");

      await expect(cartService.addItem(productID, Cart.MAX_QUANTITY_PER_ITEM + 1, price))
        .rejects.toThrowError(`Maximum quantity per item is ${Cart.MAX_QUANTITY_PER_ITEM}`);
    });
  });

  describe("Remove Item", () => {
    test("should remove item successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const cartItemID = faker.string.uuid();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);
      vitest.mocked(mockRepository.removeCartItem).mockResolvedValue();

      const cartService = await CartService.createNewCart(userID, mockRepository);
      await cartService.removeItem(cartItemID);

      expect(mockRepository.removeCartItem).toHaveBeenCalledWith(cartItemID);
    });

    test("should reject removing from expired cart", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const cartItemID = faker.string.uuid();

      const expiredDate = new Date(Date.now() - (Cart.CART_EXPIRY_HOURS + 1) * 60 * 60 * 1000);
      const expiredCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: expiredDate
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(expiredCart);

      const cartService = await CartService.createNewCart(userID, mockRepository);

      await expect(cartService.removeItem(cartItemID))
        .rejects.toThrowError(`Cart has expired (${Cart.CART_EXPIRY_HOURS} hours limit)`);
    });

    test("should reject empty cart item ID", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);

      const cartService = await CartService.createNewCart(userID, mockRepository);

      await expect(cartService.removeItem(""))
        .rejects.toThrowError("Cart item ID is required");
    });
  });

  describe("Update Item Quantity", () => {
    test("should update quantity successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const cartItemID = faker.string.uuid();
      const newQuantity = faker.number.int({ min: 1, max: Cart.MAX_QUANTITY_PER_ITEM });

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);
      vitest.mocked(mockRepository.updateCartItemQuantity).mockResolvedValue();

      const cartService = await CartService.createNewCart(userID, mockRepository);
      await cartService.updateItemQuantity(cartItemID, newQuantity);

      expect(mockRepository.updateCartItemQuantity).toHaveBeenCalledWith(cartItemID, newQuantity);
    });

    test("should remove item when quantity is set to 0", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const cartItemID = faker.string.uuid();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);
      vitest.mocked(mockRepository.removeCartItem).mockResolvedValue();

      const cartService = await CartService.createNewCart(userID, mockRepository);
      await cartService.updateItemQuantity(cartItemID, 0);

      expect(mockRepository.removeCartItem).toHaveBeenCalledWith(cartItemID);
      expect(mockRepository.updateCartItemQuantity).not.toHaveBeenCalled();
    });

    test("should reject invalid quantities", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const cartItemID = faker.string.uuid();

      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);

      const cartService = await CartService.createNewCart(userID, mockRepository);

      await expect(cartService.updateItemQuantity(cartItemID, -1))
        .rejects.toThrowError("Quantity must be greater than 0");

      await expect(cartService.updateItemQuantity(cartItemID, Cart.MAX_QUANTITY_PER_ITEM + 1))
        .rejects.toThrowError(`Maximum quantity per item is ${Cart.MAX_QUANTITY_PER_ITEM}`);
    });
  });

  describe("Cart Operations", () => {
    test("should get cart successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);
      vitest.mocked(mockRepository.findCartByUserID).mockResolvedValue(mockCart);

      const cartService = await CartService.createNewCart(userID, mockRepository);
      const result = await cartService.getCart();

      expect(mockRepository.findCartByUserID).toHaveBeenCalledWith(userID);
      expect(result).toBe(mockCart);
    });

    test("should throw error when cart no longer exists", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);
      vitest.mocked(mockRepository.findCartByUserID).mockResolvedValue(null);

      const cartService = await CartService.createNewCart(userID, mockRepository);

      await expect(cartService.getCart())
        .rejects.toThrowError("Cart no longer exists");
    });

    test("should clear cart successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);
      vitest.mocked(mockRepository.clearCartItems).mockResolvedValue();

      const cartService = await CartService.createNewCart(userID, mockRepository);
      await cartService.clearCart();

      expect(mockRepository.clearCartItems).toHaveBeenCalledWith(cartID);
    });

    test("should delete cart successfully", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);
      vitest.mocked(mockRepository.deleteCartByID).mockResolvedValue();

      const cartService = await CartService.createNewCart(userID, mockRepository);
      await cartService.deleteCart();

      expect(mockRepository.deleteCartByID).toHaveBeenCalledWith(cartID);
    });
  });

  describe("Cart Information Getters", () => {
    test("should return cart information correctly", async () => {
      const userID = faker.string.uuid();
      const cartID = faker.string.uuid();
      const mockCart = new Cart({
        cartID: cartID,
        userID: userID,
        createdAt: new Date()
      });

      vitest.mocked(mockRepository.createCart).mockResolvedValue(mockCart);

      const cartService = await CartService.createNewCart(userID, mockRepository);

      expect(cartService.cartID).toBe(cartID);
      expect(cartService.userID).toBe(userID);
      expect(cartService.isExpired()).toBe(false);
      expect(cartService.getTotalPrice()).toBe(0);
      expect(cartService.getItemCount()).toBe(0);
      expect(cartService.isEmpty()).toBe(true);
    });
  });
});