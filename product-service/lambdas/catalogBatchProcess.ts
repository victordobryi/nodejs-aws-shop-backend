import { SQSEvent } from 'aws-lambda';
import { createOne } from '../model/products.model';
import { buildResponse } from '../utils/buildResponse';
import { FullProduct } from '../types/product';
import { snsClient } from '../../import-service/client';
import { PublishCommand } from '@aws-sdk/client-sns';

export const handler = async (event: SQSEvent) => {
  console.log(`catalogBatchProcess lambda => event: ${JSON.stringify(event)}`);

  const records = event.Records;
  const products: FullProduct[] = [];

  try {
    for (const record of records) {
      const newProductData = await createOne(record.body);
      console.log(`newProductData: ${JSON.stringify(newProductData)}`);

      products.push(newProductData);
      console.log(`products: ${JSON.stringify(products)}`);
    }
    await snsClient.send(
      new PublishCommand({
        TopicArn: process.env.TOPIC_ARN,
        Message: JSON.stringify({
          products,
          message: 'Products were successfully generated from csv',
        }),
      })
    );
    return buildResponse(200, products);
  } catch (error) {
    return buildResponse(500, {
      message: error instanceof Error && error.message,
    });
  }
};
