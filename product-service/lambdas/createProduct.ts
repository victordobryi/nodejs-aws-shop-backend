import { APIGatewayProxyEvent } from 'aws-lambda';
import { buildResponse } from '../utils/buildResponse';
import { createOne } from '../model/products.model';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(`createProduct lambda => event: ${JSON.stringify(event)}`);

  try {
    const { body } = event;
    if (!body) {
      return buildResponse(400, {
        message: 'Missing body',
      });
    }
    const { title, price, description } = JSON.parse(body);
    const product = await createOne(body);
    if (!title || !price || !description) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required parameters',
        }),
      };
    }
    return buildResponse(200, product);
  } catch (error) {
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
