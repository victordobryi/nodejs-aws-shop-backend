import { products } from '../mockData';
import { buildResponse } from '../utils/buildResponse';
import { handler as getProductsList } from '../lambdas/getProductsList';

describe('getProductsList handler', () => {
  it('should return products list', async () => {
    const response = await getProductsList();
    expect(response).toEqual(buildResponse(200, products));
    expect(JSON.parse(response.body).length).not.toBe(0);
  });
});
