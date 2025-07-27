import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { cartTable, cartItemsTable } from "../db/schema.js";
import { ICartRepository } from "../interface/cartRepository.interface.js";
import { Cart, cartItem } from "../models/cart.models.js";
import * as schema from "../db/schema.js";
import { validate } from "uuid";

export class CartRepository implements ICartRepository {
  private _db: NodePgDatabase<typeof schema>;
  private _userID: string;

  constructor(db: NodePgDatabase<typeof schema>, userID: string) {
    this._db = db;
    this._userID = userID;
  }

  async createCart(): Promise<string> {
    let cartID = "";
    try {
      const returnValue = await this._db
        .insert(cartTable)
        .values({
          userID: this._userID,
        })
        .returning({ cartID: cartTable.cartID });

      cartID = returnValue[0]?.cartID ?? "";
    } catch (err) {
      throw err;
    }
    return cartID;
  }
  async findCartByUserID(userID: string): Promise<string> {
    try {
      if (!validate(userID)) {
        throw new Error("Invalid userID");
      }
      const returnValue = await this._db
        .select({ cartID: cartTable.cartID })
        .from(cartTable)
        .where(eq(cartTable.userID, userID));

      return returnValue[0]?.cartID ?? "";
    } catch (err) {
      throw err;
    }
  }
  async getCartByUserID(userID: string): Promise<Cart | null> {
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
      return cartWithItems ?? null;
    } catch (err) {
      throw err;
    }
  }

  async addItemToCart(cartID: string, item: cartItem): Promise<cartItem> {
    try {
      if (!validate(cartID)) {
        throw new Error("Invalid cartID");
      }
      const rows = await this._db
        .insert(cartItemsTable)
        .values(item)
        .returning();

      const dbitem = rows[0];
      if (!dbitem) {
        throw new Error("Failed to insert cart item");
      }

      const resultItem = new cartItem(
        dbitem.cartID,
        dbitem.productID,
        dbitem.quantity,
        dbitem.price,
      );
      resultItem.id = dbitem.id;
      resultItem.updatedAt = dbitem.updatedAt;

      return resultItem;
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

  async removeItemFromCart(cartItemID: string): Promise<void> {
    try {
      if (!validate(cartItemID)) {
        throw new Error("Invalid ID");
      }
      await this._db
        .delete(cartItemsTable)
        .where(eq(cartItemsTable.id, cartItemID));
    } catch (err) {
      throw err;
    }
  }
}
