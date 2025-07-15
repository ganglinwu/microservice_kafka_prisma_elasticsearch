import { ICatalogRepository } from "../interface/catalogRepository.interface";
import { Product } from "../models/products.model";

export class CatalogService {
  private _repo: ICatalogRepository;

  constructor(repo: ICatalogRepository) {
    this._repo = repo;
  }

  async createProduct(input: Product) {
    if (input.name == "") {
      throw new Error("Product name must not be blank");
    }
    const data = await this._repo.create(input);
    return data;
  }

  async updateProduct(input: Product) {
    if (!input.id) {
      throw new Error("To update product, id is required");
    }
    // TODO: replace empty name field with current product fields
    // todo after getProduct is implemented

    const data = await this._repo.update(input);
    return data;
  }

  async getProducts(limit: number, offset: number) {
    const data = await this._repo.find(limit, offset);
    return data;
  }

  async getProduct(id: number) {
    const data = await this._repo.findOne(id);
    return data;
  }
  async deleteProduct(id: number) {
    const data = await this._repo.delete(id);
    return data;
  }
}
