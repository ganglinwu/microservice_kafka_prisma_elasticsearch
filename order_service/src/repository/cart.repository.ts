import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { cartTable, cartItemsTable } from "../db/schema.js";
import { ICartRepository } from "../interface/cartRepository.interface.js";
import { Cart } from "../domain/entities/Cart.js";
import { CartItem } from "../domain/entities/CartItem.js";
import * as schema from "../db/schema.js";
import { validate } from "uuid";

export class CartRepository implements ICartRepository {
  private _db: NodePgDatabase<typeof schema>;

  constructor(db: NodePgDatabase<typeof schema>) {
    this._db = db;
  }

  // TODO: Implement expired cart cleanup strategy
  // - Add cleanupExpiredCarts() method for application-level cleanup
  // - Consider hybrid approach: soft delete for 90 days, then hard delete
  // - Implement at database-level with stored procedures/functions
  // - Add deleted_at column for soft delete tracking
  // - Schedule background job or DB cron for automated cleanup

  private mapToCartItemDomain(dbItem: any): CartItem {
    return new CartItem({
      productID: dbItem.productID,
      quantity: dbItem.quantity,
      price: dbItem.price,
      id: dbItem.id,
      createdAt: dbItem.createdAt,
      updatedAt: dbItem.updatedAt
    });
  }

  private mapToCartDomain(dbCart: any, dbItems: any[] = []): Cart {
    // Create the Cart domain entity from database data
    const cart = new Cart({
      cartID: dbCart.cartID,
      userID: dbCart.userID,
      items: new Map(),
      createdAt: dbCart.createdAt,
      updatedAt: dbCart.updatedAt
    });
    
    // Convert each database cart item to domain CartItem and add to cart's items Map
    dbItems.forEach(item => {
      const cartItem = this.mapToCartItemDomain(item);
      // Access private items property to populate the Map
      (cart as any)['items'].set(item.productID, cartItem);
    });
    
    return cart;
  }

  async createCart(userID: string): Promise<Cart> {
    try {
      if (!validate(userID)) {
        throw new Error("Invalid userID");
      }
      
      const returnValue = await this._db
        .insert(cartTable)
        .values({ userID })
        .returning();

      const dbCart = returnValue[0];
      if (!dbCart) {
        throw new Error("Failed to create cart");
      }
      
      // Map database result to domain entity (no items yet, so empty array)
      return this.mapToCartDomain(dbCart, []);
    } catch (err) {
      throw err;
    }
  }
  async findCartByUserID(userID: string): Promise<Cart | null> {
    try {
      if (!validate(userID)) {
        throw new Error("Invalid userID");
      }
      
      const cartWithItems = await this._db.query.cartTable.findFirst({
        where: eq(cartTable.userID, userID),
        with: {
          items: true,
        },
      });
      
      if (!cartWithItems) {
        return null;
      }
      
      // Map database result to domain entity
      return this.mapToCartDomain(cartWithItems, cartWithItems.items);
    } catch (err) {
      throw err;
    }
  }

  async findCartItemByProduct(cartID: string, productID: string): Promise<CartItem | null> {
    try {
      if (!validate(cartID)) {
        throw new Error("Invalid cartID");
      }
      
      const dbItem = await this._db.query.cartItemsTable.findFirst({
        where: (items, { eq, and }) => and(
          eq(items.cartID, cartID),
          eq(items.productID, productID)
        ),
      });
      
      return dbItem ? this.mapToCartItemDomain(dbItem) : null;
    } catch (err) {
      throw err;
    }
  }

  async addOrUpdateCartItem(cartID: string, productID: string, quantity: number, price: string): Promise<CartItem> {
    try {
      if (!validate(cartID)) {
        throw new Error("Invalid cartID");
      }
      
      // 1. Check if product already exists in cart
      const existing = await this.findCartItemByProduct(cartID, productID);
      
      if (existing) {
        // 2a. UPDATE: Aggregate quantity, use new price
        const newQuantity = existing.quantity + quantity;
        const updatedRows = await this._db
          .update(cartItemsTable)
          .set({ 
            quantity: newQuantity, 
            price: price,  // Use latest price
            updatedAt: new Date() 
          })
          .where(eq(cartItemsTable.id, existing.id!))
          .returning();
        
        const updatedItem = updatedRows[0];
        if (!updatedItem) {
          throw new Error("Failed to update cart item");
        }
        
        return this.mapToCartItemDomain(updatedItem);
      } else {
        // 2b. INSERT: Create new cart item
        const insertedRows = await this._db
          .insert(cartItemsTable)
          .values({ cartID, productID, quantity, price })
          .returning();
          
        const insertedItem = insertedRows[0];
        if (!insertedItem) {
          throw new Error("Failed to insert cart item");
        }
        
        return this.mapToCartItemDomain(insertedItem);
      }
    } catch (err) {
      throw err;
    }
  }
  async updateCartItemQuantity(cartItemID: string, quantity: number): Promise<void> {
    try {
      if (!validate(cartItemID)) {
        throw new Error("Invalid cart item ID");
      }
      
      await this._db
        .update(cartItemsTable)
        .set({ 
          quantity: quantity, 
          updatedAt: new Date() 
        })
        .where(eq(cartItemsTable.id, cartItemID));
    } catch (err) {
      throw err;
    }
  }

  async deleteCartByID(cartID: string): Promise<void> {
    try {
      if (!validate(cartID)) {
        throw new Error("Invalid cartID");
      }
      await this._db.delete(cartTable).where(eq(cartTable.cartID, cartID));
    } catch (err) {
      throw err;
    }
  }

  async removeCartItem(cartItemID: string): Promise<void> {
    try {
      if (!validate(cartItemID)) {
        throw new Error("Invalid cart item ID");
      }
      
      await this._db
        .delete(cartItemsTable)
        .where(eq(cartItemsTable.id, cartItemID));
    } catch (err) {
      throw err;
    }
  }

  async clearCartItems(cartID: string): Promise<void> {
    try {
      if (!validate(cartID)) {
        throw new Error("Invalid cartID");
      }
      
      await this._db
        .delete(cartItemsTable)
        .where(eq(cartItemsTable.cartID, cartID));
    } catch (err) {
      throw err;
    }
  }
}
