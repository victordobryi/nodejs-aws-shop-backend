import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { products } from 'src/mockData';
import { buildResponse } from 'src/utils/buildResponse';
import schema from './schema';

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { productId } = event.pathParameters;
  try {
    const product = products.find((product) => product.id === productId);
    if (!product) {
      return buildResponse(404, { message: 'Product not found' });
    }
    return buildResponse(200, product);
  } catch (error) {
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
