import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';

const client = new S3Client();
const sqsClient = new SQSClient();

export { client, sqsClient };
