import { StatusCodes } from 'http-status-codes';
import productList from '@models/productList.json';
import { ProductService } from '@services/productService'
import { main } from './handler';

jest.spyOn(ProductService.prototype, 'getAllProducts')
  .mockImplementation(() => Promise.resolve(productList));

describe('getProductsList', () => {
  it('should receive product list', async () => {
    const response = await main(null, null);
    const parsedResponseBody = JSON.parse(response.body);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(parsedResponseBody).toEqual(productList);
  });
});