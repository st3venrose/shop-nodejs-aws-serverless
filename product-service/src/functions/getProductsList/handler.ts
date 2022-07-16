import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { ProductService } from '@services/productService'

// import schema from './schema';

const getProductsList = async (event) => {
  const productService = new ProductService();
  const products = await productService.getAllProducts()
  
  return formatJSONResponse({
    products,
    event,
  });
};

export const main = middyfy(getProductsList);
