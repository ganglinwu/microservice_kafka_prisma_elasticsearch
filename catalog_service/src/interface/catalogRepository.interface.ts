import { Product } from "../models/products.model.js";

export interface ICatalogRepository {
  create(data: Product): Promise<Product>;
  update(data: Product): Promise<Product>;
  delete(id: string): Promise<string>;
  find(limit: number, offset: number): Promise<Product[]>;
  findOne(id: string): Promise<Product>;
}
