import { S3, AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import Stream from 'stream';
import { logger } from '@services/loggerService';

const URL_EXPIRATION_TIME_IN_SEC = 60;

export class BucketService {
  private s3: S3;
  private bucketName: string;

  constructor(region: string, bucketName: string) {
    this.s3 = new S3({ region });
    this.bucketName = bucketName;

    logger.logInfo(`BucketService is created (region: ${region}, bucketName: ${bucketName})`);
  }

  getSignedUrl(key: string, contentType: string): Promise<string> {
    const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: URL_EXPIRATION_TIME_IN_SEC,
        ContentType: contentType
    };

    return this.s3.getSignedUrlPromise('putObject', params);
  }

  copyObject(key: string, srcDir: string, destDir: string): Promise<PromiseResult<S3.CopyObjectOutput, AWSError>> {
    const filePath = key.replace(srcDir, destDir);
    logger.logInfo(`copy '${key}' object to ${filePath}`);

    return this.s3.copyObject({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${key}`,
        Key: filePath
    }).promise();
  }

  deleteObject(key: string): Promise<PromiseResult<S3.DeleteObjectOutput, AWSError>> {
    const params = { Bucket: this.bucketName, Key: key };
    return this.s3.deleteObject(params).promise();
  }

  createObjectReadStream(key: string): Stream.Readable {
    return this.s3.getObject({
      Bucket: this.bucketName,
      Key: key
    }).createReadStream();
  };
}


