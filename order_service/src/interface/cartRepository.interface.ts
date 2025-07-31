import { Cart } from "../domain/entities/Cart.js";
import { CartItem } from "../domain/entities/CartItem.js";

interface ICartRepository {
  // Cart operations
  createCart(userID: string): Promise<Cart>;
  findCartByUserID(userID: string): Promise<Cart | null>;
  deleteCartByID(cartID: string): Promise<void>;
  
  // Item operations (supporting upsert logic)
  findCartItemByProduct(cartID: string, productID: string): Promise<CartItem | null>;
  addOrUpdateCartItem(cartID: string, productID: string, quantity: number, price: string): Promise<CartItem>;
  updateCartItemQuantity(cartItemID: string, quantity: number): Promise<void>;
  removeCartItem(cartItemID: string): Promise<void>;
  
  // Batch operations
  clearCartItems(cartID: string): Promise<void>;
}

export { ICartRepository };
