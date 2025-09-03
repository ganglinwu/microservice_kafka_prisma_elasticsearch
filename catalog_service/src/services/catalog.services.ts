import { ICatalogRepository } from "../interface/catalogRepository.interface";
import { Product } from "../models/products.model";
import swapOutBlankFields from "../utils/swapOutBlankFields.utils";
import { logger, loggers } from "../utils/logger";
import redis from "../utils/redis";
import CacheInvalidator from "../utils/cacheInvalidator";
import ElasticsearchClient from "../search/elasticsearch.client";

export class CatalogService {
  private _repo: ICatalogRepository;
  private _cacheInvalidator: CacheInvalidator;
  private _esClient: ElasticsearchClient;

  constructor(
    repo: ICatalogRepository,
    cacheInvalidator: CacheInvalidator,
    esClient: ElasticsearchClient,
  ) {
    this._repo = repo;
    this._cacheInvalidator = cacheInvalidator;
    this._esClient = esClient;
  }

  async createProduct(input: Product) {
    const startTime = Date.now();
    try {
      if (input.title == "") {
        throw new Error("Product title must not be blank");
      }

      const data = await this._repo.create(input);
      const duration = Date.now() - startTime;

      loggers.business("product_created", {
        productId: data.id,
        producttitle: data.title,
        duration,
      });

      // index on ES
      try {
        await this._esClient.indexProduct(data);
      } catch (error) {
        logger.info("Failed to index on Elasticsearch");
      }

      // invalidate "search_keys" set of cache keys
      await this._cacheInvalidator.invalidate("search_keys");

      // invalidate "product_list_keys" set of cache keys
      await this._cacheInvalidator.invalidate("product_list_keys");

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      loggers.error(error as Error, {
        operation: "createProduct",
        producttitle: input.title,
        duration,
      });
      throw error;
    }
  }

  async updateProduct(input: Product) {
    if (!input.id) {
      throw new Error("To update product, id is required");
    }
    const currentProduct = await this._repo.findOne(input.id);

    const productToUpdate = swapOutBlankFields(input, currentProduct);

    const data = await this._repo.update(productToUpdate);

    try {
      await this._esClient.updateProduct(input.id, input);
    } catch (error) {
      logger.info("Failed to update product on Elasticsearch");
    }

    // invalidate "search_keys" set of cache keys
    await this._cacheInvalidator.invalidate("search_keys");

    return data;
  }

  async getProducts(limit: number, offset: number) {
    //generate cache key
    const getProductListCacheKey = `product_list:${limit}:${offset}`;

    // add cache key to set

    await redis.sadd("product_list_keys", getProductListCacheKey);

    try {
      const cached = await redis.get(getProductListCacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.info(error, "Cache miss, falling back to db");
    }

    const data = await this._repo.find(limit, offset);

    try {
      await redis.setex(getProductListCacheKey, 300, JSON.stringify(data));
    } catch (error) {
      logger.error(error, "Failed to store get product list result in cache");
    }

    return data;
  }

  async getProduct(id: string) {
    // generate cache key
    const getProductCacheKey = `product:${id}`;

    // put this cache key into a set
    // because sets can't have duplicates
    // this is safe even if current key already exists
    await redis.sadd("product_keys", getProductCacheKey);

    try {
      const cached = await redis.get(getProductCacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.info(error, "Cache miss, falling back to db");
    }

    const data = await this._repo.findOne(id);

    try {
      await redis.setex(getProductCacheKey, 300, JSON.stringify(data));
    } catch (error) {
      logger.error(error, "Failed to store get product result in cache");
    }

    return data;
  }
  async deleteProduct(id: string) {
    const data = await this._repo.delete(id);

    // delete on ES
    try {
      await this._esClient.deleteProduct(id);
    } catch (error) {
      logger.error(error, "Failed to delete on Elasticsearch");
    }

    // invalidate "search_keys" set of cache keys
    await this._cacheInvalidator.invalidate("search_keys");

    // invalidate "product_keys" set of cache keys
    await this._cacheInvalidator.invalidate("product_keys");

    // invalidate "product_list_keys" set of cache keys
    await this._cacheInvalidator.invalidate("product_list_keys");

    return data;
  }

  async searchProducts(query: string, limit: number = 10, offset: number = 0) {
    // generate key
    const searchCacheKey = `search:${query}:${limit}:${offset}`;

    // put this cache key into a set
    // because sets can't contain duplicates
    // this is safe to add (even if existing cachekey exists)
    await redis.sadd("search_keys", searchCacheKey);

    // try get from cache
    try {
      const cached = await redis.get(searchCacheKey);
      // HIT!
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.info(error, "Cache miss, falling back to db/Elasticsearch");
    }

    try {
      const esResult = await this._esClient.basicSearch(query);
      if (esResult) {
        try {
          // set cache with 300 sec TTL
          await redis.setex(searchCacheKey, 300, JSON.stringify(esResult));
        } catch (error) {
          logger.error(error, "Failed to store Elasticsearch result in cache");
        }
      }
      return esResult;
    } catch (error) {
      logger.info("Elasticsearch miss, falling back to db");
    }
    // MISS
    const data = await this._repo.searchProducts(query, limit, offset);

    try {
      // set cache with 300 sec TTL
      await redis.setex(searchCacheKey, 300, JSON.stringify(data));
    } catch (error) {
      logger.error(error, "Failed to store search result in cache");
    }

    return data;
  }

  async getSuggestions(query: string, limit: number) {
    // start stopwatch
    const startTime = Date.now();

    // generate cache key
    const suggestionsCacheKey = `suggestions:${query}:${limit}`;

    // add cache key to set
    await redis.sadd("suggestions_keys", suggestionsCacheKey);

    // try to fetch from cache
    try {
      const cached = await redis.get(suggestionsCacheKey);
      // HIT!
      if (cached) {
        const duration = Date.now() - startTime;
        loggers.business("suggestions_served", {
          query,
          limit,
          cacheHit: true,
          duration,
        });
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.info(error, "Suggestion cache miss");
    }

    // MISS!
    try {
      const esResult = await this._esClient.basicSuggestionSearch(query, limit);
      if (esResult) {
        try {
          // cache suggestions with shorter TTL (60 seconds)
          await redis.setex(suggestionsCacheKey, 60, JSON.stringify(esResult));
        } catch (error) {
          logger.error(error, "Failed to store suggestions in cache");
        }
        
        const duration = Date.now() - startTime;
        loggers.business("suggestions_served", {
          query,
          limit,
          cacheHit: false,
          source: "elasticsearch",
          duration,
        });
        
        return esResult;
      }
    } catch (error) {
      // Skip logging - high volume operation, ES failures are expected
      logger.debug("Elasticsearch suggestions failed, falling back to database");
    }
    
    // Fallback to database
    const suggestions = await this._repo.getSuggestions(query, limit);

    try {
      // cache suggestions with shorter TTL (60 seconds)
      await redis.setex(suggestionsCacheKey, 60, JSON.stringify(suggestions));
    } catch (error) {
      logger.error(error, "Failed to store suggestions in cache");
    }

    const duration = Date.now() - startTime;
    loggers.business("suggestions_served", {
      query,
      limit,
      cacheHit: false,
      source: "database",
      duration,
    });

    return suggestions;
  }
}
