import AWS from 'aws-sdk';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { winstonLogger } from "@utils/winstonLogger";

const { BUCKET, REGION } = process.env;
const URL_EXPIRATION_TIME_IN_SEC = 60;

const importProductsFile = async (event) => {
  try {
    const s3 = new AWS.S3({ region: REGION });
    const fileName = event.queryStringParameters.name;
    const filePath = `uploaded/${fileName}`;

    const params = {
        Bucket: BUCKET,
        Key: filePath,
        Expires: URL_EXPIRATION_TIME_IN_SEC,
        ContentType: 'text/csv'
    };

    const url = await s3.getSignedUrlPromise('putObject', params);

    return formatJSONResponse(url);
  } catch (error) {
    return formatJSONResponse(error);
  }
};

export const main = middyfy(importProductsFile);
