import { StatusCodes } from 'http-status-codes';
import productList from '@models/productList.json';
import { main } from './handler';

describe("getProductsById", () => {

  it('should receive product by id', async () => {
    const event = {
      pathParameters: {
        productId: '7567ec4b-b10c-48c5-9345-fc73c48a80aa'
      }
    };

    const response = await main(event, null);
    const parsedResponseBody = JSON.parse(response.body);

    expect(parsedResponseBody).toEqual(productList[0]);
  });

  it('should throw exception when productId is invalid', async () => {
    const event = {
      pathParameters: {
        productId: 'invalid-product-id'
      }
    };

    const response = await main(event, null);
    const parsedResponseBody = JSON.parse(response.body);

    expect(parsedResponseBody.message).toEqual('\tProduct not found.');
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});