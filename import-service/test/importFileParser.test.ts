import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { handler } from '../lambdas/importFileParser';
import { S3Event, S3EventRecord } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { createReadStream } from 'fs';
import { sdkStreamMixin } from '@smithy/util-stream';

const s3MockClient = mockClient(S3Client);

const event: Partial<S3Event> = {
  Records: [
    {
      s3: {
        bucket: {
          name: 'import-service-bucket-s3-rss',
        },
        object: {
          key: 'products.csv',
        },
      },
    } as S3EventRecord,
  ],
};

describe('importFileParser handler', () => {
  it('should return correct bucket data', async () => {
    const stream = createReadStream('mockData/products.csv');

    const sdkStream = sdkStreamMixin(stream);

    s3MockClient.on(GetObjectCommand).resolves({ Body: sdkStream });

    await handler(event as S3Event);

    expect(s3MockClient.call(0).args[0].input).toEqual({
      Bucket: 'import-service-bucket-s3-rss',
      Key: 'products.csv',
    });
  });

  it('should handle error', async () => {
    const stream = createReadStream('mockData/products.csv');

    stream.pipe = jest.fn(() => {
      throw new Error('Pipe error');
    });

    const sdkStream = sdkStreamMixin(stream);

    s3MockClient.on(GetObjectCommand).resolves({ Body: sdkStream });

    await expect(handler(event as S3Event)).rejects.toThrow('Pipe error');
  });
});
