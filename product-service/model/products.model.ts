import { DynamoDBClient, QueryCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { FullProduct, Product, ProductsRecord } from '../types/product';
import { TABLE_NAME } from '../types/table';
import { Stocks, StocksRecord } from '../types/stocks';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { TypedQueryOutput, TypedScanCommandOutput } from '../types/types';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});

const findAll = async (): Promise<FullProduct[]> => {
  const { Items: productItems } = (await client.send(
    new ScanCommand({
      TableName: TABLE_NAME.PRODUCT_TABLE,
    })
  )) as TypedScanCommandOutput<ProductsRecord[]>;

  const { Items: stocksItems } = (await client.send(
    new ScanCommand({
      TableName: TABLE_NAME.STOCKS_TABLE,
    })
  )) as TypedScanCommandOutput<StocksRecord[]>;

  const dbProducts: Product[] = productItems?.map((item: any) => unmarshall(item) as Product) ?? [];
  const dbStocks: Stocks[] = stocksItems?.map((item: any) => unmarshall(item) as Stocks) ?? [];

  const dbFullProducts = dbProducts.map((product) => {
    const stock = dbStocks.find(({ product_id }) => product_id === product.id);
    return { ...product, count: stock?.count ?? 0 };
  });

  return dbFullProducts;
};

const findOne = async (id: string): Promise<FullProduct | undefined> => {
  const { Items: productsItem } = (await client.send(
    new QueryCommand({
      TableName: TABLE_NAME.PRODUCT_TABLE,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': { S: id },
      },
    })
  )) as TypedQueryOutput<ProductsRecord[]>;

  if (!productsItem?.length) {
    throw new Error('Product not found');
  }

  const product = unmarshall(productsItem[0] as any) as Product;

  const { Items: stocksItem } = (await client.send(
    new QueryCommand({
      TableName: TABLE_NAME.STOCKS_TABLE,
      KeyConditionExpression: 'product_id = :product_id',
      ExpressionAttributeValues: {
        ':product_id': { S: id },
      },
    })
  )) as TypedQueryOutput<StocksRecord[]>;

  if (!stocksItem?.length) {
    throw new Error('Stocks not found');
  }

  const stock = unmarshall(stocksItem[0] as any) as Stocks;

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

  await client.send(
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

  return product;
};

export { findAll, findOne };
