import { S3, SQS } from 'aws-sdk';
import { S3Event } from 'aws-lambda';
import csv from 'csv-parser';
import { middyfy } from '@libs/lambda';
import { winstonLogger } from '@utils/winstonLogger';
import { FOLDER } from '@utils/constants';

const { REGION, BUCKET_NAME, CATALOG_QUEUE_URL } = process.env;

const sqsInstance = new SQS({ apiVersion: '2012-11-05' });

const sendSqsMessage = (product) => {
  console.log('SEND MESSAGE');
  const params = {
    MessageBody: product,
    QueueUrl: CATALOG_QUEUE_URL,
  };
  console.log('params', params);

  sqsInstance.sendMessage(params, (err,result) => {
    if (err) {
      console.log(err)
      return;
    }
    console.log('SQS result: ', result)
  })
};

const createBucketReadStream = (s3, record) => {
  return s3.getObject({
    Bucket: BUCKET_NAME,
    Key: record.s3.object.key
  }).createReadStream();
};

const deleteUploadedFile = (s3, record) => {
  const { key } = record.s3.object
  const params = { Bucket: BUCKET_NAME, Key: key };

  return s3.deleteObject(params, (err) => {
    if (err) {
      winstonLogger.logError('Error happened when tried to delete file: ' + err);
    } else {
      winstonLogger.logInfo(`Deleted file ${BUCKET_NAME}/${key}`);
    }
  }).promise();
};

const copyParsedFileToParsedFolder = (s3, record) => {
  winstonLogger.logInfo(`Copy from ${BUCKET_NAME}/${record.s3.object.key}`);

  const filePath = record.s3.object.key.replace(FOLDER.UPLOADED_FILES, FOLDER.PARSED_FILES);
  const params = {
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/${record.s3.object.key}`,
    Key: filePath
  }

  return s3.copyObject(params, (err) => {
    if (err) {
      winstonLogger.logError('Error happened when tried to copy file: ' + err);
    } else {
      winstonLogger.logInfo(`Copied into ${BUCKET_NAME}/${filePath}`);
    }
  }).promise();
};

const parseCsvData = async (s3Stream): Promise<void> => {
  return new Promise((resolve, reject) => {
    s3Stream
      .pipe(csv())
          .on('data', (data) => {
            winstonLogger.logInfo(JSON.stringify(data));
            sendSqsMessage(JSON.stringify(data));
        }).on('end', () => {
          resolve();
        }).on('error', (err) => {
          winstonLogger.logError('Parsing csv error: ' + err);
          reject(err);
        });
    });
};

const importFileParser = async (event: S3Event): Promise<void> => {
  winstonLogger.logRequest(event);

  const s3 = new S3({ region: REGION });
  const records = event.Records.filter((record) => record.s3.object.size);
  winstonLogger.logInfo('Filtered records: ' + JSON.stringify(records));

  try {
    for (const record of records) {
      const s3Stream = createBucketReadStream(s3, record);
      await parseCsvData(s3Stream);
      await copyParsedFileToParsedFolder(s3, record);
      await deleteUploadedFile(s3, record);
    }
  } catch (err) {
    winstonLogger.logError('Error happened: ' + err);
  }
};

export const main = middyfy(importFileParser);
