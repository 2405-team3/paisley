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
npm install --prefix cdk && npm install --prefix cli && npm install --prefix cdk/ec23
```


use CLI to set env variables and deploy your AWS infra
(should be able to use `npm run paisley env` or `npm run paisley deploy`)
```
cd cli
node cdk_cli.js env
node cdk_cli.js deploy
```
keep note of endpoints and IPs printed after deployment

copy env file to EC2
```
node cdk_cli.js copy-env
```

ssh into EC2
```
node cdk_cli.js ssh
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
START OF COMMANDS IN `setup_ec2.sh` (DELETE WHEN TESTED AND WORKING)
```
# get global-bundle.pem for docdb
cd ~ && wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# setup postgres
bash ~/db/setup_scripts/setup_postgres.sh

# Copy `celery.service` and `test.service` to `/etc/systemd/system`
sudo cp ~/db/systemd/celery.service ~/db/systemd/test.service /etc/systemd/system && sudo systemctl daemon-reload

# copy `~/db/nginx/default` to `/etc/nginx/sites-enabled` and 
# copy `~/db/nginx/nginx.conf` to `/etc/nginx`

sudo cp ~db/nginx/default /etc/nginx/sites-enabled &&
sudo cp ~/db/nginx/nginx.conf /etc/nginx &&
sudo systemctl reload nginx
```
END OF COMMANDS IN `setup_ec2.sh`


TEST PUTTING THIS PART AT END OF `setup_ec2.sh`
initialize api key db; add first generated API key to .env (additional API key changes must be manual)
```
cd ~ && python ~/db/util/init_api_db.py
```



BUILD UI (involves installing `nvm` and `vite`)
install nvm
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```

restart terminal and ssh back into EC2
```
node cdk_cli.js ssh
```

download and install Node.js
```
nvm install 20
```

verify install
```
node -v && npm -v
```

install vite
```
cd ~/db/ui && npm install vite --save-dev
```

run build_ui.sh
```
bash ~/db/setup_scripts/build_ui.sh
```
START OF COMMANDS IN `build_ui.sh` (DELETE WHEN TESTED AND WORKING)
build front end
```
cd ~/db/ui && npm run build
```

delete old build files (ADD USER CONFIRMATION)
```
sudo rm -rf /var/www/html/assets
sudo rm /var/www/html/index.html
```

move build files
```
sudo mv ~/db/ui/dist/assets /var/www/html
sudo mv ~/db/ui/dist/index.html /var/www/html
```
END OF COMMANDS IN `build_ui.sh`


start services:
NTS: MOVE CHMODS TO `setup_ec2.sh`; WRAP BOTH SERVICES IN `start_services.sh` OR SMTH
celery.service and test.service should now be runnable with:
```
sudo chmod +x /home/ubuntu/db/util/start_server.sh
sudo systemctl start test.service
```
```
sudo chmod +x /home/ubuntu/db/util/start_celery.sh
sudo systemctl start celery.service
```

test services are running:
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
node cdk_cli.js destroy
```
