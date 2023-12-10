import { APIGatewayProxyEvent } from 'aws-lambda';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { handler } from '../lambdas/importProductsFile';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('import-service-bucket-s3-rss/uploaded/products.csv'),
}));

describe('importProductsFile handler', () => {
  it('should return upload url', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        name: 'products.csv',
      },
    };

    const res = await handler(event as APIGatewayProxyEvent);

    expect(getSignedUrl).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.headers?.['Access-Control-Allow-Headers']).toBe('*');
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
    expect(res.headers?.['Access-Control-Allow-Credentials']).toBe(true);
    expect(JSON.parse(res.body)).toEqual('import-service-bucket-s3-rss/uploaded/products.csv');
    expect(JSON.parse(res.body)).toContain('products.csv');
  });

  it('should return 400 error if fileName was not found', async () => {
    const event = {
      queryStringParameters: {},
    };

    const res = await handler(event as APIGatewayProxyEvent);

    expect(res.statusCode).toBe(400);
    expect(res.headers?.['Access-Control-Allow-Headers']).toBe('*');
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
    expect(res.headers?.['Access-Control-Allow-Credentials']).toBe(true);
    expect(JSON.parse(res.body).message).toContain('fileName is required');
  });
});
