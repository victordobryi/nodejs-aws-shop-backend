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

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new ApiGateway(this, 'ImportApi');

    const ImporServiceBucket = new S3(this, Buckets.IMPORT_BUCKET, {
      publicReadAccess: false,
    });

    const importProductsFile = new Lambda(this, 'importProductsFile');
    api.addIntegration('GET', '/import', importProductsFile);

    const importFileParser = new Lambda(this, 'importFileParser');

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

    new SwaggerUi(this, 'SwaggerUI', { resource: api.root });
  }
}
