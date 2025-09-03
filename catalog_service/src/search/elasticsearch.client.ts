import { Client } from "@elastic/elasticsearch";
import { logger } from "../utils/logger";
import { CatalogRepository } from "../repository/catalog.repository";
import { Product } from "../models/products.model";

export class ElasticsearchClient {
  private static instance: ElasticsearchClient;
  private client: Client;
  private readonly indexName = "products";

  private constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
    });
  }

  static getInstance(): ElasticsearchClient {
    if (!ElasticsearchClient.instance) {
      ElasticsearchClient.instance = new ElasticsearchClient();
    }
    return ElasticsearchClient.instance;
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.ping();
      logger.info("Connected to Elasticsearch");
      return true;
    } catch (error) {
      logger.error(error, "Failed to connect to Elasticsearch");
      return false;
    }
  }

  getClient(): Client {
    return this.client;
  }

  getIndexName(): string {
    return this.indexName;
  }

  async createIndex(): Promise<void> {
    try {
      const indexExists = await this.client.indices.exists({
        index: this.indexName,
      });

      if (!indexExists) {
        await this.client.indices.create({
          index: this.indexName,
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                product_analyzer: {
                  type: "custom",
                  tokenizer: "standard",
                  filter: ["lowercase", "stop"],
                },
              },
            },
          },
          mappings: {
            properties: {
              id: {
                type: "keyword", // Exact match for IDs
              },
              title: {
                type: "text",
                analyzer: "product_analyzer",
                fields: {
                  keyword: {
                    type: "keyword", // For exact matching and sorting
                  },
                },
              },
              description: {
                type: "text",
                analyzer: "product_analyzer",
              },
              price: {
                type: "float",
              },
              stock: {
                type: "integer",
              },
            },
          },
        });
        logger.info(`Created Elasticsearch index: ${this.indexName}`);
      } else {
        logger.info(`Index ${this.indexName} already exists`);
      }
    } catch (error) {
      logger.error("Failed to create Elasticsearch index:", error);
      throw error;
    }
  }

  // Add a single product to the index
  async indexProduct(product: any): Promise<void> {
    try {
      await this.client.index({
        index: this.indexName,
        id: product.id,
        document: product,
      });
      logger.info(`Product ${product.id} indexed successfully`);
    } catch (error) {
      logger.error("Failed to index product:", error);
      throw error;
    }
  }

  // Update a product in the index
  async updateProduct(productId: string, product: any): Promise<void> {
    try {
      await this.client.update({
        index: this.indexName,
        id: productId,
        doc: product,
      });
      logger.info(`Product ${productId} updated successfully`);
    } catch (error) {
      logger.error("Failed to update product:", error);
      throw error;
    }
  }

  // Delete a product from the index
  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.client.delete({
        index: this.indexName,
        id: productId,
      });
      logger.info(`Product ${productId} deleted successfully`);
    } catch (error: any) {
      // If product doesn't exist, that's OK
      if (error?.meta?.statusCode !== 404) {
        logger.error("Failed to delete product:", error);
        throw error;
      }
    }
  }

  async basicSearch(query: string): Promise<any> {
    const result = await this.client.search({
      index: this.indexName,
      query: {
        multi_match: {
          query: query,
          fields: ["title", "description"],
        },
      },
    });

    return result.hits.hits.map((hit: any) => hit._source);
  }

  async bulkIndexProducts(products: Product[]): Promise<void> {
    if (products.length === 0) return;

    const body = products.flatMap((product) => [
      { index: { _index: this.indexName, _id: product.id } },
      product,
    ]);
    try {
      await this.client.bulk({ body });
      logger.info(`Bulk indexed ${products.length} products`);
    } catch (error) {
      logger.error(error, "Failed to build index products into Elasticsearch");
      throw error;
    }
  }

  async basicSuggestionSearch(
    query: string,
    limit: number = 5,
  ): Promise<string[]> {
    try {
      const results = await this.client.search({
        index: this.indexName,
        query: {
          multi_match: {
            query: query,
            fields: ["title^2", "description"],
            type: "bool_prefix",
          },
        },
        _source: ["title"],
        size: limit,
      });
      const titles = results.hits.hits.map((hit: any) => hit._source.title);
      return titles;
    } catch (error) {
      logger.error(error, "Elasticsearch suggestion search failed");
      throw error;
    }
  }

  async initializeElasticsearch() {
    try {
      const connected = await this.client.ping();
      if (connected) {
        await this.createIndex();

        const count = await this.getClient().count({
          index: "products",
        });

        if (count.count === 0) {
          logger.info("Elasticsearch index is empty, performing bulk sync");
          const repo = new CatalogRepository();
          const existingProducts = await repo.find(1000, 0);
          if (existingProducts.length > 0) {
            await this.bulkIndexProducts(existingProducts);
            logger.info(
              `Intial sync: ${existingProducts.length} products indexed`,
            );
          }
        } else {
          logger.info(
            `Elasticsearch already has ${count.count} products, skipping bulk sync`,
          );
        }
      }
    } catch (error) {
      logger.warn(error, "Elasticsearch init failed");
    }
  }
}

// Export the singleton instance for easy access
export default ElasticsearchClient;
export const elasticsearchClient = ElasticsearchClient.getInstance();
