# Paisley

Paisley is an open-source framework to help IT or engineering teams quickly set up and deploy chatbots that integrate their data. It achieves this through Retrieval-Augmented Generation (RAG).

Our RAG “starter-kit” enables teams to skip some of the research, easily establish knowledge bases, and more quickly deploy and iterate on RAG chatbots.

The following steps will show you how to get started deploying Paisley on your own AWS infrastructure. You will need AWS credentials, Node.js, and npm.

## Setup
Install and configure AWS CDK
```
npm install -g aws-cdk
aws configure
```

Clone the CDK stack and Paisley's CLI
```
git clone https://github.com/paisley-rag/cdk-cli --branch main --single-branch
```

Install dependencies
```
cd cdk-cli && npm install
```

Bootstrap CDK environment (from `cdk-cli/cdk`)
```
cd cdk-cli/cdk && cdk bootstrap
```

Run Paisley initial setup
```
npx paisley start 
```
Then follow the instructions on-screen.
Note that user input will be required in-between the various stages.
- Please make note of the public IP address of your deployed Paisley server


## Admin - View the Dashboard

Visit the EC2's public IP address in your browser. If you need a reminder of the IP, use:
```
npx paisley check-env
```


## Admin - Teardown
To tear down all deployed AWS infrastructure
```
npx paisley destroy
```
