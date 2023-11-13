import { getProductsList } from '@functions/getProductsList/handler';
import { products } from 'src/mockData';
import { buildResponse } from 'src/utils/buildResponse';

describe('getProductsList handler', () => {
  it('should return products list', async () => {
    const response = await getProductsList();
    expect(response).toEqual(buildResponse(200, products));
    expect(JSON.parse(response.body).length).not.toBe(0);
  });
});
