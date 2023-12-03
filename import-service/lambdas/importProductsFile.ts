import { APIGatewayProxyEvent } from 'aws-lambda';
import { buildResponse } from '../utils/buildResponse';
import { generateSignedUrl } from '../utils/S3ObjectUtils';
import { Folders } from '../types/folders';
import { Buckets } from '../types/buckets';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(`importProductsFile lambda => event: ${JSON.stringify(event)}`);

  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return buildResponse(400, {
      message: 'fileName is required',
    });
  }

  try {
    const url = await generateSignedUrl({
      bucketName: Buckets.IMPORT_BUCKET,
      key: `${Folders.UPLOADED}/${fileName}`,
    });

    return buildResponse(200, url);
  } catch (error) {
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
