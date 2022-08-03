import { S3 } from 'aws-sdk';
import { formatResponse, formatErrorResponse, ResponseModel } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { winstonLogger } from "@utils/winstonLogger";
// import { AWS_CONFIG } from '@utils/constants';

const { REGION, BUCKET_NAME } = process.env;
const URL_EXPIRATION_TIME_IN_SEC = 60;

const importProductsFile = async (event): Promise<ResponseModel> => {
  winstonLogger.logInfo(event);

  try {
    const s3 = new S3({ region: REGION });
    const fileName = event.queryStringParameters.name;
    const filePath = `uploaded/${fileName}`;

    const params = {
        Bucket: BUCKET_NAME,
        Key: filePath,
        Expires: URL_EXPIRATION_TIME_IN_SEC,
        ContentType: 'text/csv'
    };

    const url = await s3.getSignedUrlPromise('putObject', params);

    return formatResponse(url);
  } catch (error) {
    return formatErrorResponse(error);
  }
};

export const main = middyfy(importProductsFile);
