import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';

const { BASIC_AUTH_USERNAME: USERNAME, PASSWORD } = process.env;

enum Effect {
  Allow = 'Allow',
  Deny = 'Deny'
}

const generatePolicyDocument = (principalId: string, effect: Effect, resource: string): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    }
  }
};

const basicAuthorizer = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  console.log('event: ', event);

  const { authorizationToken, methodArn } = event;

  const encodedCreds = authorizationToken.split(' ').pop();
  const plainCredentails = (Buffer.from(encodedCreds, 'base64')).toString('utf-8').split(':');
  const [ username, password ] = plainCredentails;
  const accessAlowed = USERNAME === username && PASSWORD === password;

  console.log('access alowed: ', accessAlowed);
  console.log('policy: ', JSON.stringify(generatePolicyDocument(username, accessAlowed ? Effect.Allow : Effect.Deny, methodArn)))

  return generatePolicyDocument(username, accessAlowed ? Effect.Allow : Effect.Deny, methodArn);
};

export const main = basicAuthorizer;
