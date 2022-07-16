import { ProductServiceInterface, ProductInterface } from './products';
import productList from './productList.json'

export class ProductService implements ProductServiceInterface {
  getAllProducts(): Promise<ProductInterface[]> {
    return Promise.resolve(productList);
  }

  getProductsById(productId: string): Promise<ProductInterface> {
    const product = productList.find(product => product.id === productId)

    if (!product) {
      throw new Error("Id does not exit");
    }

    return Promise.resolve(product)
  }
}

