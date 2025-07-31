import { PrismaClient } from "@prisma/client";
import { ICatalogRepository } from "../interface/catalogRepository.interface.js";
import { Product } from "../models/products.model.js";
import { v7 as uuidv7 } from "uuid";

export class CatalogRepository implements ICatalogRepository {
  _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();
  }

  async create(data: Product): Promise<Product> {
    return await this._prisma.product.create({
      data: {
        id: uuidv7(),
        ...data,
      },
    });
  }
  async update(data: Product): Promise<Product> {
    return await this._prisma.product.update({
      where: {
        id: data.id,
      },
      data: data,
    });
  }
  async delete(id: string): Promise<string> {
    try {
      const deletedProduct = await this._prisma.product.delete({
        where: {
          id: id,
        },
      });
      console.log("Product deleted successfully:", deletedProduct);
      return Promise.resolve(id);
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw error;
    }
  }
  async find(limit: number, offset: number): Promise<Product[]> {
    return await this._prisma.product.findMany({
      take: limit,
      skip: offset,
    });
  }
  async findOne(id: string): Promise<Product> {
    const product = await this._prisma.product.findUnique({
      where: {
        id: id,
      },
    });
    if (product !== null) {
      return product;
    } else {
      throw new Error(`product with specified id ${id} not found`);
    }
  }
}
