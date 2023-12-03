import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGateway } from './ApiGateway';
import { S3 } from './S3';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new ApiGateway(this, 'ImportApi');

    const ImporServiceBucket = new S3(this, 'import-service-bucket-s3-rss', {
      publicReadAccess: false,
    });
  }
}
