import { S3Event } from 'aws-lambda';
import { middyfy } from '@libs/lambda';
import { ProductFileParser } from '@services/productFileParser';
import { logger } from '@services/loggerService';

const importFileParser = async (event: S3Event): Promise<void> => {
  try {
    logger.logLambdaEvent(event);
    const productFileParser = new ProductFileParser();
    const records = event.Records.filter((record) => record.s3.object.size);

    for (const record of records) {
      logger.logInfo('record parsing: ', JSON.stringify(record));
      await productFileParser.parseUploadedCsv(record.s3.object.key);
    }
  } catch (err) {
    logger.logError('error happened: ', err);
  }
};

export const main = middyfy(importFileParser);
