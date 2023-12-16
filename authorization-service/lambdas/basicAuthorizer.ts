import { APIGatewayTokenAuthorizerEvent, Callback } from 'aws-lambda';
import { buildResponse } from '../utils/buildResponse';

export const handler = async (event: APIGatewayTokenAuthorizerEvent, callback: Callback) => {
  try {
    const token = event.authorizationToken;
    const encodedCreds = token.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const username = plainCreds[0];
    const password = plainCreds[1];

    console.log(`username: ${username}, password: ${password}`);

    const storedPassword = process.env[username];

    if (!storedPassword || storedPassword !== password) {
      // Return 403 if access is denied for the user
      return buildResponse(403, { message: 'Access denied: Invalid authorization_token' });
    }

    const effect = !storedPassword || storedPassword !== password ? 'Deny' : 'Allow';

    const policy = generatePolicy(encodedCreds, effect, event.methodArn);

    return buildResponse(200, policy);
  } catch (error) {
    return buildResponse(401, { message: 'Unauthorized: Authorization header not provided' });
  }

  // switch (token) {
  //   case 'allow':
  //     callback(null, generatePolicy(encodedCreds, 'Allow', event.methodArn));
  //     break;
  //   case 'deny':
  //     callback(null, generatePolicy(encodedCreds, 'Deny', event.methodArn));
  //     break;
  //   case 'unauthorized':
  //     callback('Unauthorized');
  //     break;
  //   default:
  //     callback('Error: Invalid token');
  // }
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
