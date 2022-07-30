import { Client, QueryConfig } from 'pg';
import { Product } from '@models/product';
import { DatabaseConnection } from '@services/databaseClient';
import { winstonLogger } from "@utils/winstonLogger";
import { ResourceNotFound } from "@utils/exceptions";

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
        values: [productId],
    } as QueryConfig;
    const result = await this.databaseClient.query(query);
    const product = result.rows[0];

    if (!product) {
      throw new ResourceNotFound("Product not found.");
    }

    winstonLogger.logInfo(`Product id: ${product.id}`);
    return product;
  }

  async createProduct(product: Partial<Product>): Promise<string> {
      try {
        await this.databaseClient.query('BEGIN');

        const productInsert = `INSERT INTO ${this.productTableName}(title, description, price) VALUES ($1, $2, $3) RETURNING id`;
        const productInsertValues = [product.title, product.description, product.price];
        const stockInsert = `INSERT INTO ${this.stockTableName}(product_id, count) VALUES ($1, $2)`;

        const createdProduct = await this.databaseClient.query(productInsert, productInsertValues);
        const stockInsertValues = [createdProduct.rows[0].id, product.count];

        await this.databaseClient.query(stockInsert, stockInsertValues);
        await this.databaseClient.query('COMMIT');

        return createdProduct.rows[0].id;
      } catch (e) {
        await this.databaseClient.query('ROLLBACK');
        throw e;
      }
  }
}

