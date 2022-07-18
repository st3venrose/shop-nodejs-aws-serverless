import { Product } from '@models/products';
import productList from '@models/productList.json'
import { winstonLogger } from "@utils/winstonLogger";
import { ResourceNotFound } from "@utils/resourceNotFound";

export class ProductService {
  getAllProducts(): Promise<Product[]> {
    return Promise.resolve(productList);
  }

  getProductsById(productId: string): Promise<Product> {
    const product = productList.find(product => product.id === productId);

    if (!product) {
      throw new ResourceNotFound("Product not found.");
    }

    winstonLogger.logInfo(`Product id: ${product.id}`);
    return Promise.resolve(product)
  }
}

