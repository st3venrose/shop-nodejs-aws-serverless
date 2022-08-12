import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';
import { AWS_CONFIG } from '@utils/constants';

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
      BUCKET: AWS_CONFIG.BUCKET_NAME,
      REGION: '${self:provider.region}'
    },
    iam: {
      role: {
        name: 'access-to-imported-bucket-${self:provider.stage}-role',
        statements: [
          {
            Effect: "Allow",
            Action: "s3:ListBucket",
            Resource: "*"
          },
          {
            Effect: "Allow",
            Action: [
              "s3:GetObject",
              "s3:PutObject",
              "s3:DeleteObject"
            ],
            Resource: [
              "arn:aws:s3:::${self:provider.environment.BUCKET}/*"
            ]
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
      title: 'Product service',
      apiType: 'http',
      schemes: ['https', 'http'],
      basePath: '/${self:provider.stage}',
      generateSwaggerOnDeploy: false
    },
    stages: ['dev', 'prod']
  },
  resources: {
    Resources: {
      ShopNodejsImportServiceBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {
            BucketName: '${self:provider.environment.BUCKET}',
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
        }
      }
    }
};

module.exports = serverlessConfiguration;
