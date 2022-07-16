import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>
type ResponseHeader = { [header: string]: string | number | boolean; }
const RESPONSE_HEADERS: ResponseHeader = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials': false, // Required for cookies, authorization headers with HTTPS
};

export const formatJSONResponse = (response: Record<string, unknown>, statusCode?: number = 200) => {
  return {
    statusCode: statusCode,
    headers: RESPONSE_HEADERS,
    body: JSON.stringify(response)
  }
}
