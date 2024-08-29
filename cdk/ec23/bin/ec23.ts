#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ec23Stack } from '../lib/ec23-stack';
// import { getConfig } from "../lib/config";

// 1. Retrieving our config and envs
// const config = getConfig();

// console.log('CONFIG IS:', config)

const app = new cdk.App();

new Ec23Stack(app, 'Ec23Stack', {
  // env: {
  //   // 2. Passing our REGION env to our stack to control the region it's deployed to
  //   account: '<account_id_here>', // paisley's acc?
  //   region: config.REGION,
  // },

  // config,
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
app.synth();