import { Product } from "../models/products.model";

export interface ICatalogRepository {
  create(data: Product): Promise<Product>;
  update(data: Product): Promise<Product>;
  delete(id: number): Promise<number>;
  find(limit: number, offset: number): Promise<Product[]>;
  findOne(id: number): Promise<Product>;
}
