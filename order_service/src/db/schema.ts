import { relations } from "drizzle-orm";
import {
  uuid,
  integer,
  pgTable,
  timestamp,
  numeric,
  text,
  pgEnum,
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

// Order Status Enum
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED", 
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
]);

// Orders Table
export const ordersTable = pgTable("orders", {
  orderID: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userID: uuid("user_id").notNull(),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  totalAmount: numeric("total_amount").notNull(),
  itemCount: integer("item_count").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order Items Table
export const orderItemsTable = pgTable("order_items", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  orderID: uuid("order_id")
    .references(() => ordersTable.orderID, { onDelete: "cascade" })
    .notNull(),
  productID: uuid("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  totalPrice: numeric("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order Relations
export const orderRelations = relations(ordersTable, ({ many }) => ({
  items: many(orderItemsTable),
}));

export const orderItemRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.orderID],
    references: [ordersTable.orderID],
  }),
}));
