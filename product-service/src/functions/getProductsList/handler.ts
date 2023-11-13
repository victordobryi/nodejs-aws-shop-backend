import { products } from 'src/mockData';
import { buildResponse } from 'src/utils/buildResponse';

export const getProductsList = async () => {
  try {
    if (!products) {
      return buildResponse(404, { message: 'Products not found' });
    }
    return buildResponse(200, products);
  } catch (error) {
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
