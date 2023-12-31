import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import 'dotenv/config';
import { Lambda } from './Lambda';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

const userName = process.env.USER_NAME ?? '';
const userPassword = process.env.USER_PASSWORD ?? '';

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new Lambda(this, 'basicAuthorizer', {
      environment: {
        [userName]: userPassword,
      },
    });

    basicAuthorizer.grantInvoke({
      grantPrincipal: new ServicePrincipal('apigateway.amazonaws.com'),
    });
  }
}
