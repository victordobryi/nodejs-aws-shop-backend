import { APIGatewayProxyEvent } from 'aws-lambda';
import { findAll } from '../model/products.model';
import { buildResponse } from '../utils/buildResponse';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(`getProductsList lambda => event: ${JSON.stringify(event)}`);
  try {
    const products = await findAll();
    return buildResponse(200, products);
  } catch (error) {
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
