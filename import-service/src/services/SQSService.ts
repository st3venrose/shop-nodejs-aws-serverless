import { SQS } from 'aws-sdk';
import { logger } from '@services/loggerService';
import { Product } from '@models/product';

const { CATALOG_QUEUE_URL } = process.env;

export class SQSService {
  private sqs: SQS;

  constructor() {
    this.sqs = new SQS({ apiVersion: '2012-11-05' });
  }

  async sendSqsMessage(products: Product[]): Promise<void> {
    logger.logInfo('Sending product by SQS');
    try {
      for (const product of products) {
        const params = {
          MessageBody: JSON.stringify(product),
          QueueUrl: CATALOG_QUEUE_URL,
        };
        logger.logInfo('SQS params: ', JSON.stringify(params));

        await this.sqs.sendMessage(params).promise();
      }
    } catch (err) {
      logger.logError('SQS error: ', JSON.stringify(err));
    }
  }
}
