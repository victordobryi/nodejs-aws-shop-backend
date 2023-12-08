import { SendMessageCommand } from '@aws-sdk/client-sqs';

import { sqsClient } from '../client';

export const sendMessage = async (url: string, payload: unknown) => {
  console.log(`sendMessage => url: ${url}, payload: ${JSON.stringify(payload)}`);

  const res = await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: url,
      MessageBody: JSON.stringify(payload),
    })
  );
};
