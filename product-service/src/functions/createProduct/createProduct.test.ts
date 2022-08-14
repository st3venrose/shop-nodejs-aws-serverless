import { StatusCodes } from 'http-status-codes';
import { ProductService } from '@services/productService'
import { main } from './handler';

const productIdMock = {id: '1a76215f-f51c-4525-a6ce-250ab15c4fdd'};

jest.spyOn(ProductService.prototype, 'createProduct')
.mockImplementation(() => Promise.resolve(productIdMock.id));

describe('createProduct', () => {

  it('should receive created product id', async () => {
    const event = {
      body: {
        count: 7,
        description: 'Short Product Description2',
        price: 23,
        title: 'ProductTop'
      }
    };

    const response = await main(event, null);
    const parsedResponseBody = JSON.parse(response.body);

    expect(parsedResponseBody).toEqual(productIdMock);
    expect(response.statusCode).toEqual(StatusCodes.CREATED);
  });
});