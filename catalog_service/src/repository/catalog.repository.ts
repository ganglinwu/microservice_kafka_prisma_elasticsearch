import { PrismaClient } from "../generated/prisma";
import { ICatalogRepository } from "../interface/catalogRepository.interface";
import { Product } from "../models/products.model";

export class CatalogRepository implements ICatalogRepository {
  _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();
  }

  create(data: Product): Promise<Product> {
    return this._prisma.product.create({
      data: data,
    });
  }
  update(data: Product): Promise<Product> {
    return this._prisma.product.update({
      where: {
        id: data.id,
      },
      data: data,
    });
  }
  async delete(id: number): Promise<number> {
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
  find(limit: number, offset: number): Promise<Product[]> {
    return this._prisma.product.findMany({
      take: limit,
      skip: offset,
    });
  }
  findOne(id: number): Promise<Product> {
    const product = this._prisma.product.findUnique({
      where: {
        id: id,
      },
    });
    if (product !== null) {
      return product as Promise<Product>;
    } else {
      throw new Error(`product with specified id ${id} not found`);
    }
  }
}
