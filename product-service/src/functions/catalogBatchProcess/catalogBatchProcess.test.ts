import { ProductService } from '@services/productService'
import { main } from './handler';
import { SQSEvent } from 'aws-lambda';

const productIdMock = '1a76215f-f51c-4525-a6ce-250ab15c4fdd'
const createProductSpy = jest.spyOn(ProductService.prototype, 'createProduct')
  .mockImplementation(() => Promise.resolve(productIdMock));

const publishMock = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
jest.mock('aws-sdk', () => {
  return {
    SNS: jest.fn().mockImplementation(() => {
        return { publish: params => publishMock(params) };
      })
    }
});

const productMock = {
  count: 7,
  description: 'Short Product Description2',
  price: 23,
  title: 'ProductTop'
}

const eventMock = {
  Records: [{
    body: JSON.stringify(productMock)
  }]
} as SQSEvent;

describe('createProduct', () => {
  it('should call createProduct with product object', async () => {
    await main(eventMock, null, null);

    expect(createProductSpy).toHaveBeenCalledWith(productMock);
  });

  it('should SNS called with product string', async () => {
    const paramsMock = {
      Message: JSON.stringify(productMock),
      TopicArn: undefined,
    };

    await main(eventMock, null, null);

    expect(publishMock).toHaveBeenCalledWith(paramsMock);
  });
});