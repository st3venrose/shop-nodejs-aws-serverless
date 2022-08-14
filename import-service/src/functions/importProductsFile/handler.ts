import type { APIGatewayProxyResult } from 'aws-lambda';
import { httpResponse, formatErrorResponse } from '@libs/api-gateway';
import { BucketService } from '@services/bucketService';
import { logger } from '@services/loggerService';
import { BUCKET_FOLDERS } from '@utils/constants';

const { REGION, BUCKET_NAME } = process.env;

const importProductsFile = async (event): Promise<APIGatewayProxyResult> => {
  try {
    logger.logLambdaEvent(event);
    const bucketService = new BucketService(REGION, BUCKET_NAME);
    const fileName = event.queryStringParameters.name;
    const filePath = `${BUCKET_FOLDERS.UPLOADED_FILES}/${fileName}`;

    const url = await bucketService.getSignedUrl(filePath, 'text/csv');

    return httpResponse(url);
  } catch (error) {
    return formatErrorResponse(error);
  }
};

export const main = importProductsFile;
