import { handler as getProductsList } from '../lambdas/getProductsList';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('getProductsList handler', () => {
  it('should return products list', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {},
    };
    const response = await getProductsList(event as APIGatewayProxyEvent);
    expect(JSON.parse(response.body).length).not.toBe(0);
  });
});
