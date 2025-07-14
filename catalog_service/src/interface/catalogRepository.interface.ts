import { Product } from "../models/products.model";

export interface ICatalogRepository {
  create(data: Product): Promise<Product>;
  update(data: Product): Promise<Product>;
  delete(id: number): void;
  find(): Promise<Product[]>;
  findOne(id: number): Promise<Product>;
}
