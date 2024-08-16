# Ben notes:

build new deployment (from root folder, ie /ec23):
```
npm run build
cdk synth
cdk deploy
```

ssh into EC2 using Public IPv4 address
```
cd ~/db && pipenv install
```

use scp to copy .env file into ~/db
```
scp -ri [local aws pem key path] [local .env path] ubuntu@[EC2 IP]:~/db/.env
```

add .env variables
```
MONGO_URI=mongodb://[DocDB username]:[DocDB password]@[Ec23Stack.DocumentDBEndpoint]:27017/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
PG_HOST=[Ec23Stack.RDSInstanceEndpoint]
```


run pg setup script; copy PG_ADMINPW in preparation
```
bash ~/db/setup_scripts/setup_postgres.sh
```

Now DBs should be connected. Test DocDB with `~/db/util/list_mongo.py` or `~/db/util/list_mongo.py`.




destroy current deployment (from root folder, ie /ec23):
```
cdk destroy
```

Current issues:
- pipenv install appears to be running via CDK script (`userData.addCommands` block), but dependencies aren't being installed
- however, when CDK deployment finishes, manually going to `~/db` and running `pipenv install` works without issue. 
	- No permissions issues just a script vs manual issue... hm.

- Environment variables are loaded into the CDK stack, but don't make their way into an .env file within the EC2 instance
	- Information is passed in, but needs to be plugged into some sort of file creation for .env (or a setting I missed).
		- Further reading: https://docs.aws.amazon.com/cdk/v2/guide/environments.html

# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
