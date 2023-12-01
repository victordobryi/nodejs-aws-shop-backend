import { Stack, StackProps } from 'aws-cdk-lib';
import { Lambda } from './Lambda';
import { Construct } from 'constructs';
import { ApiGateway } from './ApiGateway';
import { SwaggerUi } from '@pepperize/cdk-apigateway-swagger-ui';
import { AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { DDBTable } from './DDBTable';
import { TABLE_NAME } from '../types/table';

export class ProductStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new ApiGateway(this, 'ProductsApi');

    const productsTable = new DDBTable(this, 'products', {
      tableName: TABLE_NAME.PRODUCT_TABLE,
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    const stocksTable = new DDBTable(this, 'stocks', {
      tableName: TABLE_NAME.STOCKS_TABLE,
      partitionKey: { name: 'product_id', type: AttributeType.STRING },
    });

    const getProductsList = new Lambda(this, 'getProductsList');
    api.addIntegration('GET', '/products', getProductsList);

    const getProductsById = new Lambda(this, 'getProductById');
    api.addIntegration('GET', '/products/{productId}', getProductsById);

    const createProduct = new Lambda(this, 'createProduct');
    api.addIntegration('POST', '/products', createProduct);

    stocksTable.grantReadData(getProductsList);
    stocksTable.grantReadData(getProductsById);
    stocksTable.grantWriteData(createProduct);

    productsTable.grantReadData(getProductsList);
    productsTable.grantReadData(getProductsById);
    productsTable.grantWriteData(createProduct);

    new SwaggerUi(this, 'SwaggerUI', { resource: api.root });
  }
}
