import { Product } from "../models/products.model";

export interface ICatalogRepository {
  create(data: Product): Promise<Product>;
  update(data: Product): Promise<Product>;
  delete(id: string): Promise<string>;
  find(limit: number, offset: number): Promise<Product[]>;
  findOne(id: string): Promise<Product>;
  searchProducts(
    query: string,
    limit: number,
    offset: number,
  ): Promise<Product[]>;
  getSuggestions(query: string, limit: number): Promise<string[]>;
}
