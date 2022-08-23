import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda'
import type { FromSchema } from 'json-schema-to-ts';

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
type ResponseHeader = { [header: string]: string | number | boolean; }

export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

const RESPONSE_HEADERS: ResponseHeader = {
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT'
};

const createResponse = (response: string, statusCode: number) => {
  return {
    statusCode: statusCode,
    headers: RESPONSE_HEADERS,
    body: response
  }
}

export const formatJSONResponse = (response: any, statusCode = 200) => {
  return createResponse(JSON.stringify(response), statusCode);
}

export const httpResponse = (response: any, statusCode = 200) => {
  return createResponse(response, statusCode);
}

export const formatErrorResponse = (message: string, statusCode = 500) => {
  const responseString = {
    message
  }
  return createResponse(JSON.stringify(responseString), statusCode);
}
