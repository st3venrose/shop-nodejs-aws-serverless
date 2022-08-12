import { SNS } from 'aws-sdk';
import { SQSHandler, SQSEvent } from 'aws-lambda';
import { winstonLogger } from '@utils/winstonLogger';
import { ProductService } from '@services/productService'
import { Product } from '@models/product';

const { REGION, SNS_CREATE_PRODUCT_TOPIC_ARN } = process.env;

const snsClient = new SNS({ region: REGION })

const sendEmailNotification = async (product: Product): Promise<void> => {
    const params = {
      Message: JSON.stringify(product),
      TopicArn: SNS_CREATE_PRODUCT_TOPIC_ARN,
    };

    winstonLogger.logInfo('SNS params: ', JSON.stringify(params));
    const data = await snsClient.publish(params).promise();
    winstonLogger.logInfo('SNS message after publish: ', JSON.stringify(data));
}

const catalogBatchProcess: SQSHandler = async (event: SQSEvent): Promise<void> => {
  try {
    winstonLogger.logRequest(event);
    const service = new ProductService();

    for (const record of event.Records) {
      const product = JSON.parse(record.body);
      const productId = await service.createProduct(product);
  
      winstonLogger.logInfo('product is created with the following id: ', productId);
  
      await sendEmailNotification(product);
    }
  } catch (err) {
    winstonLogger.logError(err);
  }
};

export const main = catalogBatchProcess;