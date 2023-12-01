import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { createProductsData } from './createProductsData';
import { createStocksData } from './createStocksData';
import { TABLE_NAME } from '../types/table';
import { BatchWriteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

const addMockTableData = async <T extends Record<string, any>>(
  documentClient: DynamoDBDocumentClient,
  tableName: string,
  items: T[]
) => {
  try {
    await documentClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: items.map((item) => {
            return {
              PutRequest: {
                Item: item,
              },
            };
          }),
        },
      })
    );
  } catch (error) {
    console.log(error);
  }
};

const products = createProductsData();
const stocks = createStocksData(products);

addMockTableData(documentClient, TABLE_NAME.PRODUCT_TABLE, products);

addMockTableData(documentClient, TABLE_NAME.STOCKS_TABLE, stocks);
