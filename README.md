# Paisley

Paisley is an open-source framework to help IT or engineering teams quickly set up and deploy chatbots that integrate their data. It achieves this through Retrieval-Augmented Generation (RAG).

Our RAG “starter-kit” enables teams to skip some of the research, easily establish knowledge bases, and more quickly deploy and iterate on RAG chatbots.

The following steps will show you how to get started deploying Paisley on your own AWS infrastructure. You will need AWS credentials, Node.js, and npm.

## Setup (for branch fix/consolidate-projects)
Install and configure AWS CDK
```
npm install -g aws-cdk
aws configure
```

Clone the CDK stack and Paisley's CLI
```
git clone https://github.com/paisley-rag/cdk-cli --branch fix/consolidate-projects --single-branch
```

Install dependencies
```
cd cdk-cli && npm install
```

Bootstrap CDK environment (from `cdk-cli/cdk`)
```
cd cdk-cli/cdk && cdk bootstrap
```

Set your environment variables to store in a generated `.env` file
```
npx paisley env
```

## Deployment
Deploy the Paisley CDK stack on your AWS infrastructure (keep note of endpoints and IPs printed after deployment)
```
npx paisley deploy
```


Copy generated `.env` file to your new EC2 instance
```
npx paisley copy-env
```

SSH into your EC2
```
npx paisley ssh
```
You should now be connected to your EC2 in the terminal.


Install pipenv dependencies and start shell
```
cd ~/db && pipenv install --verbose && pipenv shell 
```

Finish provisioning the EC2
```
bash ~/db/setup_scripts/setup_ec2.sh
```

## Check
To test that either service is running, use `sudo systemctl status test.service` or `sudo systemctl status celery.service` (press `q` to exit).

To stop either service, use `sudo systemctl stop test.service` or `sudo systemctl stop celery.service`.


## Admin - View the Dashboard

Visit the EC2's public IP address in your browser. If you need a reminder of the IP, use:
```
grep 'PUBLIC_IP' ~/db/.env
```
from within your EC2.


## Admin - Teardown

From `/cdk-cli/cli` on your local machine, use:
```
npx paisley destroy
```
