import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { FullProduct, Product } from '../types/product';
import { TABLE_NAME } from '../types/table';
import { Stocks } from '../types/stocks';
import { TypedQueryOutput, TypedScanCommandOutput } from '../types/types';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient();

const documentClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const findAll = async (): Promise<FullProduct[]> => {
  const { Items: productItems } = (await documentClient.send(
    new ScanCommand({
      TableName: TABLE_NAME.PRODUCT_TABLE,
    })
  )) as TypedScanCommandOutput<Product[]>;

  const { Items: stocksItems } = (await documentClient.send(
    new ScanCommand({
      TableName: TABLE_NAME.STOCKS_TABLE,
    })
  )) as TypedScanCommandOutput<Stocks[]>;

  const dbProducts: Product[] = productItems ?? [];
  const dbStocks: Stocks[] = stocksItems ?? [];

  const dbFullProducts = dbProducts.map((product) => {
    const stock = dbStocks.find(({ product_id }) => product_id === product.id);
    return { ...product, count: stock?.count ?? 0 };
  });

  return dbFullProducts;
};

const findOne = async (id: string): Promise<FullProduct | undefined> => {
  const { Items: productsItem } = (await documentClient.send(
    new QueryCommand({
      TableName: TABLE_NAME.PRODUCT_TABLE,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id,
      },
    })
  )) as TypedQueryOutput<Product[]>;

  if (!productsItem?.length) {
    throw new Error('Product not found');
  }

  const product = productsItem[0];

  const { Items: stocksItem } = (await documentClient.send(
    new QueryCommand({
      TableName: TABLE_NAME.STOCKS_TABLE,
      KeyConditionExpression: 'product_id = :product_id',
      ExpressionAttributeValues: {
        ':product_id': id,
      },
    })
  )) as TypedQueryOutput<Stocks[]>;

  if (!stocksItem?.length) {
    throw new Error('Stocks not found');
  }

  const stock = stocksItem[0];

  const fullProduct = {
    ...product,
    count: stock.count,
  };

  return fullProduct;
};

const createOne = async (body: string): Promise<FullProduct> => {
  const id = uuidv4();
  const product: FullProduct = { id, ...JSON.parse(body) };
  const stock = { product_id: id, count: product.count };

  await documentClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME.PRODUCT_TABLE,
            Item: {
              ...product,
            },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME.STOCKS_TABLE,
            Item: {
              ...stock,
            },
          },
        },
      ],
    })
  );

  console.log('Product created', product);

  return product;
};

export { findAll, findOne, createOne };
