import ProductGrid from "./productGrid";

import { describe, it, expect } from "vitest";
import { screen, render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { faker } from "@faker-js/faker";

const mockProducts = [
  {
    id: 1,
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: 9.99,
    images: [faker.image.urlLoremFlickr(), faker.image.urlLoremFlickr()],
  },
  {
    id: 2,
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: 19.99,
    images: [faker.image.urlLoremFlickr(), faker.image.urlLoremFlickr()],
  },
  {
    id: 3,
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: 29.99,
    images: [faker.image.urlLoremFlickr(), faker.image.urlLoremFlickr()],
  },
];

describe("ProductGrid component test", () => {
  it("should render ProductGrid correctly", () => {
    render(
      <BrowserRouter>
        <ProductGrid products={mockProducts} />
      </BrowserRouter>,
    );

    expect(screen.getByText(mockProducts[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockProducts[1].title)).toBeInTheDocument();
    expect(screen.getByText(mockProducts[2].title)).toBeInTheDocument();
  });
});
