import { getProductsById } from '@functions/getProductsById/handler';
import { products } from 'src/mockData';
import { buildResponse } from 'src/utils/buildResponse';

describe('getProductsById handler', () => {
  it('should return product with status code 200 if product exists', async () => {
    const productId = '7567ec4b-b10c-48c5-9345-fc73c48a80aa';
    const product = {
      description: 'Short Product Description1',
      id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
      price: 24,
      title: 'ProductOne',
    };
    const event = {
      pathParameters: { productId },
    };
    const response = await getProductsById(event as any, null, null);
    expect(response).toEqual(buildResponse(200, product));
  });

  it('should return error response with status code 404 if product does not exist', async () => {
    const productId = 'invalidId';
    const event = {
      pathParameters: { productId },
    };
    const response = await getProductsById(event as any, null, null);
    expect(response).toEqual(buildResponse(404, { message: 'Product not found' }));
  });

  it('should return error response with status code 500 if an error occurs', async () => {
    const errorMessage = 'Internal server error';
    jest.spyOn(products, 'find').mockImplementation(() => {
      throw new Error(errorMessage);
    });
    const productId = '1';
    const event = {
      pathParameters: { productId },
    };
    const response = await getProductsById(event as any, null, null);
    expect(response).toEqual(buildResponse(500, { message: errorMessage }));
  });
});
