import { main } from './handler';

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

describe('importProductsFile', () => {
  it('should receive created product id', async () => {
    const params = {
      Bucket: undefined,
      Key: 'uploaded/product.csv',
      Expires: 60,
      ContentType: 'text/csv'
    };
    const exceptedUrl = 'https://some-random-url?with=parameters';

    mockS3Instance.getSignedUrlPromise.mockImplementation(()=> Promise.resolve(exceptedUrl));

    const response = await main(mockEvent);

    expect(mockS3Instance.getSignedUrlPromise).toHaveBeenCalledWith('putObject', params);
    expect(response.body).toEqual(exceptedUrl);
    expect(response.statusCode).toEqual(200);
  });

  it('should receive error message', async () => {
    mockS3Instance.getSignedUrlPromise.mockImplementation(()=> Promise.reject('AWS error!'));

    const response = await main(mockEvent);

    expect(response.body).toEqual('{"message":"AWS error!"}');
    expect(response.statusCode).toEqual(500);
  });
});