export const buildResponse = (statusCode: number, body: any) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  },
  body: JSON.stringify(body),
});
