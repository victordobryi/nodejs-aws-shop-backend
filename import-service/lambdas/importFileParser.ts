import { S3Event } from 'aws-lambda';
import { copyObject, deleteObject, getObject } from '../utils/S3ObjectUtils';
import csvParser from 'csv-parser';
import { Folders } from '../types/folders';
import { sendMessage } from '../utils/SQSUtils';
import { Product } from '../../product-service/types/product';
import { buildResponse } from '../utils/buildResponse';

export const handler = async (event: S3Event) => {
  console.log(`importFileParser lambda => event: ${JSON.stringify(event)}`);

  const bucketName = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  console.log(`bucketName: ${bucketName}, key: ${key}`);

  const objects = await getObject({ bucketName, key });

  const products: Product[] = [];

  await new Promise<void>((resolve, reject) =>
    objects
      .pipe(csvParser())
      ?.on('data', async (record: object) => {
        products.push(record as Product);
      })
      .on('end', async () => {
        console.log('Parse complete');

        await copyObject({
          sourceBucket: bucketName,
          sourceKey: key,
          destinationBucket: bucketName,
          destinationKey: key.replace(Folders.UPLOADED, Folders.PARSED),
        });
        console.log('Copy Object end');

        console.log(`Delete => bucketName: ${bucketName}, key: ${key}`);

        await deleteObject({ bucketName, key });

        console.log('Delete Object end');
        resolve();
      })
      .on('error', (error: Error) => {
        console.error('Parse error:', error);
        reject(error);
      })
  );

  try {
    await sendMessage(process.env.UPLOAD_QUEUE_URL ?? '', products);
  } catch (error) {
    console.log(`SQS message sending error => ${error}`);
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
