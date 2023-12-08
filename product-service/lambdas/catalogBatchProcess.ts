import { APIGatewayProxyEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(`catalogBatchProcess lambda => event: ${JSON.stringify(event)}`);

  try {
  } catch (error) {}
};
