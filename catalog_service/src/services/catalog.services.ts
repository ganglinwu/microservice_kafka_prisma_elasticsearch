import { ICatalogRepository } from "../interface/catalogRepository.interface";

export class CatalogService {
  private _repo: ICatalogRepository;

  constructor(repo: ICatalogRepository) {
    this._repo = repo;
  }

  createProduct(input: any) {}

  updateProduct(input: any) {}

  getProducts(limit: number, offset: number) {}

  getProduct(id: number) {}
  deleteProduct(id: number) {}
}
