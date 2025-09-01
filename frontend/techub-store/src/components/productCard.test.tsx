import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProductCard from "./productCard";
import { faker } from "@faker-js/faker";

const mockProduct = {
  id: faker.number.int({ min: 1, max: 100 }),
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  // we will not fake the price, because we want to avoid having to call util function
  // cause if we call util function, then the test would also depend on util function to pass
  // then this is no longer like a unit test
  price: 9.99,
  images: [faker.image.urlLoremFlickr(), faker.image.urlLoremFlickr()],
};

describe("productCard tests", () => {
  it("renders product information correctly", () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>,
      {},
    );

    // you might find it strange that we are searching the screen by Text for something
    // only to expect it to be in the docuement
    //
    // the thing is that if we only do screen searching, it will throw a generic error
    // whereas the expect makes it clear where you have failed the test.
    //
    // modern component tests often compact the 2 lines into one and reduce the need for declaring a variable
    // expect(screen.getByText("foobar")).toBeInTheDocument()
    //
    const renderedTitle = screen.getByText(mockProduct.title);
    const renderedPrice = screen.getByText(`$${String(mockProduct.price)}`);
    const renderedDesc = screen.getByText(mockProduct.description);
    const renderedImage = screen.getByRole("img");
    const imageURLUsed = mockProduct.images[0];
    expect(renderedTitle).toBeInTheDocument();
    expect(renderedPrice).toBeInTheDocument();
    expect(renderedDesc).toBeInTheDocument();
    expect(renderedImage).toHaveAttribute("src", imageURLUsed);
    // aria
    expect(renderedImage).toHaveAttribute("alt", mockProduct.title);
  });
});
