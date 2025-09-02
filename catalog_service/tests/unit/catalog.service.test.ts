import { ICatalogRepository } from "../../src/interface/catalogRepository.interface";
import { Product } from "../../src/models/products.model";
import { MockCatalogRepository } from "../../src/repository/mockCatalog.repository";
import { CatalogService } from "../../src/services/catalog.services";
import { faker } from "@faker-js/faker";

const mockProduct = () => {
  return {
    title: faker.commerce.productName(),
    price: Number(faker.commerce.price()),
    stock: faker.number.int(),
    description: faker.commerce.productDescription(),
  };
};

describe("catalogService", () => {
  let repo: ICatalogRepository;

  beforeEach(() => {
    repo = new MockCatalogRepository();
  });

  describe("createProduct", () => {
    test("should create product", async () => {
      const service = new CatalogService(repo);

      const reqBody = mockProduct();

      const createdProduct = await service.createProduct(reqBody);

      expect(createdProduct).toMatchObject({
        id: expect.any(String),
        title: reqBody.title,
        price: reqBody.price,
        stock: reqBody.stock,
        description: reqBody.description,
      });
    });

    test("should throw error with product already exist", async () => {
      const service = new CatalogService(repo);

      const reqBody = mockProduct();

      // first createProduct
      const response = await service.createProduct(reqBody);

      // second createProduct should trigger product already exists
      await expect(service.createProduct(reqBody)).rejects.toThrow(
        "Product already exists",
      );
    });

    test("should throw error if product has no title", async () => {
      const service = new CatalogService(repo);

      const mockProd = mockProduct();

      const mockProductWithouttitle = {
        title: "",
        price: mockProd.price,
        description: mockProd.description,
        stock: mockProd.stock,
      };
      await expect(
        service.createProduct(mockProductWithouttitle),
      ).rejects.toThrow("Product title must not be blank");
    });
  });

  describe("updateProduct", () => {
    test("should update product", async () => {
      const service = new CatalogService(repo);

      // first we populate with 2 products
      const product1 = mockProduct();
      const product2 = mockProduct();

      const insertedProduct1 = await service.createProduct(product1);
      const insertedProduct2 = await service.createProduct(product2);

      const updatedProduct2: Product = {
        id: insertedProduct2.id,
        title: "updated title",
        price: insertedProduct2.price,
        description: "updated description",
        stock: insertedProduct2.stock,
      };

      const updatedProduct = await service.updateProduct(updatedProduct2);

      expect(updatedProduct).toMatchObject({ ...updatedProduct2 });
    });

    test("should throw error if product no found", async () => {
      const service = new CatalogService(repo);

      // let's update when there's no products in the repo
      //
      // const productToUpdate = mockProduct();
      //
      // edit: can't do that because this one has no id and would trigger another error instead

      // so we insert 1 product and try to update another id
      const product1 = mockProduct();

      const insertedProduct1 = await service.createProduct(product1);

      const product1000 = {
        id: faker.string.uuid(),
        ...mockProduct(),
      };

      await expect(service.updateProduct(product1000)).rejects.toThrow(
        "No product with id specified",
      );
    });

    test("should throw error if product has no id", async () => {
      const service = new CatalogService(repo);

      //let's update when there's no products in the repo
      const productToUpdate = mockProduct();

      await expect(service.updateProduct(productToUpdate)).rejects.toThrow(
        "To update product, id is required",
      );
    });
  });

  describe("getProducts", () => {
    test("should get all products", async () => {
      const service = new CatalogService(repo);

      const product1 = mockProduct();
      const product2 = mockProduct();

      let expectedProducts: Product[] = [];

      const insertedProduct1 = await service.createProduct(product1);
      const insertedProduct2 = await service.createProduct(product2);

      expectedProducts.push(insertedProduct1, insertedProduct2);

      const fetchedProducts = await service.getProducts(0, 0);

      expect(fetchedProducts).toMatchObject(expectedProducts);
    });

    test("should get first 3 products (limit 3)", async () => {
      const service = new CatalogService(repo);

      const product1 = mockProduct();
      const product2 = mockProduct();
      const product3 = mockProduct();
      const product4 = mockProduct();

      let expectedProducts: Product[] = [];

      const insertedProduct1 = await service.createProduct(product1);
      const insertedProduct2 = await service.createProduct(product2);
      const insertedProduct3 = await service.createProduct(product3);
      const insertedProduct4 = await service.createProduct(product4);

      expectedProducts.push(
        insertedProduct1,
        insertedProduct2,
        insertedProduct3,
      );

      const fetchedProducts = await service.getProducts(3, 0);

      expect(fetchedProducts).toMatchObject(expectedProducts);
    });

    test("should get last 3 products (offset 1)", async () => {
      const service = new CatalogService(repo);

      const product1 = mockProduct();
      const product2 = mockProduct();
      const product3 = mockProduct();
      const product4 = mockProduct();

      let expectedProducts: Product[] = [];

      const insertedProduct1 = await service.createProduct(product1);
      const insertedProduct2 = await service.createProduct(product2);
      const insertedProduct3 = await service.createProduct(product3);
      const insertedProduct4 = await service.createProduct(product4);

      expectedProducts.push(
        insertedProduct2,
        insertedProduct3,
        insertedProduct4,
      );

      const fetchedProducts = await service.getProducts(0, 1);

      expect(fetchedProducts).toMatchObject(expectedProducts);
    });

    test("should get products 2, 3 (limit2, offset 1)", async () => {
      const service = new CatalogService(repo);

      const product1 = mockProduct();
      const product2 = mockProduct();
      const product3 = mockProduct();
      const product4 = mockProduct();

      let expectedProducts: Product[] = [];

      const insertedProduct1 = await service.createProduct(product1);
      const insertedProduct2 = await service.createProduct(product2);
      const insertedProduct3 = await service.createProduct(product3);
      const insertedProduct4 = await service.createProduct(product4);

      expectedProducts.push(insertedProduct2, insertedProduct3);

      const fetchedProducts = await service.getProducts(2, 1);

      expect(fetchedProducts).toMatchObject(expectedProducts);
    });

    test("should throw error if offset greater than products array length", async () => {
      const service = new CatalogService(repo);

      await expect(service.getProducts(0, 1)).rejects.toThrow(
        "Offset number out of range",
      );
    });

    test("should throw error if limit greater than products array length", async () => {
      const service = new CatalogService(repo);

      await expect(service.getProducts(1, 0)).rejects.toThrow(
        "Limit number out of range",
      );
    });
  });

  describe("getProduct", () => {
    test("should get product1", async () => {
      const service = new CatalogService(repo);

      const product1 = mockProduct();
      const product2 = mockProduct();
      const product3 = mockProduct();
      const product4 = mockProduct();

      const insertedProduct1 = await service.createProduct(product1);
      const insertedProduct2 = await service.createProduct(product2);
      const insertedProduct3 = await service.createProduct(product3);
      const insertedProduct4 = await service.createProduct(product4);

      const fetchedProduct = await service.getProduct(insertedProduct1.id!);

      expect(fetchedProduct).toMatchObject(insertedProduct1);
    });

    test("should throw error for id 0", async () => {
      const service = new CatalogService(repo);

      const product1 = mockProduct();
      const product2 = mockProduct();
      const product3 = mockProduct();
      const product4 = mockProduct();

      const insertedProduct1 = await service.createProduct(product1);
      const insertedProduct2 = await service.createProduct(product2);
      const insertedProduct3 = await service.createProduct(product3);
      const insertedProduct4 = await service.createProduct(product4);

      await expect(service.getProduct("invalid-uuid")).rejects.toThrow(
        "No product with id specified",
      );
    });
  });

  describe("deleteProduct", () => {
    test("should delete product", async () => {
      const service = new CatalogService(repo);

      const product1 = mockProduct();
      const product2 = mockProduct();
      const product3 = mockProduct();
      const product4 = mockProduct();

      const insertedProduct1 = await service.createProduct(product1);
      const insertedProduct2 = await service.createProduct(product2);
      const insertedProduct3 = await service.createProduct(product3);
      const insertedProduct4 = await service.createProduct(product4);

      const deletedID = await service.deleteProduct(insertedProduct1.id!);

      expect(deletedID).toEqual(insertedProduct1.id!);
    });

    test("should throw error if id not found", async () => {
      const service = new CatalogService(repo);

      await expect(service.deleteProduct("invalid-uuid")).rejects.toThrow(
        "No product with id specified",
      );
    });
  });

  afterEach(() => {
    repo = {} as MockCatalogRepository;
  });
});
