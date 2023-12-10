import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Lambda } from './Lambda';
import { Construct } from 'constructs';
import { ApiGateway } from './ApiGateway';
import { SwaggerUi } from '@pepperize/cdk-apigateway-swagger-ui';
import { AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { DDBTable } from './DDBTable';
import { TABLE_NAME } from '../types/table';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SnsEventSource, SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { SubscriptionFilter, Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { SqsDestination } from 'aws-cdk-lib/aws-lambda-destinations';

export class ProductStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new ApiGateway(this, 'ProductsApi');

    const productsTable = new DDBTable(this, 'products', {
      tableName: TABLE_NAME.PRODUCT_TABLE,
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    const stocksTable = new DDBTable(this, 'stocks', {
      tableName: TABLE_NAME.STOCKS_TABLE,
      partitionKey: { name: 'product_id', type: AttributeType.STRING },
    });

    const getProductsList = new Lambda(this, 'getProductsList');
    api.addIntegration('GET', '/products', getProductsList);

    const getProductsById = new Lambda(this, 'getProductById');
    api.addIntegration('GET', '/products/{productId}', getProductsById);

    const createProduct = new Lambda(this, 'createProduct');
    api.addIntegration('POST', '/products', createProduct);

    const deadLetterQueue = new Queue(this, 'catalogItemsDeadLetterQueue', {
      queueName: 'catalogItemsDeadLetterQueue',
      retentionPeriod: Duration.days(7),
    });

    const uploadQueue = new Queue(this, 'catalogItemsQueue', {
      queueName: 'catalogItemsQueue',
      visibilityTimeout: Duration.seconds(30),
      deadLetterQueue: {
        maxReceiveCount: 1,
        queue: deadLetterQueue,
      },
    });

    // Create a SNS Topic.
    const uploadEventTopic = new Topic(this, 'createProductTopic', {
      topicName: 'createProductTopic',
    });

    const emailSubscription1 = new EmailSubscription('kasilkina@mail.ru', {
      filterPolicy: {
        price: SubscriptionFilter.numericFilter({ greaterThan: 10 }),
      },
    });

    const emailSubscription2 = new EmailSubscription('dobr1nya@mail.ru', {
      filterPolicy: {
        price: SubscriptionFilter.numericFilter({ lessThanOrEqualTo: 10 }),
      },
    });

    uploadEventTopic.addSubscription(emailSubscription1);
    uploadEventTopic.addSubscription(emailSubscription2);

    const catalogBatchProcess = new Lambda(this, 'catalogBatchProcess', {
      onFailure: new SqsDestination(deadLetterQueue),
      environment: {
        TOPIC_ARN: uploadEventTopic.topicArn,
      },
    });

    // Bind the Lambda to the SQS Queue.
    const invokeEventSource = new SqsEventSource(uploadQueue, {
      batchSize: 5,
    });
    catalogBatchProcess.addEventSource(invokeEventSource);

    uploadQueue.grantConsumeMessages(catalogBatchProcess);
    deadLetterQueue.grantSendMessages(catalogBatchProcess);

    stocksTable.grantReadData(getProductsList);
    stocksTable.grantReadData(getProductsById);
    stocksTable.grantWriteData(createProduct);
    stocksTable.grantWriteData(catalogBatchProcess);
    stocksTable.grantReadData(catalogBatchProcess);

    productsTable.grantReadData(getProductsList);
    productsTable.grantReadData(getProductsById);
    productsTable.grantWriteData(createProduct);
    productsTable.grantWriteData(catalogBatchProcess);
    productsTable.grantReadData(catalogBatchProcess);

    uploadEventTopic.grantPublish(catalogBatchProcess);

    catalogBatchProcess.addEventSource(new SnsEventSource(uploadEventTopic));

    new SwaggerUi(this, 'SwaggerUI', { resource: api.root });
  }
}
