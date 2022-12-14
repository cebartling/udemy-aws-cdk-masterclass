import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { join } from "path";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export class Lesson25Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new Table(this, "quotes-tbl", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const handlerFunction = new Function(this, "quotesHandler", {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset(join(__dirname, "../lambdas")),
      handler: "app.handler",
      environment: {
        MY_TABLE: table.tableName,
      },
    });

    table.grantReadWriteData(handlerFunction);

    const getQuotesRestApi = new RestApi(this, "getQuotesRestApi", {
      description: "Quotes API",
    });

    const mainPath = getQuotesRestApi.root.addResource("quotes");
    mainPath.addMethod("GET", new LambdaIntegration(handlerFunction));
  }
}
