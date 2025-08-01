import { httpClient, createTestProduct } from "../utils/httpClient";
import { productFactory } from "../utils/productFactory";

describe("Catalog Routes", () => {
  describe("POST /product", () => {
    test("should create product successfully", async () => {
      const product1 = productFactory.build();
      await createTestProduct(product1);
    });
  });
});
