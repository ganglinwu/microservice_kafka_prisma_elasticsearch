import { CartItem } from "./CartItem.js";

export class Cart {
  private static readonly EXPIRY_HOURS = 24;
  private static readonly MAX_ITEM_QUANTITY = 50;

  // Public getters for testing and external access
  static get CART_EXPIRY_HOURS(): number {
    return Cart.EXPIRY_HOURS;
  }
  
  static get MAX_QUANTITY_PER_ITEM(): number {
    return Cart.MAX_ITEM_QUANTITY;
  }
  
  public readonly cartID: string;
  public readonly userID: string;
  public readonly createdAt: Date;
  public updatedAt?: Date;

  constructor({
    cartID,
    userID,
    items = new Map(),
    createdAt = new Date(),
    updatedAt
  }: {
    cartID: string;
    userID: string;
    items?: Map<string, CartItem>;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.cartID = cartID;
    this.userID = userID;
    this.items = items;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isExpired(): boolean {
    const now = new Date();
    const expiryTime = new Date(this.createdAt.getTime() + (Cart.EXPIRY_HOURS * 60 * 60 * 1000));
    return now > expiryTime;
  }

  canAddQuantity(currentQuantity: number, additionalQuantity: number): boolean {
    const totalQuantity = currentQuantity + additionalQuantity;
    return totalQuantity <= Cart.MAX_ITEM_QUANTITY;
  }

  validateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    if (quantity > Cart.MAX_ITEM_QUANTITY) {
      throw new Error(`Maximum quantity per item is ${Cart.MAX_ITEM_QUANTITY}`);
    }
  }

  validateNotExpired(): void {
    if (this.isExpired()) {
      throw new Error("Cart has expired (24 hours limit)");
    }
  }

  getItems(): CartItem[] {
    return Array.from(this.items.values());
  }

  getItemCount(): number {
    return this.items.size;
  }

  getTotalPrice(): number {
    return this.getItems().reduce((total, item) => total + item.getTotalPrice(), 0);
  }

  isEmpty(): boolean {
    return this.items.size === 0;
  }
}