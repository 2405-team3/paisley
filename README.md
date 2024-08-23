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
cd cdk-cli && npm install --prefix cdk && npm install --prefix cli
```


use CLI to set env variables and deploy your AWS infra
(should be able to use `npm run paisley env` or `npm run paisley deploy`)
```
cd /cli
node cdk_cli.js env
node cdk_cli.js deploy
```
keep note of endpoints and IPs printed after deployment



update ec2 env variables
```
bash update_env.sh
```



use scp to copy local CLI-created .env file into ~/db
```
scp -ri [local aws pem key path] [local .env path] ubuntu@[EC2 IP]:~/db/.env
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
```
cd ~/db && pipenv shell
```




get global-bundle.pem for docdb
```
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```


setup postgres
```
bash ~/db/setup_scripts/setup_postgres.sh
```


Now DBs should be connected. Optionally test DocDB with:
```
python ~/db/util/list_mongo.py
```


Copy `celery.service` and `test.service` to `/etc/systemd/system`
```
sudo cp ~/db/systemd/celery.service ~/db/systemd/test.service /etc/systemd/system && sudo systemctl daemon-reload
```


celery.service and test.service should now be runnable with (need to test with fresh instance)
```
sudo systemctl start test.service
sudo systemctl start celery.service
```


...

- test pipenv --venv thing from start_server in start_celery
- test server/celery
- auto build SPA?

...


destroy current deployment (from root folder, ie /ec23):
```
cdk destroy
```
