import { S3Client } from '@aws-sdk/client-s3';
// This relies on a Region being set up in your local AWS config.
const client = new S3Client({});
export { client };
