# paisley

The following is simply a list of steps that have worked so far, if you see any redundancies let's address them before pushing as much of this to scripts/CLI as possible

install aws-cdk and configure if not already done
```
npm install -g aws-cdk
aws configure
```

clone cdk & cli
```
git clone https://github.com/paisley-rag/cdk-cli
```

npm install (can this just be done once from the root folder..?)
```
cd /cdk-cli/cdk && npm install
cd /cdk-cli/cli && npm install
```

use CLI to set env variables and deploy your AWS infra
```
cd /cli
node cdk_cli.js env
node cdk_cli.js deploy
```
keep note of endpoints and IPs printed after deployment


update
```
bash update_env.sh
```

ssh into EC2 using Public IPv4 address
```
ssh -i [local aws pem key path] ubuntu@[EC2 IP]
```

install pipenv dependencies
```
cd ~/db && pipenv install --verbose
```

start shell
``
pipenv shell
```

use scp to copy local CLI-created .env file into ~/db
```
scp -ri [local aws pem key path] [local .env path] ubuntu@[EC2 IP]:~/db/.env
```

get global-bundle.pem for docdb
```
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

setup postgres
```
bash ~/db/setup_scripts/setup_postgres.sh
```

Now DBs should be connected. Test DocDB with:
```
~/db/util/list_mongo.py
```

Copy `~/db/systemd/celery.service` and `~/db/systemd/test.service` to `/etc/systemd/system`
```
sudo cp ~/db/systemd/celery.service ~/db/systemd/test.service /etc/systemd/system && sudo systemctl daemon-reload
```


NEXT STEP IS TO CHANGE CELERY.SERVICE AND TEST.SERVICE (NTS SHOULD RENAME LATER) TO USE DYNAMIC PATHING WITH NEW EC2

nts
`sudo systemctl start/status/stop xxx.service`

nts
see last ai chat for workaround to create a shell script sourcing from .env that starts the celery worker, then using that script in `celery.service` like:
`ExecStart=/home/ubuntu/start_celery.sh`

....

more to complete

....




destroy current deployment (from root folder, ie /ec23):
```
cdk destroy
```
