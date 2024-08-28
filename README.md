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
git clone https://github.com/paisley-rag/cdk-cli
```

Install dependencies
```
cd cdk-cli
npm install --prefix cdk cli cdk/ec23
```

Globally install Paisley CLI package
```
cd cli && npm install -g .
```


Set your environment variables to store in a generated `.env` file
```
paisley env
```

## Deployment
Deploy the Paisley CDK stack on your AWS infrastructure (keep note of endpoints and IPs printed after deployment)
```
paisley deploy
```


Copy generated `.env` file to your new EC2 instance
```
paisley copy-env
```

SSH into your EC2
```
paisley ssh
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

## Admin - Building the UI

Building the UI requires `nvm` and `vite`.

Install `nvm`
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```

Restart terminal. SSH back into your EC2 using `paisley ssh`.


Download and install Node.js
```
nvm install 20
```

verify install
```
node -v && npm -v
```

Install vite
```
cd ~/db/ui && npm install vite --save-dev
```

Builds the UI, deletes the old build if it exists, and replaces with new build.
```
bash ~/db/setup_scripts/build_ui.sh
```

## Admin - Starting the Server

Start the backend server
```
sudo systemctl start test.service
```

Start Celery's task queue
```
sudo systemctl start celery.service
```

To test that either service is running, use `sudo systemctl status test.service` or `sudo systemctl status celery.service`.

To stop either service, use `sudo systemctl stop test.service` or `sudo systemctl stop celery.service`.


## Admin - View the Dashboard

Visit the EC2's public IP address in your browser. If you need a reminder, use:
```
grep 'PUBLIC_IP' ~/db/.env
```
from within your EC2.


## Admin - Teardown

From `/cdk-cli/cli` on your local machine, use:
```
paisley destroy
```