import { SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { Product } from '../../product-service/types/product';
import { sqsClient } from '../client';

export const sendMessage = async (url: string, payload: Product[]) => {
  console.log(`sendMessage => url: ${url}, payload: ${JSON.stringify(payload)}`);

  const res = await sqsClient.send(
    new SendMessageBatchCommand({
      QueueUrl: url,
      Entries: payload.map((product, index) => {
        return {
          Id: String(index),
          MessageBody: JSON.stringify(product),
        };
      }),
    })
  );

  console.log(`res => ${res}`);
};
