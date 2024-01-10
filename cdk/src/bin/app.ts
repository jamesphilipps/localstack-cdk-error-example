#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { ExampleApp } from "../lib/constructs"

const app = new cdk.App()
new ExampleApp(app)
