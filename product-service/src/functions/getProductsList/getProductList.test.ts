import { StatusCodes } from 'http-status-codes';
import productList from '@models/productList.json';
import { main } from './handler';

describe("getProductsList", () => {

  it('should receive product list', async () => {
    const response = await main(null, null);
    const parsedResponseBody = JSON.parse(response.body);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(parsedResponseBody.products).toEqual(productList);
  });
});