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
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: { getProductsList, getProductsById, createProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    currentStage: '${opt:stage, self:provider.stage}', // TODO
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
          // FifoQueue: true
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
// ${self:custom.stage}

module.exports = serverlessConfiguration;
