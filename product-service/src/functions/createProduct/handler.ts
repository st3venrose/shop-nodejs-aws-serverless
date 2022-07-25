import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, formatErrorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { winstonLogger } from "@utils/winstonLogger";
import { ProductService } from '@services/productService'
import { Product } from '@models/product';
import schema from './schema';

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    winstonLogger.logRequest(event);

    const productService = new ProductService();
    const product = event.body as Partial<Product>;

    const createdProductId = await productService.createProduct(product);

    return formatJSONResponse({id: createdProductId}, StatusCodes.CREATED);
  } catch (err) {
    const { INTERNAL_SERVER_ERROR } = StatusCodes
    winstonLogger.logError(err);
    return formatErrorResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
  }
};

export const main = middyfy(createProduct);