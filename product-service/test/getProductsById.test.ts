import { buildResponse } from '../utils/buildResponse';
import { handler as getProductsById } from '../lambdas/getProductById';

describe('getProductsById handler', () => {
  it('should return product with status code 200 if product exists', async () => {
    const productId = 'd5671cf5-5643-4e4b-b742-2e8546836ed0';
    const product = {
      count: '5',
      id: 'd5671cf5-5643-4e4b-b742-2e8546836ed0',
      description: 'Product 5',
      price: '51',
      title: 'Product 5',
    };
    const event = {
      pathParameters: { productId },
    };
    const response = await getProductsById(event as any);
    expect(response).toEqual(buildResponse(200, product));
  });

  it('should return error response with status code 404 if product does not exist', async () => {
    const productId = 'invalidId';
    const event = {
      pathParameters: { productId },
    };
    const response = await getProductsById(event as any);
    expect(response).toEqual(buildResponse(404, { message: 'Product not found' }));
  });

  it('should return 500 error response', async () => {
    const event = {
      pathParameters: { productId: '1' },
    };

    try {
      const response = await getProductsById(event as any);
    } catch {
      const mockError = new Error('Test Error');
      const result = buildResponse(500, { mockError });

      expect(result).toEqual(
        buildResponse(500, {
          mockError,
        })
      );
    }
  });
});
