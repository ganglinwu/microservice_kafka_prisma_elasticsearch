import { describe, it, expect } from "vitest";
import {
  priceRounding,
  calculateTax,
  calculateTotalWithTax,
  applyDiscount,
} from "./priceUtils";
import { faker } from "@faker-js/faker";

describe("priceUtils.ts", () => {
  describe("priceRounding method", () => {
    it("should round any number to 2 decimal places and return string", () => {
      const randomFloat = faker.number.float(100);
      expect(priceRounding(randomFloat)).toBeTypeOf("string");
      expect(priceRounding(randomFloat).split(".")[1]?.length || 0).toBe(2);
    });

    it("handles specific edge cases", () => {
      expect(priceRounding(9.999)).toBe("10.00");
      expect(priceRounding(9.994)).toBe("9.99");
      expect(priceRounding(5)).toBe("5.00");
    });
  });

  describe("calculateTax method", () => {
    it("should calculate tax and round to 2 decimal places and return string", () => {
      const randomPrice = Number(faker.commerce.price());
      expect(calculateTax(randomPrice)).toBeTypeOf("string");
      expect(calculateTax(randomPrice).split(".")[1]?.length || 0).toBe(2);
    });

    it("should calculate 9% tax correctly", () => {
      expect(calculateTax(100)).toBe("9.00");
    });
  });
  describe("calculateTotalWithTax method", () => {
    it("should calculate total price inclusive of tax and round to 2 decimal places and return string", () => {
      const randomPrice = Number(faker.commerce.price());
      expect(calculateTotalWithTax(randomPrice)).toBeTypeOf("string");
      expect(
        calculateTotalWithTax(randomPrice).split(".")[1]?.length || 0,
      ).toBe(2);
    });

    it("should calculate 9% tax correctly", () => {
      expect(calculateTotalWithTax(100)).toBe("109.00");
    });
  });
  describe("applyDiscount method", () => {
    it("should apply discount and round any number to 2 decimal places and return string", () => {
      const randomPrice = Number(faker.commerce.price());
      const randomInt = faker.number.int({ min: 0, max: 100 });
      expect(applyDiscount(randomPrice, randomInt)).toBeTypeOf("string");
      expect(
        applyDiscount(randomPrice, randomInt).split(".")[1]?.length || 0,
      ).toBe(2);
    });

    it("should apply discount correctly", () => {
      expect(applyDiscount(100, 20)).toBe("80.00");
    });
  });
});
