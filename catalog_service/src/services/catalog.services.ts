import { ICatalogRepository } from "../interface/catalogRepository.interface";
import { Product } from "../models/products.model";
import swapOutBlankFields from "../utils/swapOutBlankFields.utils";
import { loggers } from "../utils/logger";

export class CatalogService {
  private _repo: ICatalogRepository;

  constructor(repo: ICatalogRepository) {
    this._repo = repo;
  }

  async createProduct(input: Product) {
    const startTime = Date.now();
    try {
      if (input.title == "") {
        throw new Error("Product title must not be blank");
      }

      const data = await this._repo.create(input);
      const duration = Date.now() - startTime;

      loggers.business("product_created", {
        productId: data.id,
        producttitle: data.title,
        duration,
      });

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      loggers.error(error as Error, {
        operation: "createProduct",
        producttitle: input.title,
        duration,
      });
      throw error;
    }
  }

  async updateProduct(input: Product) {
    if (!input.id) {
      throw new Error("To update product, id is required");
    }
    const currentProduct = await this._repo.findOne(input.id);

    const productToUpdate = swapOutBlankFields(input, currentProduct);

    const data = await this._repo.update(productToUpdate);
    return data;
  }

  async getProducts(limit: number, offset: number) {
    const data = await this._repo.find(limit, offset);
    return data;
  }

  async getProduct(id: string) {
    const data = await this._repo.findOne(id);
    return data;
  }
  async deleteProduct(id: string) {
    const data = await this._repo.delete(id);
    return data;
  }

  async searchProducts(query: string, limit: number = 10, offset: number = 0) {
    const data = await this._repo.searchProducts(query, limit, offset);
    return data;
  }
}
