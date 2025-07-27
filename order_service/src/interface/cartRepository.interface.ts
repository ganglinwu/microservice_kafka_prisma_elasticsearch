import { Cart, cartItem } from "../models/cart.models.js";

interface ICartRepository {
  createCart(): Promise<string>;
  findCartByUserID(userID: string): Promise<string>;
  getCartByUserID(userID: string): Promise<Cart | null>;
  addItemToCart(cartID: string, cartItem: cartItem): Promise<cartItem>;
  deleteCartByID(cartID: string): Promise<void>;
  removeItemFromCart(cartItemID: string): Promise<void>;
}

export { ICartRepository };
