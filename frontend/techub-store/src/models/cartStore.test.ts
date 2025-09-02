import { renderHook, act } from "@testing-library/react";
import { useCartStore } from "./cartStore";
import { faker } from "@faker-js/faker";
import { describe, it, expect, beforeEach } from "vitest";

const mockProduct1 = {
  id: 1,
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: 9.99,
  images: [faker.image.urlLoremFlickr(), faker.image.urlLoremFlickr()],
};

const mockProduct2 = {
  id: 2,
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: 19.99,
  images: [faker.image.urlLoremFlickr(), faker.image.urlLoremFlickr()],
};

describe("cartStore test", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("should init with empty items array", () => {
    const initState = useCartStore.getState();

    expect(initState.items).toHaveLength(0);
  });

  it("should add and remove item to/fro cart", () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
    });
    const stateAfterAdding = useCartStore.getState();

    expect(stateAfterAdding.getTotalPrice()).toBe(9.99);
    expect(stateAfterAdding.items).toHaveLength(1);
    expect(stateAfterAdding.items[0]).toEqual({
      id: 1,
      title: mockProduct1.title,
      price: 9.99,
      quantity: 1,
      image: mockProduct1.images[0],
    });

    act(() => {
      useCartStore.getState().removeItem(mockProduct1.id);
    });

    const stateAfterRemoving = useCartStore.getState();

    expect(stateAfterRemoving.getTotalItems()).toBe(0);
    expect(stateAfterRemoving.items).toHaveLength(0);
  });

  it("should add item and update quantity", () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
    });
    const stateAfterAdding = useCartStore.getState();

    expect(stateAfterAdding.getTotalPrice()).toBe(9.99);
    expect(stateAfterAdding.items).toHaveLength(1);
    expect(stateAfterAdding.items[0]).toEqual({
      id: 1,
      title: mockProduct1.title,
      price: 9.99,
      quantity: 1,
      image: mockProduct1.images[0],
    });

    act(() => {
      useCartStore.getState().updateQuantity(mockProduct1.id, 2);
    });

    const stateAfterUpdateQuantity = useCartStore.getState();

    expect(stateAfterUpdateQuantity.getTotalPrice()).toBe(19.98);
    expect(stateAfterUpdateQuantity.items).toHaveLength(1);
    expect(stateAfterUpdateQuantity.items[0]).toEqual({
      id: 1,
      title: mockProduct1.title,
      price: 9.99,
      quantity: 2,
      image: mockProduct1.images[0],
    });
  });

  it("should add 2 mock products, getTotalItems to be 2, get getTotalPrice to be 29.98 and then clear cart", () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
      useCartStore.getState().addItem(mockProduct2);
    });

    const stateAfterAdding = useCartStore.getState();

    expect(stateAfterAdding.getTotalItems()).toBe(2);
    expect(stateAfterAdding.getTotalPrice()).toBe(
      mockProduct1.price + mockProduct2.price,
    );

    act(() => {
      useCartStore.getState().clearCart();
    });

    const stateAfterClearingCart = useCartStore.getState();

    expect(stateAfterClearingCart.getTotalItems()).toBe(0);
    expect(stateAfterClearingCart.getTotalPrice()).toBe(0);
  });

  // MARK: Edge cases
  it("should increase quantity when adding same item twice", () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
      useCartStore.getState().addItem(mockProduct1);
    });

    const stateAfterAdding = useCartStore.getState();

    expect(stateAfterAdding.getTotalItems()).toBe(2);
    expect(stateAfterAdding.items).toHaveLength(1);
    expect(stateAfterAdding.items[0].quantity).toBe(2);
  });

  it("should remove item when update quantity to zero", () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
    });

    const stateAfterAdding = useCartStore.getState();

    expect(stateAfterAdding.getTotalItems()).toBe(1);
    expect(stateAfterAdding.items).toHaveLength(1);
    expect(stateAfterAdding.items[0].quantity).toBe(1);

    act(() => {
      useCartStore.getState().updateQuantity(1, 0);
    });

    const stateAfterUpdateQuantity = useCartStore.getState();

    expect(stateAfterUpdateQuantity.getTotalItems()).toBe(0);
    expect(stateAfterUpdateQuantity.items).toHaveLength(0);
  });

  it("should not throw when item to be removed is non-existent", () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
    });

    const stateAfterAdding = useCartStore.getState();

    expect(stateAfterAdding.getTotalItems()).toBe(1);
    expect(stateAfterAdding.items).toHaveLength(1);
    expect(stateAfterAdding.items[0].quantity).toBe(1);

    act(() => {
      // currently the item is cart has ID 1
      // test attempts to remove item with ID 2
      useCartStore.getState().removeItem(2);
    });

    const stateAfterRemoving = useCartStore.getState();

    expect(stateAfterRemoving.getTotalItems()).toBe(1);
    expect(stateAfterRemoving.items).toHaveLength(1);
    expect(stateAfterRemoving.items[0].quantity).toBe(1);
  });

  it("should not throw when removing items from an empty cart", () => {
    act(() => {
      useCartStore
        .getState()
        .removeItem(faker.number.int({ min: 1, max: 100 }));
    });

    const stateAfterRemoving = useCartStore.getState();

    expect(stateAfterRemoving.getTotalItems()).toBe(0);
    expect(stateAfterRemoving.items).toHaveLength(0);
  });

  it("should not add items when updating quantity of non-existent cart item", () => {
    act(() => {
      useCartStore
        .getState()
        .updateQuantity(
          faker.number.int({ min: 1, max: 100 }),
          faker.number.int({ min: 1, max: 10 }),
        );
    });

    const stateAfterUpdateQuantity = useCartStore.getState();

    expect(stateAfterUpdateQuantity.getTotalItems()).toBe(0);
    expect(stateAfterUpdateQuantity.items).toHaveLength(0);
  });
});
