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


npm install
```
cd cdk-cli
npm install --prefix cdk cli cdk/ec23
```

install paisley package globally
```
cd cli && npm install -g .
```


use CLI to set env variables and deploy your AWS infra
```
cd cli
paisley env
paisley deploy
```
keep note of endpoints and IPs printed after deployment

copy env file to EC2
```
paisley copy-env
```

ssh into EC2
```
paisley ssh
```


From within new EC2:

install pipenv dependencies and start shell
```
cd ~/db && pipenv install --verbose && pipenv shell 
```

run setup_ec2.sh
```
bash ~/db/setup_scripts/setup_ec2.sh
```


BUILD UI (involves installing `nvm` and `vite`)
install nvm
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```

restart terminal and ssh back into EC2
```
paisley ssh
```

download and install Node.js
```
nvm install 20
```

verify install
```
node -v && npm -v
```

install vite (this could probably be replaced with `npm install` from `~/db/ui`)
```
cd ~/db/ui && npm install vite --save-dev
```

run build_ui.sh
```
bash ~/db/setup_scripts/build_ui.sh
```

start services:
celery.service and test.service should now be runnable with:
```
sudo systemctl start test.service
```
```
sudo systemctl start celery.service
```

test services are running (type `q` to exit):
```
sudo systemctl status test.service
```
```
sudo systemctl status celery.service
```


visit IP address in browser
to see public ip:
```
grep 'PUBLIC_IP' ~/db/.env
```


destroy current deployment (from local machine, in `cdk-cli/cli`):
```
paisley destroy
```