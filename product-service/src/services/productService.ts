import { Product } from '@models/products';
import productList from '@models/productList.json'
import { winstonLogger } from "@utils/winstonLogger";
import { ResourceNotFound } from "@utils/resourceNotFound";
import { Client, QueryConfig } from 'pg';

export class ProductService {
  private tableName = 'product';
  private databaseClient: Client

  constructor() {
    this.databaseClient = new Client()
    this.databaseClient.connect()
  }

  async getAllProducts(): Promise<Product[]> {
    const query = {
      text: `SELECT * FROM ${this.tableName}`,
  } as QueryConfig;

  const result = await this.databaseClient.query(query);

  return result.rows ? result.rows : null;
  }

  async getProductsById(productId: string): Promise<Product> {
      const query = {
        text: `SELECT * FROM ${this.tableName} WHERE id = $1`,
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
}

