import { S3Event } from 'aws-lambda';
import { copyObject, deleteObject, getObject } from '../utils/S3ObjectUtils';
import * as CsvParser from 'csv-parser';
import { Folders } from '../types/folders';

export const handler = async (event: S3Event): Promise<void> => {
  console.log(`importFileParser lambda => event: ${JSON.stringify(event)}`);

  for await (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const key = record.s3.object.key;

    console.log(`bucketName: ${bucketName}, key: ${key}`);

    const objects = await getObject({ bucketName, key });

    objects
      .pipe(CsvParser())
      ?.on('data', (record: object) => {
        console.log('Record:', record);
      })
      .on('end', async () => {
        console.log('Parse complete');
        await copyObject({
          sourceBucket: bucketName,
          sourceKey: key,
          destinationBucket: bucketName,
          destinationKey: Folders.PARSED,
        });
        console.log('Copy Object end');

        await deleteObject({ bucketName, key });

        console.log('Delete Object end');
      })
      .on('error', (error: Error) => {
        console.error('Parse error:', error);
      });
  }
};
