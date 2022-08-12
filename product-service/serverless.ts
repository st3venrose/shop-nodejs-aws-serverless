import type { AWS } from '@serverless/typescript';
import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';
import createProduct from '@functions/createProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-auto-swagger', 'serverless-esbuild', 'serverless-offline', 'serverless-stage-manager', 'serverless-dotenv-plugin'],
  useDotenv: true,
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    profile: 'node-aws',
    region: 'eu-central-1',
    stage: "${opt:stage, 'dev'}",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PGHOST: '${env:PGHOST}',
      PGUSER: '${env:PGUSER}',
      PGDATABASE: '${env:PGDATABASE}',
      PGPASSWORD: '${env:PGPASSWORD}',
      PGPORT: '${env:PGPORT}',
      SNS_CREATE_PRODUCT_TOPIC_ARN: { Ref : 'createProductTopic' }
    },
    iam: {
      role: {
        // needs for add lambda to VPC
        statements: [
          {
              Effect: 'Allow',
              Action: [
                  'logs:CreateLogGroup',
                  'logs:CreateLogStream',
                  'logs:PutLogEvents',
                  'ec2:CreateNetworkInterface',
                  'ec2:DescribeNetworkInterfaces',
                  'ec2:DeleteNetworkInterface',
                  'ec2:AssignPrivateIpAddresses',
                  'ec2:UnassignPrivateIpAddresses'
              ],
              Resource: '*'
          }, {
            Effect: 'Allow',
            Action: [
              'sns:Publish',
              'sns:Subscribe',
              'sns:CreateTopic',
              'sns:GetTopicAttributes',
              'sns:SetTopicAttributes',
              'sns:TagResource',
              'sns:UntagResource',
              'sns:ListTagsForResource',
              'sns:ListSubscriptionsByTopic'
            ],
            Resource: [
              // '${self:provider.environment.SNS_CREATE_PRODUCT_TOPIC_ARN}'
              '*'
            ]
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: { getProductsList, getProductsById, createProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      external: ['pg-native']
    },
    autoswagger: {
      title: 'Product service',
      apiType: 'http',
      schemes: ['https', 'http'],
      typefiles: ['./src/models/api-types.d.ts', './src/models/product.ts'],
      basePath: '/${self:provider.stage}',
      generateSwaggerOnDeploy: false
    },
    stages: ['dev', 'prod']
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'sqs-queue-${self:provider.stage}-catalogItemsQueue',
        }
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic'
        }
      },
      createProductTopicSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: '${env:EMAIL_ADDRESS1}',
          TopicArn: { Ref : 'createProductTopic' }
        }
      },
      createProductTopicFilteredSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: '${env:EMAIL_ADDRESS2}',
          TopicArn: { Ref : 'createProductTopic' },
          FilterPolicy: {
            price: [{ numeric: [ ">=", 1000 ] }]
          }
        }
      }
    },
    Outputs: {
      catalogItemsQueueUrl: {
        Description: 'SQS URL',
        Value: { Ref: 'catalogItemsQueue' },
        Export: {
          Name: 'catalogItemsQueueUrl-${opt:stage}'
        }
      },
      catalogItemsQueueArn: {
        Description: 'SQS Arn value',
        Value: { 'Fn::GetAtt': ['catalogItemsQueue', 'Arn'] },
        Export: {
          Name: 'catalogItemsQueueArn-${opt:stage}'
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
