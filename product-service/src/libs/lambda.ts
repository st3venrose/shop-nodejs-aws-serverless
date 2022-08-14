import type { Handler } from 'aws-lambda'
import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
// import lambdaEventLoggerMiddleware from '@middlewares/lambdaEventLoggerMiddleware';

export const middyfy = (handler: Handler) => {
  return middy(handler).use(middyJsonBodyParser());
}
