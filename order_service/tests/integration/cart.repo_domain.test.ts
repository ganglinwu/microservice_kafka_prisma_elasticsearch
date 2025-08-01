import { describe, expect, test, vitest } from "vitest";
import { faker } from "@faker-js/faker";
import { getTableConfig } from "drizzle-orm/pg-core";

const mockGeneratedCartID = faker.string.uuid();
const fakeUserID = faker.string.uuid();
const mockCreatedAt = new Date();
const mockUpdatedAt = new Date();

// Mock the config module at the top level
vitest.mock("../../src/config/index.js", () => ({
  db: {
    insert: vitest.fn((table) => {
      const config = getTableConfig(table);
      // Mock for cartTable
      if (config.name === "carts") {
        return {
          values: vitest.fn(() => ({
            returning: vitest.fn().mockResolvedValue([{
              cartID: mockGeneratedCartID,
              userID: fakeUserID,
              createdAt: mockCreatedAt,
              updatedAt: mockUpdatedAt
            }]),
          })),
        };
      }
      // Mock for cartItemsTable
      if (config.name === "cart_items") {
        return {
          values: vitest.fn(() => ({
            returning: vitest.fn().mockResolvedValue([
              {
                id: faker.string.uuid(),
                cartID: mockGeneratedCartID,
                productID: faker.string.uuid(),
                quantity: 2,
                price: "19.99",
                createdAt: mockCreatedAt,
                updatedAt: mockUpdatedAt,
              },
            ]),
          })),
        };
      }
      // Default fallback
      return {
        values: vitest.fn(() => ({
          returning: vitest.fn().mockResolvedValue([]),
        })),
      };
    }),
    select: vitest.fn(() => ({
      from: vitest.fn(() => ({
        where: vitest.fn().mockResolvedValue([{ cartID: mockGeneratedCartID }]),
      })),
    })),
    query: {
      cartTable: {
        findFirst: vitest.fn().mockImplementation(() =>
          Promise.resolve({
            cartID: mockGeneratedCartID,
            userID: fakeUserID,
            items: mockCartItems,
          }),
        ),
      },
    },
    delete: vitest.fn((table) => {
      const conf = getTableConfig(table);
      if (conf.name === "carts") {
        return {
          where: vitest.fn().mockResolvedValue(),
        };
      }
      if (conf.name === "cart_items") {
        return {
          where: vitest.fn().mockResolvedValue(),
        };
      }
    }),
  },
}));

import { CartItem } from "../../src/domain/entities/CartItem.js";
import { CartRepository } from "../../src/repository/cart.repository.js";
import { db } from "../../src/config/index.js";
import { cartTable } from "../../src/db/schema.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

const repo = new CartRepository(db);

const mockCartItem1 = new CartItem(
  faker.string.uuid(),
  faker.number.int({ min: 1 }),
  faker.commerce.price(),
  faker.string.uuid(),
  mockCreatedAt,
  mockUpdatedAt
);
const mockCartItem2 = new CartItem(
  faker.string.uuid(),
  faker.number.int({ min: 1 }),
  faker.commerce.price(),
  faker.string.uuid(),
  mockCreatedAt,
  mockUpdatedAt
);

const mockCartItems: CartItem[] = [mockCartItem1, mockCartItem2];

describe("cart repository tests", () => {
  describe("create cart", () => {
    test("should create cart and return domain entity", async () => {
      const returnedCart = await repo.createCart(fakeUserID);

      expect(returnedCart).toBeDefined();
      expect(returnedCart.cartID).toBe(mockGeneratedCartID);
      expect(returnedCart.userID).toBe(fakeUserID);
      expect(returnedCart.getItems()).toEqual([]);
      expect(returnedCart.isEmpty()).toBe(true);
    });
  });

  describe("find cart by userID", () => {
    test("should find cart with items and return domain entity", async () => {
      const returnedCart = await repo.findCartByUserID(fakeUserID);

      expect(returnedCart).toBeDefined();
      expect(returnedCart!.cartID).toBe(mockGeneratedCartID);
      expect(returnedCart!.userID).toBe(fakeUserID);
      expect(returnedCart!.getItems()).toEqual(mockCartItems);
    });

    test("should return null if cart not found", async () => {
      vitest.mocked(db.query.cartTable.findFirst).mockResolvedValueOnce(null);
      const returnedCart = await repo.findCartByUserID(fakeUserID);
      expect(returnedCart).toBeNull();
    });

    test("should throw error if userID uuid not valid", async () => {
      await expect(repo.findCartByUserID("invalid user id")).rejects.toThrow();
    });
  });

  describe("add item to cart", () => {
    test("should add item to cart", async () => {
      const mockItem = new cartItem(
        mockGeneratedCartID,
        faker.string.uuid(),
        2,
        "15.99",
      );
      const returnedItem = await repo.addItemToCart(
        mockGeneratedCartID,
        mockItem,
      );

      expect(returnedItem).toBeInstanceOf(cartItem);
      expect(returnedItem.cartID).toBe(mockGeneratedCartID);
    });
    test("should throw error if cartID uuid is not valid", async () => {
      await expect(
        repo.addItemToCart("invalid cartID", mockCartItem1),
      ).rejects.toThrowError("Invalid cartID");
    });
  });

  describe("delete cart with items by cartID", () => {
    test("should delete cart by cartID", async () => {
      const returnedValue = await repo.deleteCartByID(faker.string.uuid());

      expect(returnedValue).toBeUndefined();
    });
    test("should throw error if cartID uuid is not valid", async () => {
      await expect(repo.deleteCartByID("invalid cartID")).rejects.toThrowError(
        "Invalid cartID",
      );
    });
  });

  describe("remove cartItem by id (cartItemID)", () => {
    test("should remove item from cart by id", async () => {
      const returnedValue = await repo.removeItemFromCart(faker.string.uuid());

      expect(returnedValue).toBeUndefined();
    });
    test("should throw error if cartItemID uuid is not valid", async () => {
      await expect(repo.removeItemFromCart("invalid ID")).rejects.toThrowError(
        "Invalid ID",
      );
    });
  });

  /* Edge cases
   *
   */
  describe("Edge cases", () => {
    test("should handle database errors gracefully", async () => {
      const mockDBWithError = vitest.mocked(db);

      mockDBWithError.insert.mockImplementationOnce(() => {
        throw new Error("Database connection failed");
      });

      await expect(repo.createCart()).rejects.toThrowError(
        "Database connection failed",
      );
    });
  });
});
