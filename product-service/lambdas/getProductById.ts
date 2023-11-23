import { APIGatewayProxyEvent } from 'aws-lambda';
import { buildResponse } from '../utils/buildResponse';
import { findOne } from '../model/products.model';

export const handler = async (event: APIGatewayProxyEvent) => {
  const { pathParameters } = event;
  if (!pathParameters?.productId) {
    return buildResponse(400, {
      message: 'ProductId is required',
    });
  }
  try {
    const product = await findOne(pathParameters.productId);
    return buildResponse(200, product);
  } catch (error) {
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
