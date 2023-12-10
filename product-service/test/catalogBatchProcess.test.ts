import { handler } from '../lambdas/catalogBatchProcess';
import { createOne } from '../model/products.model';
import { SQSEvent } from 'aws-lambda';
import { snsClient } from '../../import-service/client';

jest.mock('../model/products.model');
jest.mock('../../import-service/client');

const mockedCreateOne = createOne as jest.MockedFunction<typeof createOne>;
const mockedSnsClient = snsClient as jest.Mocked<typeof snsClient>;

const mockProduct = {
  count: 5,
  description: 'Short Description of Product1',
  id: '4261ec4b-b10c-48c5-9345-fc73c48a80ac',
  price: 20,
  title: 'Product1',
};

const { ...productData } = mockProduct;

const mockEvent = {
  Records: [
    {
      body: JSON.stringify(productData),
    },
  ],
};

describe('handler', () => {
  beforeEach(() => {
    mockedCreateOne.mockClear();
    mockedSnsClient.send.mockClear();
  });

  it('should handle SQSEvent and return success response', async () => {
    mockedCreateOne.mockResolvedValueOnce(mockProduct);

    const mockSnsClientResponse = {
      $metadata: {
        httpStatusCode: 200,
        requestId: 'request-id',
        extendedRequestId: 'extended-request-id',
      },
    };
    mockedSnsClient.send.mockResolvedValueOnce(mockSnsClientResponse as never);

    const result = await handler(mockEvent as SQSEvent);

    expect(mockedCreateOne).toHaveBeenCalledWith(JSON.stringify(mockProduct));

    expect(result.statusCode).toBe(200);
  });

  it('should handle error and return error response', async () => {
    const mockError = new Error('Some error');
    mockedCreateOne.mockRejectedValueOnce(mockError);

    const result = await handler(mockEvent as SQSEvent);

    expect(mockedCreateOne).toHaveBeenCalledWith(JSON.stringify(mockProduct));
    expect(mockedSnsClient.send).not.toHaveBeenCalled();

    expect(result.statusCode).toBe(500);
  });
});
