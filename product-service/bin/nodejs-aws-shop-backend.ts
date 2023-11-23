#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductStack } from '../lib/product-service-stack';

const app = new cdk.App();

new ProductStack(app, 'ProductStack');
