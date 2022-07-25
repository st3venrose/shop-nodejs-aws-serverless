// import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { winstonLogger } from "@utils/winstonLogger";
import { ProductService } from '@services/productService'

const getProductsList = async (event) => {
  winstonLogger.logRequest(event);

  const productService = new ProductService();
  const products = await productService.getAllProducts()

  return formatJSONResponse(products);
};

export const main = middyfy(getProductsList);
