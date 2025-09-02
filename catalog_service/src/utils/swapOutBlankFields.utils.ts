import { Product } from "../models/products.model.js";

// Product model v1
// public readonly title: string,
// public readonly description: string,
// public readonly price: number,
// public readonly stock: number,
// public readonly id?: number,

const swapOutBlankFields = (input: Product, current: Product): Product => {
  let data: Product = {
    // input.id would be non-empty
    // since we would have to use input.id
    // to search repository for current product
    id: input.id!,
    title: input.title.trim() || current.title,
    description: input.description.trim() || current.description,
    price: input.price ?? current.price,
    stock: input.stock ?? current.stock,
  };

  return data;
};

export default swapOutBlankFields;
