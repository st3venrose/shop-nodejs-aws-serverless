import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { formatJSONResponse, formatErrorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { winstonLogger } from "@utils/winstonLogger";
import { ProductService } from '@services/productService'

const getProductsList = async (event) => {
  try {
    winstonLogger.logRequest(event);

    const productService = new ProductService();
    const products = await productService.getAllProducts()
  
    return formatJSONResponse(products);
  } catch (err) {
    const { NOT_FOUND, INTERNAL_SERVER_ERROR } = StatusCodes
    winstonLogger.logError(err);
    return formatErrorResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
  }

};

export const main = middyfy(getProductsList);
