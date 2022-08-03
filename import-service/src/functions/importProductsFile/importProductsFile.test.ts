import { main } from './handler';
import { AWS_CONFIG } from '@utils/constants';

const exceptedUrl = 'https://some-random-url?with=parameters';
const mockEvent = {
  queryStringParameters: {
    name: 'product.csv'
  }
};

const mockS3Instance = {
  getSignedUrlPromise: jest.fn().mockReturnThis(),
}

jest.mock('aws-sdk', () => {
  return { S3: jest.fn(() => mockS3Instance) }
});

describe("importProductsFile", () => {
  it('should receive created product id', async () => {
    const params = {
      Bucket: AWS_CONFIG.BUCKET_NAME,
      Key: 'uploaded/product.csv',
      Expires: 60,
      ContentType: 'text/csv'
    };

    mockS3Instance.getSignedUrlPromise.mockImplementation(()=> Promise.resolve(exceptedUrl));

    const response = await main(mockEvent, null);

    expect(mockS3Instance.getSignedUrlPromise).toHaveBeenCalledWith('putObject', params);
    // 'response contains S3 signed url string'
    expect(response.body).toEqual(exceptedUrl);
    expect(response.statusCode).toEqual(200);
  });

  it('should receive error message', async () => {
    mockS3Instance.getSignedUrlPromise.mockImplementation(()=> Promise.reject('AWS error!'));

    const response = await main(mockEvent, null);

    expect(response.body).toEqual('{"message":"AWS error!"}');
    expect(response.statusCode).toEqual(500);
  });
});