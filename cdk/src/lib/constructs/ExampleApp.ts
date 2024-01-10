import {App, Environment} from "aws-cdk-lib"
import {Construct} from "constructs"
import {ExampleStack} from "../stacks/ExampleStack"

export class ExampleApp extends Construct {
    constructor(app: App) {
        super(app, "example-app")



        const env: Environment = {
            region: "eu-west-1",
            account: "000000000000"
        }

        new ExampleStack(this, "exampleStack", {
            stackName: "example-stack",
            env
        })
    }
}
