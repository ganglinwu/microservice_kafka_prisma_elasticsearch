import request from "supertest";
import app from "../../src/expressApp";

export const httpClient = request(app);

export const createTestProduct = async (productData: any) => {
  return await httpClient.post("/product").send(productData).expect(201);
};

export const getProductByID = async (productID: string) => {
  return await httpClient.get(`/product/${productID}`).expect(200);
};

export const updateProduct = async (productID: string, updateData: any) => {
  return await httpClient
    .patch(`/product/${productID}`)
    .send(updateData)
    .expect(200);
};
