import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, formatErrorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { winstonLogger } from "@utils/winstonLogger";
import { ProductService } from '@services/productService'
import { ResourceNotFound } from "@utils/exceptions";
import schema from './schema';

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    winstonLogger.logRequest(event);

    const productService = new ProductService();
    const { productId } = event.pathParameters;

    const product = await productService.getProductsById(productId);

    return formatJSONResponse(product);
  } catch (err) {
    const { NOT_FOUND, INTERNAL_SERVER_ERROR } = StatusCodes
    winstonLogger.logError(err);

    if (err instanceof ResourceNotFound) {
      return formatErrorResponse(err.message, NOT_FOUND);
    }

    return formatErrorResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
  }
};

export const main = middyfy(getProductsById);