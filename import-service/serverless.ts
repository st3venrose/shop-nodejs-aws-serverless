import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-auto-swagger', 'serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    profile: 'node-aws',
    region: 'eu-central-1',
    stage: '${opt:stage}',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      SERVICE_PREFIX: '${self:service}',
      BUCKET_NAME: '${self:provider.environment.SERVICE_PREFIX}-product-bucket-${self:provider.stage}',
      REGION: '${self:provider.region}',
      CATALOG_QUEUE_URL: {
        'Fn::ImportValue': 'catalogItemsQueueUrl-${opt:stage}',
      },
      CATALOG_QUEUE_ARN: {
        'Fn::ImportValue': 'catalogItemsQueueArn-${opt:stage}',
      },
    },
    iam: {
      role: {
        name: '${self:provider.environment.SERVICE_PREFIX}-product-bucket-${self:provider.stage}-role',
        statements: [
          {
            Effect: 'Allow',
            Action: 's3:ListBucket',
            Resource: '*'
          },
          {
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject'
            ],
            Resource: [
              'arn:aws:s3:::${self:provider.environment.BUCKET_NAME}/*'
            ]
          },
          {
            Effect: 'Allow',
            Action: [
              'sqs:SendMessage',
              'sqs:ReceiveMessage',
            ],
            Resource: {
                'Fn::ImportValue': 'catalogItemsQueueArn-${opt:stage}',
              },
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
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
    },
    autoswagger: {
      title: 'Import service',
      apiType: 'http',
      schemes: ['https', 'http'],
      basePath: '/${self:provider.stage}',
      generateSwaggerOnDeploy: false
    },
    stages: ['dev', 'prod']
  },
  resources: {
    Resources: {
      ImportServiceProductBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {
            BucketName: '${self:provider.environment.BUCKET_NAME}',
            CorsConfiguration: {
              CorsRules: [
                {
                  AllowedMethods: [
                    'GET',
                    'HEAD',
                    'PUT',
                    'POST'
                  ],
                  AllowedOrigins: [
                    '*'
                  ],
                  AllowedHeaders: [
                    '*'
                  ],
                }
              ]
            }
          }
        },
        GatewayResponse4XX: {
          Type: "AWS::ApiGateway::GatewayResponse",
          Properties: {
            ResponseParameters: {
              'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
              'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
              // 'gatewayresponse.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              'gatewayresponse.header.WWW-Authenticate': "'Basic'"
            },
            ResponseType: "MISSING_AUTHENTICATION_TOKEN",
            RestApiId: {
              Ref: "ApiGatewayRestApi"
            },
            // StatusCode: "401"
          }
        },
        GatewayResponseDefault5XX: {
            Type: 'AWS::ApiGateway::GatewayResponse',
            Properties: {
              ResponseParameters:{
                'gatewayresponse.header.Access-Control-Allow-Origin': 'method.request.header.Origin',
                'gatewayresponse.header.Access-Control-Allow-Credentials': "'true'",
                'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
              },
               ResponseType: 'DEFAULT_5XX',
               RestApiId: {
                Ref: 'ApiGatewayRestApi'
              }
            }
          }
        }
      }
};

module.exports = serverlessConfiguration;
