import request from "supertest";
import express, { response } from "express";
import { faker } from "@faker-js/faker";
import catalogRouter, { catalogService } from "../../src/api/catalog.routes";
import { Product } from "../../src/models/products.model";

// Mock the CatalogService
jest.mock("../../src/services/catalog.services");

const app = express();
app.use(express.json());

app.use("/", catalogRouter);

const mockReq = () => {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    stock: faker.number.int({ min: 1 }),
    price: Number(faker.commerce.price()),
  };
};

describe("Catalog Routes", () => {
  describe("POST /product", () => {
    test("should create product successfully", async () => {
      const reqBody = mockReq();

      // instead of mocking the catalog service
      // we spyOn the createProduct method
      jest
        .spyOn(catalogService, "createProduct")
        .mockImplementationOnce(() => Promise.resolve(reqBody as Product));

      const response = await request(app)
        .post("/product")
        .send(reqBody)
        .set("Accept", "application/json");

      expect(response.status).toBe(201);
      expect(response.body).toEqual(reqBody);
    });

    test("should respond with status 400 (bad request) when name is blank", async () => {
      const reqBody = mockReq();

      /*
 * we do not use a mock function as validating the data does not require the service or repository layer at all
      jest
        .spyOn(catalogService, "createProduct")
        .mockImplementationOnce(() =>)
*/
      const response = await request(app)
        .post("/product")
        .send({
          ...reqBody,
          name: "",
        })
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual("name should not be empty");
    });

    test("should respond with status 500 (internal server error) when something goes wrong", async () => {
      const reqBody = mockReq();

      // again we short circuit by skipping repo
      // we instruct the service layer to throw a specific error
      // later we expect our response.body to display this specific error
      jest
        .spyOn(catalogService, "createProduct")
        .mockImplementationOnce(() =>
          Promise.reject(new Error("error occured on createProduct")),
        );

      const response = await request(app)
        .post("/product")
        .send(reqBody)
        .set("Accept", "application/json");

      expect(response.status).toBe(500);
      expect(response.body).toEqual("error occured on createProduct");
    });
  });

  describe("GET /products?limit=&offset=", () => {
    test("should get all products successfully", async () => {
      const product1 = {
        id: faker.string.uuid(),
        ...mockReq(),
      } as Product;
      const product2 = {
        id: faker.string.uuid(),
        ...mockReq(),
      } as Product;
      const productList = [product1, product2];

      // we skip the round trip to the repository
      // and just get the spy mock function to return a resolved promise of an array of products
      jest
        .spyOn(catalogService, "getProducts")
        .mockImplementation(() => Promise.resolve(productList));

      const response = await request(app)
        .get("/products?limit=0&offset=0")
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(productList);
    });

    test("should respond with status 400 (bad request) when limit is less than 0", async () => {
      const response = await request(app)
        .get("/products?limit=%2D1&offset=0")
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual("limit must not be less than 0");
    });

    test("should respond with status 400 (bad request) when offset less than 0", async () => {
      const response = await request(app)
        .get("/products?limit=0&offset=%2D1")
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual("offset must not be less than 0");
    });

    test("should respond with status 500 (internal server error) when something goes wrong", async () => {
      const randomMessage = faker.lorem.sentence();

      jest
        .spyOn(catalogService, "getProducts")
        .mockImplementationOnce(() => Promise.reject(new Error(randomMessage)));

      const response = await request(app)
        .get("/products?limit=0&offset=0")
        .set("Accept", "application/json");

      expect(response.status).toBe(500);
      expect(response.body).toEqual(randomMessage);
    });
  });

  describe("GET /product/${id}", () => {
    test("should get product successfully", async () => {
      const product1 = {
        id: faker.string.uuid(),
        ...mockReq(),
      } as Product;

      jest
        .spyOn(catalogService, "getProduct")
        .mockImplementation(() => Promise.resolve(product1));

      const response = await request(app)
        .get(`/product/${product1.id}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(product1);
    });

    test("should respond with status 400 (bad request) when id is invalid", async () => {
      const badID = "invalid-uuid-format";

      const product1 = {
        id: badID,
        ...mockReq(),
      } as Product;

      const response = await request(app)
        .get(`/product/${badID}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual("id must be a UUID");
    });

    test("should respond with status 500 (internal server error) when something goes wrong", async () => {
      const randomMessage = faker.lorem.sentence();

      jest
        .spyOn(catalogService, "getProduct")
        .mockImplementationOnce(() => Promise.reject(new Error(randomMessage)));

      const response = await request(app)
        .get(`/product/${faker.string.uuid()}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(500);
      expect(response.body).toEqual(randomMessage);
    });
  });

  describe("PATCH /product/${id}", () => {
    test("should update product and response status 200(ok)", async () => {
      const reqBody = mockReq();

      const updatedProduct = {
        id: faker.string.uuid(),
        ...reqBody,
      };

      jest
        .spyOn(catalogService, "updateProduct")
        .mockImplementationOnce(() => Promise.resolve(updatedProduct));

      const response = await request(app)
        .patch(`/product/${updatedProduct.id}`)
        .send(updatedProduct)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedProduct);
    });

    test("should respond status 400 (bad req) when id is 0 or negative", async () => {
      const badID = "invalid-uuid-format";

      const reqBody = mockReq();

      const updatedProduct = {
        id: badID,
        ...reqBody,
      };

      const response = await request(app)
        .patch(`/product/${badID}`)
        .send(reqBody)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual("id must be a UUID");
    });

    test("should respond status 500 (int server error) when something goes wrong", async () => {
      const reqBody = mockReq();

      const updatedProduct = {
        id: faker.string.uuid(),
        ...reqBody,
      };

      const randomErrMessage = faker.lorem.sentence();

      jest
        .spyOn(catalogService, "updateProduct")
        .mockImplementationOnce(() =>
          Promise.reject(new Error(randomErrMessage)),
        );

      const response = await request(app)
        .patch(`/product/${updatedProduct.id}`)
        .send(updatedProduct)
        .set("Accept", "application/json");

      expect(response.status).toBe(500);
      expect(response.body).toEqual(randomErrMessage);
    });
  });

  describe("DELETE /product/${id}", () => {
    test("should delete product successfully", async () => {
      const randomValidID = faker.string.uuid();

      jest
        .spyOn(catalogService, "deleteProduct")
        .mockImplementation(() => Promise.resolve(randomValidID));

      const response = await request(app)
        .delete(`/product/${randomValidID}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(randomValidID);
    });

    test("should respond with status 400 (bad request) when id is invalid", async () => {
      const badID = "invalid-uuid-format";

      const product1 = {
        id: badID,
        ...mockReq(),
      } as Product;

      const response = await request(app)
        .delete(`/product/${badID}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual("id must be a UUID");
    });

    test("should respond with status 500 (internal server error) when something goes wrong", async () => {
      const randomMessage = faker.lorem.sentence();

      jest
        .spyOn(catalogService, "deleteProduct")
        .mockImplementationOnce(() => Promise.reject(new Error(randomMessage)));

      const response = await request(app)
        .delete(`/product/${faker.string.uuid()}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(500);
      expect(response.body).toEqual(randomMessage);
    });
  });
});
