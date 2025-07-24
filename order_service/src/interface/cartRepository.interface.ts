import { cartProduct } from "../models/cart.models.js";

interface ICartRepository {
  createCart(products: cartProduct[]): Promise<string>;
  findCartByUserID(userID: string): Promise<string>;
  updateCartByCartID(cartID: string, products: cartProduct): Promise<{}>;
  deleteCartByID(cartID: string): Promise<{}>;
}

export { ICartRepository };
