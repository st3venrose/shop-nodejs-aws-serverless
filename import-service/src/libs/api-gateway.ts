import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
type ResponseHeader = { [header: string]: string | number | boolean; }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>;

export interface ResponseModel {
  statusCode: number,
  headers: ResponseHeader,
  body: string
};

const RESPONSE_HEADERS: ResponseHeader = {
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials': false, // Required for cookies, authorization headers with HTTPS
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT'
};


const createResponse = (response: string, statusCode: number): ResponseModel => {
  return {
    statusCode: statusCode,
    headers: RESPONSE_HEADERS,
    body: response
  }
}

export const formatResponse = (response: any, statusCode: number = 200): ResponseModel => {
  return createResponse(response, statusCode);
}

export const formatErrorResponse = (message: string, statusCode: number = 500): ResponseModel => {
  const responseString = {
    message
  }
  return createResponse(JSON.stringify(responseString), statusCode);
}
