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
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new ApiGateway(this, 'ImportApi');

    const ImporServiceBucket = new S3(this, Buckets.IMPORT_BUCKET, {
      publicReadAccess: false,
    });

    const uploadQueue = Queue.fromQueueArn(
      this,
      'catalogItemsQueue',
      'arn:aws:sqs:us-east-1:665032699737:catalogItemsQueue'
    );

    const importProductsFile = new Lambda(this, 'importProductsFile');
    api.addIntegration('GET', '/import', importProductsFile);

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

    importFileParser.addToRolePolicy(
      new PolicyStatement({
        actions: ['sqs:SendMessage'],
        resources: [uploadQueue.queueArn],
        effect: Effect.ALLOW,
      })
    );

    uploadQueue.grantSendMessages(importFileParser);

    new SwaggerUi(this, 'SwaggerUI', { resource: api.root });
  }
}
