import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { ProductService } from '@services/productService'
import validator from '@middy/validator'
import httpErrorHandler from '@middy/http-error-handler';

import schema from './schema';

const getProductsById = async (event) => {
  const productService = new ProductService();
  const { productId } = event.pathParameters;
  console.log(event);
  console.log('productId', productId);
  
  const products = await productService.getProductsById(productId);
  
  return formatJSONResponse({
    products
  });
};

export const main = middyfy(getProductsById)
  //.use(validator({inputSchema: schema}))
  //.use(httpErrorHandler());
