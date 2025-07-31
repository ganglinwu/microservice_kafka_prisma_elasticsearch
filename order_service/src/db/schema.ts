import { relations } from "drizzle-orm";
import {
  uuid,
  integer,
  pgTable,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { CartItem } from "../domain/entities/CartItem.js";

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
  cartID: uuid("cart_id")
    .references(() => cartTable.cartID, { onDelete: "cascade" })
    .notNull(),
  productID: uuid("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartRelations = relations(cartTable, ({ many }) => ({
  items: many(cartItemsTable),
}));

export const cartItemRelations = relations(cartItemsTable, ({ one }) => ({
  cart: one(cartTable, {
    fields: [cartItemsTable.cartID],
    references: [cartTable.cartID],
  }),
}));
