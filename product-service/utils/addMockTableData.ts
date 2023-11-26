import { BatchWriteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Product } from '../types/product';
import { createProductsData } from './createProductsData';
import { createStocksData } from './createStocksData';
import { TABLE_NAME } from '../types/table';
import { Stocks } from '../types/stocks';

const client = new DynamoDBClient({});

const addMockTableData = async <T>(
  client: DynamoDBClient,
  tableName: string,
  items: T[],
  getItemAttributes: (item: T) => any
) => {
  try {
    await client.send(
      new BatchWriteItemCommand({
        RequestItems: {
          [tableName]: items.map((item) => ({
            PutRequest: {
              Item: getItemAttributes(item),
            },
          })),
        },
      })
    );
  } catch (error) {
    console.log(error);
  }
};

const products = createProductsData();
const stocks = createStocksData(products);

addMockTableData<Product>(
  client,
  TABLE_NAME.PRODUCT_TABLE,
  products,
  ({ id, description, title, price }) => ({
    id: { S: id },
    title: { S: title },
    description: { S: description },
    price: { N: price.toString() },
  })
);

addMockTableData<Stocks>(client, TABLE_NAME.STOCKS_TABLE, stocks, ({ product_id, count }) => ({
  product_id: { S: product_id },
  count: { N: count.toString() },
}));
