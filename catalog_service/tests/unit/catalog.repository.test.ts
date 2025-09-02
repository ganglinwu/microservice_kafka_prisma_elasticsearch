import { CatalogRepository } from "../../src/repository/catalog.repository";
import { Product } from "../../src/models/products.model";
import { faker } from "@faker-js/faker";

// Mock methods under Prisma Client
const mockPrismaProduct = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
};

jest.mock("../../src/generated/prisma", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    product: mockPrismaProduct,
  })),
}));

const mockProduct = (): Product => {
  return {
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price()),
    stock: faker.number.int({ min: 1, max: 100 }),
    id: faker.string.uuid(),
  };
};

describe("CatalogRepository", () => {
  let repository: CatalogRepository;

  beforeEach(() => {
    repository = new CatalogRepository();
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("should create a product successfully", async () => {
      const productData = mockProduct();
      const expectedProduct = {
        ...productData,
        id: faker.string.uuid(),
      };

      mockPrismaProduct.create.mockResolvedValue(expectedProduct);

      const result = await repository.create(productData);

      expect(mockPrismaProduct.create).toHaveBeenCalledWith({
        data: productData,
      });
      expect(result).toEqual(expectedProduct);
    });

    test("should throw error when prisma create fails", async () => {
      const productData = mockProduct();
      const error = new Error("Database connection failed");

      mockPrismaProduct.create.mockRejectedValue(error);

      await expect(repository.create(productData)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("update", () => {
    test("should update a product successfully", async () => {
      const productData = mockProduct();
      const expectedProduct = { ...productData };

      mockPrismaProduct.update.mockResolvedValue(expectedProduct);

      const result = await repository.update(productData);

      expect(mockPrismaProduct.update).toHaveBeenCalledWith({
        where: { id: productData.id },
        data: productData,
      });
      expect(result).toEqual(expectedProduct);
    });

    test("should throw error when product not found", async () => {
      const productData = mockProduct();
      const error = new Error("Record to update not found");

      mockPrismaProduct.update.mockRejectedValue(error);

      await expect(repository.update(productData)).rejects.toThrow(
        "Record to update not found",
      );
    });
  });

  describe("delete", () => {
    test("should delete a product successfully", async () => {
      const productId = faker.string.uuid();
      const deletedProduct = mockProduct();
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      mockPrismaProduct.delete.mockResolvedValue(deletedProduct);

      const result = await repository.delete(productId);

      expect(mockPrismaProduct.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toBe(productId);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Product deleted successfully:",
        deletedProduct,
      );

      consoleSpy.mockRestore();
    });

    test("should throw error and log when delete fails", async () => {
      const productId = faker.string.uuid();
      const error = new Error("Record to delete not found");
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      mockPrismaProduct.delete.mockRejectedValue(error);

      await expect(repository.delete(productId)).rejects.toThrow(
        "Record to delete not found",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to delete product:",
        error,
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("find", () => {
    test("should find products with limit and offset", async () => {
      const limit = 10;
      const offset = 0;
      const mockProducts = [mockProduct(), mockProduct(), mockProduct()];

      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);

      const result = await repository.find(limit, offset);

      expect(mockPrismaProduct.findMany).toHaveBeenCalledWith({
        take: limit,
        skip: offset,
      });
      expect(result).toEqual(mockProducts);
    });

    test("should handle empty result", async () => {
      const limit = 10;
      const offset = 0;

      mockPrismaProduct.findMany.mockResolvedValue([]);

      const result = await repository.find(limit, offset);

      expect(result).toEqual([]);
    });

    test("should throw error when database fails", async () => {
      const limit = 10;
      const offset = 0;
      const error = new Error("Database connection failed");

      mockPrismaProduct.findMany.mockRejectedValue(error);

      await expect(repository.find(limit, offset)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("findOne", () => {
    test("should find a product by id successfully", async () => {
      const productId = faker.string.uuid();
      const expectedProduct = mockProduct();

      mockPrismaProduct.findUnique.mockResolvedValue(expectedProduct);

      const result = await repository.findOne(productId);

      expect(mockPrismaProduct.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual(expectedProduct);
    });

    test("should throw error when product not found", async () => {
      const productId = faker.string.uuid();

      mockPrismaProduct.findUnique.mockResolvedValue(null);

      await expect(repository.findOne(productId)).rejects.toThrow(
        `product with specified id ${productId} not found`,
      );
    });

    test("should handle database errors", async () => {
      const productId = faker.string.uuid();
      const error = new Error("Database connection failed");

      mockPrismaProduct.findUnique.mockRejectedValue(error);

      await expect(repository.findOne(productId)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });
});
