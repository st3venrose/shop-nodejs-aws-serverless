import { Client, QueryConfig } from 'pg';
import { Product, Stock } from '@models/product';
import { DatabaseConnection } from '@services/databaseClient';
import { logger } from '@services/loggerService';
import { ResourceNotFound } from '@utils/exceptions';

export class ProductService {
  private databaseClient: Client
  private productTableName = 'product';
  private stockTableName = 'stock';

  constructor() {
    const databaseConnection = new DatabaseConnection();
    this.databaseClient = databaseConnection.getDatabaseClient();
  }

  async getAllProducts(): Promise<Product[]> {
    const query = {
      text: `SELECT * FROM ${this.productTableName} p LEFT JOIN stock s ON p.id = s.product_id`
  } as QueryConfig;

  const result = await this.databaseClient.query(query);

  return result.rows ? result.rows : null;
  }

  async getProductsById(productId: string): Promise<Product> {

    const query = {
      text: `SELECT * FROM ${this.productTableName} p LEFT JOIN stock s ON p.id = s.product_id WHERE p.id = $1`,
      values: [productId]
    } as QueryConfig;
    const result = await this.databaseClient.query(query);
    const product = result.rows[0];

    if (!product) {
      throw new ResourceNotFound('Product not found.');
    }

    logger.logInfo(`Product id: ${product.id}`);
    return product;
  }

  async createProduct(product: Partial<Product>): Promise<string> {
      try {
        await this.databaseClient.query('BEGIN');

        const productQuery = {
          text: `INSERT INTO ${this.productTableName}(title, description, price) VALUES ($1, $2, $3) RETURNING id`,
          values: [product.title, product.description, product.price]
        } as QueryConfig;

        const createdProduct = await this.databaseClient.query<Product>(productQuery);

        const stockQuery = {
          text: `INSERT INTO ${this.stockTableName}(product_id, count) VALUES ($1, $2)`,
          values: [createdProduct.rows[0].id, product.count]
        } as QueryConfig;

        await this.databaseClient.query<Stock>(stockQuery);
        await this.databaseClient.query('COMMIT');

        return createdProduct.rows[0].id;
      } catch (err) {
        await this.databaseClient.query('ROLLBACK');
        throw err;
      }
  }
}

