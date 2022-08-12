import { handlerPath } from '@libs/handler-resolver';
// import schema from './schema';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        arn: {
          "Fn::GetAtt": ["catalogItemsQueue", "Arn"]
          },
        batchSize: 5,
        maximumBatchingWindow: 60,
        // functionResponseType: "ReportBatchItemFailures"
      }
    }
  ]
};