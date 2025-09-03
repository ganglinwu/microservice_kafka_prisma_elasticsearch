import express, { Request, Response, NextFunction } from "express";
import { CatalogService } from "../services/catalog.services";
import { CatalogRepository } from "../repository/catalog.repository";
import { RequestValidator } from "../utils/requestValidator";
import {
  CreateProductRequest,
  GetProductsRequest,
  GetProductID,
  PatchProductRequest,
  DeleteProductID,
  SearchProductsRequest,
  SearchSuggestionsRequest,
} from "../dto/product.dto";
import redis from "../utils/redis";
import CacheInvalidator from "../utils/cacheInvalidator";
import { elasticsearchClient } from "../search/elasticsearch.client";

const catalogRouter = express.Router();

export const catalogService = new CatalogService(
  new CatalogRepository(),
  new CacheInvalidator(redis),
  elasticsearchClient,
);

catalogRouter.get(
  "/product/cache-health",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await redis.ping();
      res.status(200).json({
        message: "Catalog service cache is healthy",
      });
    } catch (error) {
      res.status(503).json({
        message: "Catalog service cache is down",
      });
    }
  },
),
  catalogRouter.get(
    "/product/search",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const query = String(req.query["q"] || "");
        const limit = Number(req.query["limit"]) || 10;
        const offset = Number(req.query["offset"]) || 0;

        const urlQueries = {
          q: query,
          limit: limit,
          offset: offset,
        };

        const { errors, input } = await RequestValidator(
          SearchProductsRequest,
          urlQueries,
        );

        if (errors) return res.status(400).json(errors);

        const data = await catalogService.searchProducts(query, limit, offset);

        return res.status(200).json(data);
      } catch (error) {
        const err = error as Error;
        return res.status(500).json(err.message);
      }
    },
  );

catalogRouter.get(
  "/product/suggestions",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = String(req.query["q"] || "");
      const limit = Number(req.query["limit"] || 5);

      const urlQueries = {
        q: query,
        limit: limit,
      };

      const { errors, input } = await RequestValidator(
        SearchSuggestionsRequest,
        urlQueries,
      );

      if (errors) return res.status(400).json(errors);

      const data = await catalogService.getSuggestions(query, limit);

      return res.status(200).json(data);
    } catch (error) {
      const err = error as Error;
      return res.status(500).json(err.message);
    }
  },
);

catalogRouter.post(
  "/product",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors, input } = await RequestValidator(
        CreateProductRequest,
        req.body,
      );

      if (errors) return res.status(400).json(errors);
      const data = await catalogService.createProduct(req.body);
      return res.status(201).json(data);
    } catch (error) {
      const err = error as Error;
      return res.status(500).json(err.message);
    }
  },
);

catalogRouter.get(
  "/products",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query["limit"]);
      const offset = Number(req.query["offset"]);

      const urlQueries = {
        limit: limit,
        offset: offset,
      };

      const { errors, input } = await RequestValidator(
        GetProductsRequest,
        urlQueries,
      );

      if (errors) return res.status(400).json(errors);

      const data = await catalogService.getProducts(limit, offset);

      return res.status(200).json(data);
    } catch (error) {
      const err = error as Error;
      return res.status(500).json(err.message);
    }
  },
);

catalogRouter.get(
  "/product/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params["id"] as string;

      const classWithID = {
        id: id,
      };

      const { errors, input } = await RequestValidator(
        GetProductID,
        classWithID,
      );

      if (errors) return res.status(400).json(errors);

      const data = await catalogService.getProduct(id);

      return res.status(200).json(data);
    } catch (error) {
      const err = error as Error;
      return res.status(500).json(err.message);
    }
  },
);

catalogRouter.patch(
  "/product/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productToUpdate = {
        id: req.params["id"] as string,
        ...req.body,
      };

      const { errors, input } = await RequestValidator(
        PatchProductRequest,
        productToUpdate,
      );

      if (errors) return res.status(400).json(errors);

      const data = await catalogService.updateProduct(input);

      return res.status(200).json(data);
    } catch (error) {
      const err = error as Error;
      return res.status(500).json(err.message);
    }
  },
);

catalogRouter.delete(
  "/product/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params["id"] as string;

      const classWithID = {
        id: id,
      };

      const { errors, input } = await RequestValidator(
        DeleteProductID,
        classWithID,
      );

      if (errors) return res.status(400).json(errors);

      const data = await catalogService.deleteProduct(id);

      return res.status(200).json(data);
    } catch (error) {
      const err = error as Error;
      return res.status(500).json(err.message);
    }
  },
);

export default catalogRouter;
