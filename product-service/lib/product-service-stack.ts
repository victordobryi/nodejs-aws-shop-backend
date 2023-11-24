import { Stack, StackProps } from 'aws-cdk-lib';
import { Lambda } from './Lambda';
import { Construct } from 'constructs';
import { ApiGateway } from './ApiGateway';
import { SwaggerUi } from '@pepperize/cdk-apigateway-swagger-ui';

export class ProductStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new ApiGateway(this, 'ProductsApi');

    const getProductsList = new Lambda(this, 'getProductsList');
    api.addIntegration('GET', '/products', getProductsList);

    const getProductsById = new Lambda(this, 'getProductById');
    api.addIntegration('GET', '/products/{productId}', getProductsById);

    new SwaggerUi(this, 'SwaggerUI', { resource: api.root });
  }
}
