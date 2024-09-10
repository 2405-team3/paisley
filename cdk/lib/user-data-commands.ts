interface UserDataCommands {
  [key: string]: string[]
}

export const userDataCommands: UserDataCommands = {

  "s1update": [
    `echo -e "\n\n\n ----- SUDO APT UPDATE ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
    'sudo apt update -y > /home/ubuntu/setup.log 2>&1',


    `echo -e "\n\n\n ----- SUDO APT UPGRADE ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
    'sudo apt upgrade -y >> /home/ubuntu/setup.log 2>&1',
  ],

  "s2nginx": [
    `echo -e "\n\n\n ----- INSTALL NGINX ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
    'DEBIAN_FRONTEND=noninteractive sudo apt -y install nginx >> /home/ubuntu/setup.log 2>&1',
  ],

  "s3gitclone": [
    `echo -e "\n\n\n ----- GIT CLONE ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
    // *****  Note specific branch is being pulled here
    'git clone https://github.com/paisley-rag/app /home/ubuntu/db >> /home/ubuntu/setup.log 2>&1',
    // 'git clone https://github.com/paisley-rag/app --branch fix/for-cdk-cli /home/ubuntu/db >> /home/ubuntu/setup.log 2>&1',
    'while [ ! -d /home/ubuntu/db ]; do sleep 1; done', // Check if the directory /home/ubuntu/db exists before running the next commands

    `echo -e "\n\n\n ----- CHMOD DB ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
    'sudo chmod -R a+rw /home/ubuntu/db >> /home/ubuntu/setup.log 2>&1',
  ],

  "s4python": [
    `echo -e "\n\n\n ----- INSTALL PYTHON3.10 ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
    'DEBIAN_FRONTEND=noninteractive sudo apt install -y python3.10 python3-pip python3.10-venv >> /home/ubuntu/setup.log 2>&1',

    `echo -e "\n\n\n ----- CREATE VIRTUAL ENVIRONMENT ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
    'python3 -m venv /home/ubuntu/venv >> /home/ubuntu/setup.log 2>&1',
    'source /home/ubuntu/venv/bin/activate >> /home/ubuntu/setup.log 2>&1',
  ],

  "s5requirements": [
    `echo -e "\n\n\n ----- INSTALL REQUIREMENTS ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
    '/home/ubuntu/venv/bin/pip install -r /home/ubuntu/db/requirements.txt >> /home/ubuntu/setup.log 2>&1',
  ],

  // "s6nvm" : [
  //   `echo -e "\n\n\n ----- INSTALL NVM / VITE ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
  //   'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash >> /home/ubuntu/setup.log 2>&1',
  // ]
};


export const extraCommands = [

  // `echo -e "\n\n\n ----- SUDO APT INSTALL PYTHON3-PIP ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
  // 'DEBIAN_FRONTEND=noninteractive sudo apt install -y python3-pip >> /home/ubuntu/setup.log 2>&1',


  // `echo -e "\n\n\n ----- UPGRADING PIP ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
  // `pip install --upgrade pip >> /home/ubuntu/setup.log 2>&1`, // Upgrade pip


  // `echo -e "\n\n\n ----- PIP INSTALL PIPENV ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
  // `DEBIAN_FRONTEND=noninteractive pip install pipenv >> /home/ubuntu/setup.log 2>&1`,


  // `echo -e "\n\n\n ----- PIPENV --PYTHON ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
  // `DEBIAN_FRONTEND=noninteractive pipenv --python /usr/bin/python3 >> /home/ubuntu/setup.log 2>&1`,


  // `echo -e "\n\n\n ----- SETTING ENVIRONMENT VARIABLES ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
  // 'echo "export PIPENV_PATH=$(which pipenv)" >> /home/ubuntu/.profile',
  // 'echo "export PIPENV_PIPFILE=/home/ubuntu/db/Pipfile" >> /home/ubuntu/.profile',
  // 'source ~/.profile',

  // can't get this to work for some reason; pipenv install runs but dependencies aren't
  // available unless pipenv install is run again manually after ssh'ing. 
  // going to try to push this logic to 'cdk_finish.sh' and see what happens.
  // `echo -e "\n\n\n ----- PIPENV INSTALL ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
  // 'cd /home/ubuntu/db',
  // '$(which pipenv) install --verbose >> /home/ubuntu/setup.log 2>&1',

  // also didn't work; leaving `pipenv install` as manual step for user
  // `echo -e "\n\n\n ----- CHMOD AND RUN CDK_FINISH.SH ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
  // 'chmod +x /home/ubuntu/db/setup_scripts/cdk_finish.sh >> /home/ubuntu/setup.log 2>&1',
  // '/home/ubuntu/db/setup_scripts/cdk_finish.sh >> /home/ubuntu/setup.log 2>&1',

  // also didn't work; no pymongo?
  // `echo -e "\n\n\n ----- TRYING PIPENV INSTALL AGAIN ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
  // 'export PYTHONPATH=$(pipenv --venv)/bin >> /home/ubuntu/setup.log 2>&1',
  // 'pipenv install --verbose >> /home/ubuntu/setup.log 2>&1',

  // `echo -e "\n\n\n ----- PIPENV INSTALL ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
  // 'cd /home/ubuntu/db && pipenv run pip install requirements.txt',
  // `echo -e "\n changing permissions - chmod \n" >> /home/ubuntu/setup.log 2>&1`,
  // 'chmod +x /home/ubuntu/db/setup_scripts/debug_pipenv.sh >> /home/ubuntu/setup.log 2>&1',
  // `echo -e "\n executing script: debug_pipenv.sh \n" >> /home/ubuntu/setup.log 2>&1`,
  // `/home/ubuntu/db/setup_scripts/debug_pipenv.sh`,

  // `echo -e "\n executing pipenv install \n" >> /home/ubuntu/setup.log 2>&1`,
  // `su -c 'PIPENV_PIPFILE=/home/ubuntu/db/Pipfile pipenv install --verbose' ubuntu >> /home/ubuntu/setup.log 2>&1`,
  // `echo -e "\n\n\n ----- PIPENV INSTALL finished ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
];

