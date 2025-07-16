import { ICatalogRepository } from "../interface/catalogRepository.interface";
import { Product } from "../models/products.model";

export class MockCatalogRepository implements ICatalogRepository {
  private _products: Product[];
  private _next_id: number;

  constructor() {
    this._products = [];
    this._next_id = 1;
  }
  create(data: Product): Promise<Product> {
    for (const product of this._products) {
      if (product.name === data.name) {
        throw new Error("Product already exists");
      }
    }
    let insertedData: Product;
    insertedData = { id: this._next_id, ...data };
    this._next_id++;
    this._products.push(insertedData);
    return Promise.resolve(insertedData);
  }

  update(data: Product): Promise<Product> {
    for (let i = 0; i < this._products.length; i++) {
      if (this._products[i].id === data.id) {
        this._products.splice(i, 1);
        this._products.push(data);
        return Promise.resolve(data);
      }
    }
    throw new Error("No product with id specified");
  }

  delete(id: number): Promise<number> {
    for (let i = 0; i < this._products.length; i++) {
      if (this._products[i].id === id) {
        this._products.splice(i, 1);
        return Promise.resolve(id);
      }
    }
    throw new Error("No product with id specified");
  }

  find(limit: number, offset: number): Promise<Product[]> {
    if (limit === 0) {
      if (offset === 0) {
        return Promise.resolve(this._products);
      } else {
        if (offset > this._products.length) {
          throw new Error("Offset number out of range");
        }
        const data = this._products.slice(offset);
        return Promise.resolve(data);
      }
    } else {
      if (this._products.length < limit) {
        throw new Error("Limit number out of range");
      }
      if (offset === 0) {
        const data = this._products.slice(0, limit);
        return Promise.resolve(data);
      } else {
        const data = this._products.slice(offset, offset + limit);
        return Promise.resolve(data);
      }
    }
  }
  findOne(id: number): Promise<Product> {
    if (id <= 0) {
      throw new Error("No product with id specified");
    }
    for (let i = 0; i < this._products.length; i++) {
      if (this._products[i].id === id) {
        return Promise.resolve(this._products[i]);
      }
    }
    throw new Error("No product with id specified");
  }
}
