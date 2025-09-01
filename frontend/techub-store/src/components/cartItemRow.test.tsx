import CartItemRow from "./cartItemRow";

import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { screen, render } from "@testing-library/react";
import { faker } from "@faker-js/faker";

const mockItem = {
  id: faker.number.int({ min: 1, max: 100 }),
  title: faker.commerce.productName(),
  quantity: faker.number.int({ min: 1, max: 10 }),
  // we will not fake the price, because we want to avoid having to call util function
  // cause if we call util function, then the test would also depend on util function to pass
  // then this is no longer like a unit test
  price: 9.99,
  image: faker.image.urlLoremFlickr(),
};
describe("cartItemRow component tests", () => {
  it("should render cartItemRow correctly", () => {
    render(
      <BrowserRouter>
        <CartItemRow item={mockItem} />
      </BrowserRouter>,
    );

    // Image
    expect(screen.getByRole("img")).toHaveAttribute("src", mockItem.image);
    expect(screen.getByRole("img")).toHaveAttribute("alt", mockItem.title);

    // Item name, price
    expect(screen.getByText(mockItem.title)).toBeInTheDocument();
    expect(screen.getByText(`Price: $${mockItem.price}`)).toBeInTheDocument();

    // Item quantity and decrease/increase quantity buttons
    expect(screen.getByText(mockItem.quantity)).toBeInTheDocument();
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Increase quantity" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Decrease quantity" }),
    ).toBeInTheDocument();

    // Remove item button (trash can icon)
    expect(
      screen.getByRole("button", { name: "Remove item" }),
    ).toBeInTheDocument();

    // subtotal
    expect(screen.getByText("Item Subtotal:")).toBeInTheDocument();
    expect(
      screen.getByText(`$${mockItem.price * mockItem.quantity}`),
    ).toBeInTheDocument();
  });
});
