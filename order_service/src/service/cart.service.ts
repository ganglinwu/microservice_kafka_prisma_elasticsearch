/*
 service: business logic, validation, orchestration
 */

import { CartItem } from "../domain/entities/CartItem.js";
import { CartRepository } from "../repository/cart.repository.js";

export class CartService {
  private cartID: string;
  private repository: CartRepository;

  private constructor(cartID: string, repo: CartRepository) {
    this.cartID = cartID;
    this.repository = repo;
  }

  static async createNewCart(userID: string, repo: CartRepository): Promise<CartService> {
    const cartID = await repo.createCart();
    return new CartService(cartID, repo);
  }

  async addToCart(cartItem: CartItem): Promise<CartItem> {
    // Business rule validation
    if (cartItem.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    
    // TODO: Add product existence check, inventory validation, pricing validation
    
    cartItem.cartID = this.cartID;
    return await this.repository.addItemToCart(this.cartID, cartItem);
  }
  async removeFromCart(cartItemID: string): Promise<void> {
    if (!cartItemID) {
      throw new Error("Cart item ID is required");
    }
    
    // TODO: Verify item belongs to this cart before deletion
    
    await this.repository.removeItemFromCart(cartItemID);
  }
  async updateQuantity();
  async viewCart();
  async emptyCart();
  async checkOutCart();
}
