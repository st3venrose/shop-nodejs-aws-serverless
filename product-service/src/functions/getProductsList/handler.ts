import type { APIGatewayProxyResult } from 'aws-lambda'
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { formatJSONResponse, formatErrorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { logger } from '@services/loggerService';
import { ProductService } from '@services/productService'

const getProductsList = async (): Promise<APIGatewayProxyResult> => {
  try {
    const productService = new ProductService();
    const products = await productService.getAllProducts()
  
    return formatJSONResponse(products);
  } catch (err) {
    logger.logError(err);
    return formatErrorResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
  }

};

export const main = middyfy(getProductsList);
