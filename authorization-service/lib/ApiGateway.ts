import { Cors, LambdaIntegration, RestApi, RestApiProps } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class ApiGateway extends RestApi {
  constructor(scope: Construct, props: RestApiProps) {
    super(scope, 'ApiGateway', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
      ...props,
    });
  }

  addIntegration(method: string, path: string, lambda: IFunction) {
    const resource = this.root.resourceForPath(path);
    resource.addMethod(method, new LambdaIntegration(lambda));
  }
}
