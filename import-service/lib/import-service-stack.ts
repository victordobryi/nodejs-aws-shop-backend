import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGateway } from './ApiGateway';
import { S3 } from './S3';
import { Lambda } from './Lambda';
import { Folders } from '../types/folders';
import { S3Actions } from '../types/actions';
import { Buckets } from '../types/buckets';
import { EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { SwaggerUi } from '@pepperize/cdk-apigateway-swagger-ui';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { AuthorizationType, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { Function } from 'aws-cdk-lib/aws-lambda';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new ApiGateway(this, 'ImportApi');

    api.addGatewayResponse('GatewayResponse4XX', {
      type: cdk.aws_apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers':
          "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        'Access-Control-Allow-Methods': "'OPTIONS,GET,PUT'",
      },
    });

    const ImporServiceBucket = new S3(this, Buckets.IMPORT_BUCKET, {
      publicReadAccess: false,
    });

    const uploadQueue = Queue.fromQueueArn(
      this,
      'catalogItemsQueue',
      'arn:aws:sqs:us-east-1:665032699737:catalogItemsQueue'
    );

    const basicAuthorizer = Function.fromFunctionArn(
      this,
      'basicAuthorizer',
      'arn:aws:lambda:us-east-1:665032699737:function:AuthorizationServiceStack-basicAuthorizerF74DD00A-Yeftyz1Wlk3u'
    );

    const authorizer = new TokenAuthorizer(this, 'ImportApiAuthorizer', {
      handler: basicAuthorizer,
    });

    const importProductsFile = new Lambda(this, 'importProductsFile');

    api.addIntegration('GET', '/import', importProductsFile, {
      authorizationType: AuthorizationType.CUSTOM,
      authorizer: authorizer,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true,
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    });

    const importFileParser = new Lambda(this, 'importFileParser', {
      environment: {
        UPLOAD_QUEUE_URL: uploadQueue.queueUrl,
      },
    });

    ImporServiceBucket.registerHandler({
      handler: importProductsFile,
      action: S3Actions.PUT,
      keyPrefix: Folders.UPLOADED,
    });

    ImporServiceBucket.registerHandler({
      handler: importFileParser,
      action: S3Actions.GET,
      keyPrefix: Folders.UPLOADED,
    });

    ImporServiceBucket.registerHandler({
      handler: importFileParser,
      action: S3Actions.DELETE,
      keyPrefix: Folders.UPLOADED,
    });

    ImporServiceBucket.registerHandler({
      handler: importFileParser,
      action: S3Actions.PUT,
      keyPrefix: Folders.PARSED,
    });

    ImporServiceBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(importFileParser),
      {
        prefix: Folders.UPLOADED,
      }
    );

    uploadQueue.grantSendMessages(importFileParser);

    new SwaggerUi(this, 'SwaggerUI', { resource: api.root });
  }
}
