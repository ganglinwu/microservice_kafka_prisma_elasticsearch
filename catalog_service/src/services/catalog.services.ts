import { ICatalogRepository } from "../interface/catalogRepository.interface.js";
import { Product } from "../models/products.model.js";
import swapOutBlankFields from "../utils/swapOutBlankFields.utils.js";
import { loggers } from "../utils/logger.js";

export class CatalogService {
  private _repo: ICatalogRepository;

  constructor(repo: ICatalogRepository) {
    this._repo = repo;
  }

  async createProduct(input: Product) {
    const startTime = Date.now();
    try {
      if (input.name == "") {
        throw new Error("Product name must not be blank");
      }
      
      const data = await this._repo.create(input);
      const duration = Date.now() - startTime;
      
      loggers.business('product_created', {
        productId: data.id,
        productName: data.name,
        duration,
      });
      
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      loggers.error(error as Error, {
        operation: 'createProduct',
        productName: input.name,
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
}
