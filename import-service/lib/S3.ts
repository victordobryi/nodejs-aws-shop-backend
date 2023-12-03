import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  BucketProps,
  HttpMethods,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { S3Actions } from '../types/actions';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class S3 extends Bucket {
  constructor(scope: Construct, bucketName: string, props?: BucketProps) {
    super(scope, 'S3', {
      bucketName,
      cors: [
        {
          allowedOrigins: Cors.ALL_ORIGINS,
          allowedMethods: [HttpMethods.PUT, HttpMethods.GET, HttpMethods.DELETE],
          allowedHeaders: Cors.DEFAULT_HEADERS,
        },
      ],
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      ...props,
    });
  }

  registerHandler(handler: IFunction, action: S3Actions, keyPrefix: string) {
    handler.addToRolePolicy(this.createAccessPolicy(action, keyPrefix));
  }

  private createAccessPolicy(action: S3Actions, keyPrefix: string): PolicyStatement {
    return new PolicyStatement({
      actions: [action],
      resources: [this.bucketArn, this.arnForObjects(`${keyPrefix}/*`)],
      effect: Effect.ALLOW,
    });
  }
}
