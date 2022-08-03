// import { middyfy } from '@libs/lambda';
import { winstonLogger } from "@utils/winstonLogger";
import { ProductService } from '@services/productService'
// import { Product } from '@models/product';

const catalogBatchProcess = async (event): Promise<void> => {
  try {
    winstonLogger.logRequest(event);
    console.log('Records ', event.body);

    const service = new ProductService();
    console.log(JSON.parse(event.body));
    await service.createProduct(JSON.parse(event.body));

  } catch (err) {
    winstonLogger.logError(err);
  }
};

export const main = catalogBatchProcess;