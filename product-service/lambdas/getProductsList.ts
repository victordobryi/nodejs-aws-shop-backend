import { findAll } from '../model/products.model';
import { buildResponse } from '../utils/buildResponse';

export const handler = async () => {
  try {
    const products = await findAll();
    return buildResponse(200, products);
  } catch (error) {
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
