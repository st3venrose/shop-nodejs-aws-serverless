import type { AWS } from '@serverless/typescript';
import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';

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
    stage: 'dev',
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
  },
  // import the function via paths
  functions: { getProductsList, getProductsById },
  package: { individually: true },
  custom: {
    currentStage: '${opt:stage, self:provider.stage}',
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
      schemes: ['https'],
      typefiles: ["./src/models/products.ts"],
      useStage: true,
      basePath: '/${self:custom.currentStage}',
    },
    stages: ['dev', 'prod']
  },
};

module.exports = serverlessConfiguration;
