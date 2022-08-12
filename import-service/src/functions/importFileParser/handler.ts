import AWS from 'aws-sdk';
import csv from 'csv-parser';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { winstonLogger } from "@utils/winstonLogger";
import { AWS_CONFIG, FOLDER } from '@utils/constants';

const { REGION } = process.env;

const createBucketReadStream = (s3, record) => {
  return s3.getObject({
    Bucket: AWS_CONFIG.BUCKET_NAME,
    Key: record.s3.object.key
  }).createReadStream();
};

const deleteCopiedFile = async (s3, record) => {
  const { key } = record.s3.object
  const params = { Bucket: AWS_CONFIG.BUCKET_NAME, Key: key };

  await s3.deleteObject(params, (err) => {
    if (err) {
      winstonLogger.logError('Error happened when tried to delete file: ', err);
    }
  }).promise();

  winstonLogger.logInfo(`Deleted file ${AWS_CONFIG.BUCKET_NAME}/${key}`);
};

const parseCsvFile = (s3, s3Stream, record) => {
  return new Promise((resolve, reject) => {
    s3Stream.pipe(csv())
        .on('data', (data) => {
        // winstonLogger.logInfo('data', data);
      }).on('end', async () => {
        winstonLogger.logInfo(`Copy from ${AWS_CONFIG.BUCKET_NAME}/${record.s3.object.key}`);

        const filePath = record.s3.object.key.replace(FOLDER.UPLOADED_FILES, FOLDER.PARSED_FILES);

        await s3.copyObject({
            Bucket: AWS_CONFIG.BUCKET_NAME,
            CopySource: `${AWS_CONFIG.BUCKET_NAME}/${record.s3.object.key}`,
            Key: filePath
        }).promise();

        winstonLogger.logInfo(`Copied into ${AWS_CONFIG.BUCKET_NAME}/${filePath}`);
        await deleteCopiedFile(s3, record);
        resolve();
      }).on('error', (e) => {
        reject(e);
      });
  });
};

const importFileParser = async (event) => {
  winstonLogger.logRequest(event);
  const s3 = new AWS.S3({ region: REGION });
  const records = event.Records.filter((record) => record.s3.object.size);

  try {
    for (const record of records) {
      winstonLogger.logInfo('importFileParser record', JSON.stringify(record));
      const s3Stream = createBucketReadStream(s3, record);
      await parseCsvFile(s3, s3Stream, record);
    }
  } catch (err) {
    winstonLogger.logError('Error happened: ', e);
  }
};

export const main = middyfy(importFileParser);
