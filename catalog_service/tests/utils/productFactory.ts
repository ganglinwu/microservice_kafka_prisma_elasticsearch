import { faker } from "@faker-js/faker";

export const productFactory = {
  build: (overrides: any = {}) => ({
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    stock: faker.number.int({ min: 0, max: 100 }),
    ...overrides,
  }),

  buildMany: (count: number, overrides: any = {}) => {
    return Array.from({ length: count }, () => productFactory.build(overrides));
  },
};
