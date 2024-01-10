import * as lambda from "aws-cdk-lib/aws-lambda"
import * as iam from "aws-cdk-lib/aws-iam"
import * as api from "aws-cdk-lib/aws-apigateway"
import { EndpointType } from "aws-cdk-lib/aws-apigateway"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Construct } from "constructs"
import { Duration, Stack, StackProps } from "aws-cdk-lib"
import path from "path"
import { getRootDir} from "../utils/paths"
import { Certificate } from "aws-cdk-lib/aws-certificatemanager"

export class ExampleStack extends Stack {
    // public readonly apiDomainName: string
    private readonly apiGateway: api.RestApi

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props)
        this.apiGateway = this.createPublicApiGateway(this.createApiInternalHandler())
        // this.apiDomainName = this.createCustomDomainName()
    }

    private createPublicApiGateway(handler: lambda.IFunction): api.RestApi {
        const apiGateway = new api.RestApi(this, "exampleApiGateway", {
            restApiName: "example-api",
            cloudWatchRole: true,
            endpointTypes: [EndpointType.REGIONAL],
            deployOptions: {
                loggingLevel: api.MethodLoggingLevel.INFO,
                stageName: "local",
            },
        })

        handler.grantInvoke(new iam.ServicePrincipal("apigateway.amazonaws.com"))
        const defaultIntegration = new api.LambdaIntegration(handler)

        apiGateway.root
            .addResource("{proxy+}", {
                defaultIntegration,
                defaultMethodOptions: {
                    apiKeyRequired: true,
                },
            })
            .addMethod("ANY")

        return apiGateway
    }

    private createCustomDomainName(): string {
        const domainName = `api.example.com`

        this.apiGateway.addDomainName("customDomain", {
            domainName,
            securityPolicy: api.SecurityPolicy.TLS_1_2,
            certificate: Certificate.fromCertificateArn(this, "cert1", "arn:aws:acm:eu-west-1:000000000000:certificate/5577c633-cb40-4c8c-bc05-d318573e0560"),
            endpointType: EndpointType.REGIONAL,
            basePath: "",
        })

        return domainName
    }

    private createApiInternalHandler(): lambda.IFunction {
        const name = "api"
        const handler = new NodejsFunction(this, `${name}Handler`, {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: "apiHandler",
            functionName: `${name}Handler`,
            entry: path.join(getRootDir(), "src/handler.ts"),
            timeout: Duration.seconds(30),
            tracing: lambda.Tracing.ACTIVE,
            environment: {
                foo: `${Math.floor(Math.random() * 100)}`, // force stack update
            }
        })

        return handler
    }
}
