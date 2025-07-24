import { uuid, integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const cartTable = pgTable("carts", {
  cartID: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userID: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItemsTable = pgTable("cart_items", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  cartId: uuid("cart_id")
    .references(() => cartTable.cartID, { onDelete: "cascade" })
    .notNull(),
  productID: uuid("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
