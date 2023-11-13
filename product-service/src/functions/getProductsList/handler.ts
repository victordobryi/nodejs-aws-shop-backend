import { products } from 'src/mockData';
import { buildResponse } from 'src/utils/buildResponse';

export const getProductsList = async () => {
  try {
    return buildResponse(200, products);
  } catch (error) {
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
