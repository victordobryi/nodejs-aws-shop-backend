import { APIGatewayTokenAuthorizerEvent, Handler } from 'aws-lambda';

export const handler: Handler<APIGatewayTokenAuthorizerEvent> = async (event, _, callback) => {
  const token = event.authorizationToken;

  if (!token) {
    return callback(null, generatePolicy('user', 'Deny', event.methodArn));
  }

  console.log(`token: ${token}`);

  const encodedCreds = token.split(' ')[1];
  const buff = Buffer.from(encodedCreds, 'base64').toString('utf-8');
  const [username, password] = buff.split(':');

  console.log(`username: ${username}, password: ${password}`);

  const storedPassword = process.env[username];

  console.log(`storedPassword: ${storedPassword}`);

  if (storedPassword && storedPassword == password) {
    return callback(null, generatePolicy('user', 'Allow', event.methodArn));
  }

  return callback(null, generatePolicy('user', 'Deny', event.methodArn));
};

const generatePolicy = (principalId: string, effect: string, resource: string) => {
  return {
    principalId,
    policyDocument: {
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
      Version: '2012-10-17',
    },
  };
};
