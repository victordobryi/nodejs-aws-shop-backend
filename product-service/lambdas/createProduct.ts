import { APIGatewayProxyEvent } from 'aws-lambda';
import { buildResponse } from '../utils/buildResponse';
import { createOne } from '../model/products.model';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(`createProduct lambda => event: ${JSON.stringify(event)}`);

  const { body } = event;

  if (!body) {
    return buildResponse(400, {
      message: 'Missing body',
    });
  }
  try {
    const product = await createOne(body);

    return buildResponse(200, product);
  } catch (error) {
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
