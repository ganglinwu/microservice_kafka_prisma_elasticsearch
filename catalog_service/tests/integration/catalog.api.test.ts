import {
  httpClient,
  createTestProduct,
  getProductByID,
} from "../utils/httpClient";
import { productFactory } from "../utils/productFactory";

describe("Catalog Routes", () => {
  describe("POST /product", () => {
    test("happy: should create product successfully", async () => {
      const product1 = productFactory.build();
      const response = await httpClient.post("/product").send(product1);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(product1.title);
      expect(response.body.description).toBe(product1.description);
      expect(response.body.price).toBe(product1.price);
      expect(response.body.stock).toBe(product1.stock);
    });

    test("happy: empty string description, should create product successfully", async () => {
      const product1 = productFactory.build({ description: "" });
      const response = await httpClient.post("/product").send(product1);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(product1.title);
      expect(response.body.description).toBe("");
      expect(response.body.price).toBe(product1.price);
      expect(response.body.stock).toBe(product1.stock);
    });

    test("happy: zero price, should create product successfully", async () => {
      const product1 = productFactory.build({ price: 0 });
      const response = await httpClient.post("/product").send(product1);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(product1.title);
      expect(response.body.description).toBe(product1.description);
      expect(response.body.price).toBe(product1.price);
      expect(response.body.stock).toBe(product1.stock);
    });

    test("happy: zero stock, should create product successfully", async () => {
      const product1 = productFactory.build({ stock: 0 });
      const response = await httpClient.post("/product").send(product1);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(product1.title);
      expect(response.body.description).toBe(product1.description);
      expect(response.body.price).toBe(product1.price);
      expect(response.body.stock).toBe(0);
    });

    test("sad: should reject empty string product title", async () => {
      const product1 = productFactory.build({ title: "" });
      const response = await httpClient.post("/product").send(product1);

      expect(response.status).toBe(400);
    });

    test("sad: should reject undefined title FIELD", async () => {
      const product1 = {
        description: "",
        price: 0,
        stock: 0,
      };
      const response = await httpClient.post("/product").send(product1);

      expect(response.status).toBe(400);
    });
  });

  test("sad: should reject UNDEFINED DESCRIPTION FIELD", async () => {
    const product1 = {
      title: "fake title",
      price: 0,
      stock: 0,
    };
    const response = await httpClient.post("/product").send(product1);

    expect(response.status).toBe(400);
  });

  test("sad: should reject UNDEFINED PRICE FIELD", async () => {
    const product1 = {
      title: "fake title",
      description: "",
      stock: 0,
    };
    const response = await httpClient.post("/product").send(product1);

    expect(response.status).toBe(400);
  });

  test("sad: should reject UNDEFINED STOCK FIELD", async () => {
    const product1 = {
      title: "fake title",
      description: "",
      price: 0,
    };
    const response = await httpClient.post("/product").send(product1);

    expect(response.status).toBe(400);
  });
});
