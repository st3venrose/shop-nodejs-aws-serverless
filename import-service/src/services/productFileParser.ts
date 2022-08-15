import csv from 'csv-parser';
import { logger } from '@services/loggerService';
import { BUCKET_FOLDERS } from '@utils/constants';
import { BucketService } from '@services/bucketService';
import { Product } from '@models/product';

const { REGION, BUCKET_NAME } = process.env;

export class ProductFileParser {
  private bucketService: BucketService;

  constructor() {
    this.bucketService = new BucketService(REGION, BUCKET_NAME);
  }

  async parseUploadedCsv(key: string): Promise<void> {
    const products = await this.getProductsFromCsv(key);
    logger.logInfo('parsed products: ', JSON.stringify(products));
  }

  private async getProductsFromCsv(key: string): Promise<Product[]> {
    const products: Product[] = [];

    return new Promise((resolve, reject) => {
      this.bucketService.createObjectReadStream(key).pipe(csv())
          .on('data', (data: Product) => {
            products.push(data);
        }).on('end', async () => {
          await this.bucketService.copyObject(key, BUCKET_FOLDERS.UPLOADED_FILES, BUCKET_FOLDERS.PARSED_FILES);
          await this.bucketService.deleteObject(key);

          logger.logInfo(`CSV is parsed and moved to the ${BUCKET_FOLDERS.PARSED_FILES} folder`);

          resolve(products);
        }).on('error', (err) => {
          logger.logError('error happend while parsing CSV: ', JSON.stringify(err));
          reject(err);
        });
    });
  };
}