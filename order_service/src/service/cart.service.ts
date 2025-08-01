/*
 service: business logic, validation, orchestration
 */

import { Cart } from "../domain/entities/Cart.js";
import { CartItem } from "../domain/entities/CartItem.js";
import { CartRepository } from "../repository/cart.repository.js";
import { loggers } from "../utils/logger.js";

export class CartService {
  private cart: Cart;
  private repository: CartRepository;

  private constructor(cart: Cart, repo: CartRepository) {
    this.cart = cart;
    this.repository = repo;
  }

  static async createNewCart(userID: string, repo: CartRepository): Promise<CartService> {
    const startTime = Date.now();
    try {
      const cart = await repo.createCart(userID);
      const duration = Date.now() - startTime;
      
      loggers.business('cart_created', {
        userID,
        cartID: cart.cartID,
        duration,
      });
      
      return new CartService(cart, repo);
    } catch (error) {
      const duration = Date.now() - startTime;
      loggers.error(error as Error, {
        operation: 'createNewCart',
        userID,
        duration,
      });
      throw error;
    }
  }

  static async loadExistingCart(userID: string, repo: CartRepository): Promise<CartService | null> {
    const cart = await repo.findCartByUserID(userID);
    if (!cart) {
      return null;
    }
    return new CartService(cart, repo);
  }

  async addItem(productID: string, quantity: number, price: string): Promise<CartItem> {
    // Domain validation using Cart entity
    this.cart.validateNotExpired();
    this.cart.validateQuantity(quantity);
    
    // Check if adding this quantity would exceed the limit for existing item
    const existingItem = await this.repository.findCartItemByProduct(this.cart.cartID, productID);
    if (existingItem) {
      const newTotalQuantity = existingItem.quantity + quantity;
      this.cart.validateQuantity(newTotalQuantity);
    }
    
    // TODO: Add product existence check, inventory validation
    
    return await this.repository.addOrUpdateCartItem(this.cart.cartID, productID, quantity, price);
  }
  async removeItem(cartItemID: string): Promise<void> {
    if (!cartItemID) {
      throw new Error("Cart item ID is required");
    }
    
    this.cart.validateNotExpired();
    
    // TODO: Verify item belongs to this cart before deletion
    
    await this.repository.removeCartItem(cartItemID);
  }
  async updateItemQuantity(cartItemID: string, quantity: number): Promise<void> {
    this.cart.validateNotExpired();
    
    if (quantity === 0) {
      // If quantity is 0, remove the item instead
      await this.removeItem(cartItemID);
    } else {
      this.cart.validateQuantity(quantity);
      await this.repository.updateCartItemQuantity(cartItemID, quantity);
    }
  }

  async getCart(): Promise<Cart> {
    // Refresh cart data from repository to get latest state
    const latestCart = await this.repository.findCartByUserID(this.cart.userID);
    if (!latestCart) {
      throw new Error("Cart no longer exists");
    }
    this.cart = latestCart;
    return this.cart;
  }

  async clearCart(): Promise<void> {
    this.cart.validateNotExpired();
    await this.repository.clearCartItems(this.cart.cartID);
  }

  async deleteCart(): Promise<void> {
    await this.repository.deleteCartByID(this.cart.cartID);
  }

  // Getters for cart information
  get cartID(): string {
    return this.cart.cartID;
  }

  get userID(): string {
    return this.cart.userID;
  }

  isExpired(): boolean {
    return this.cart.isExpired();
  }

  getTotalPrice(): number {
    return this.cart.getTotalPrice();
  }

  getItemCount(): number {
    return this.cart.getItemCount();
  }

  isEmpty(): boolean {
    return this.cart.isEmpty();
  }
}
