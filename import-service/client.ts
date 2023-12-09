import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SNSClient } from '@aws-sdk/client-sns';

const client = new S3Client();
const sqsClient = new SQSClient();
const snsClient = new SNSClient();

export { client, sqsClient, snsClient };
