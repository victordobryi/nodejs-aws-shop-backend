import { RemovalPolicy } from 'aws-cdk-lib';
import { Billing, TableEncryptionV2, TablePropsV2, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DDBTable extends TableV2 {
  constructor(scope: Construct, tableName: string, props: TablePropsV2) {
    super(scope, tableName, {
      ...props,
      billing: Billing.onDemand(),
      encryption: TableEncryptionV2.dynamoOwnedKey(),
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
