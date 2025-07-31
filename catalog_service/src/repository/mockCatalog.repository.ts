import { ICatalogRepository } from "../interface/catalogRepository.interface.js";
import { Product } from "../models/products.model.js";
import { v7 as uuidv7 } from "uuid";

export class MockCatalogRepository implements ICatalogRepository {
  private _products: Product[];
  constructor() {
    this._products = [];
  }
  create(data: Product): Promise<Product> {
    for (const product of this._products) {
      if (product.name === data.name) {
        throw new Error("Product already exists");
      }
    }
    let insertedData: Product;
    insertedData = { id: uuidv7(), ...data };
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

  delete(id: string): Promise<string> {
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
  findOne(id: string): Promise<Product> {
    for (let i = 0; i < this._products.length; i++) {
      if (this._products[i].id === id) {
        return Promise.resolve(this._products[i]);
      }
    }
    throw new Error("No product with id specified");
  }
}
