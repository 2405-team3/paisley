import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

const ENV_VARIABLES = [
  {
    type: 'input',
    name: 'OPENAI_API_KEY',
    message: 'Enter your OPENAI API key:',
  },
  {
    type: 'input',
    name: 'LLAMA_CLOUD_API_KEY',
    message: 'Enter your LLAMA Cloud API key:',
  },
  {
    type: 'input',
    name: 'AWS_IDENTIFIER',
    message: 'Enter an identifier to be included in deployed AWS infrastructure:',
  },
  {
    type: 'input',
    name: 'PG_DATABASE',
    message: 'Select a database name for your PostgreSQL RDS:',
  },
  {
    type: 'input',
    name: 'PG_ADMINPW',
    message: 'Select an admin password for your PostgreSQL RDS:',
  },
  {
    type: 'input',
    name: 'PG_USER',
    message: 'Select a username for your PostgreSQL RDS:',
  },
  {
    type: 'input',
    name: 'PG_PASSWORD',
    message: 'Select a password for your PostgreSQL RDS:',
  },
  {
    type: 'input',
    name: 'MONGO_USERNAME',
    message: 'Select a username for your MongoDB DocDB:',
  },
  {
    type: 'input',
    name: 'MONGO_PASSWORD',
    message: 'Select a password for your MongoDB Password:',
  },
  {
    type: 'input',
    name: 'AWS_KEY_PAIR_NAME',
    message: 'Select the name of the AWS key pair you will use:',
  },
  {
    type: 'input',
    name: 'AWS_PEM_PATH',
    message: 'Enter the path to your AWS pem key file:',
  },
];

async function writeToEnv(content) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const envFilePath = path.resolve(__dirname, '../.env')
  console.log('writeToEnv WITH ENV PATH:', envFilePath)
  dotenv.config({ path: envFilePath, override: true });

  if (fs.existsSync(envFilePath)) {
    fs.appendFileSync(envFilePath, `\n${content.trim()}`);
  } else {
    fs.writeFileSync(envFilePath, content.trim());
  }
  console.log('.env file created and environment variables set.');
}

export async function setEnv() {
  let userVariables = await inquirer.prompt(ENV_VARIABLES);
  /// Create .env file content
  const content = 
    `OPENAI_API_KEY=${userVariables.OPENAI_API_KEY}\n` +
    `LLAMA_CLOUD_API_KEY=${userVariables.LLAMA_CLOUD_API_KEY}\n` +
    `AWS_IDENTIFIER=${userVariables.AWS_IDENTIFIER}\n` +
    `PG_ADMINPW=${userVariables.PG_ADMINPW}\n` +
    `PG_DATABASE=${userVariables.PG_DATABASE}\n` +
    `PG_USER=${userVariables.PG_USER}\n` +
    `PG_PASSWORD=${userVariables.PG_PASSWORD}\n` +
    `PG_ADMIN=postgres\n` +
    `PG_PORT=5432\n` +
    `MONGO_USERNAME=${userVariables.MONGO_USERNAME}\n` +
    `MONGO_PASSWORD=${userVariables.MONGO_PASSWORD}\n` +
    `AWS_KEY_PAIR_NAME=${userVariables.AWS_KEY_PAIR_NAME}\n` +
    `AWS_PEM_PATH=${userVariables.AWS_PEM_PATH}\n` +
    `DOCDB_NAME=simple\n` +
    `DOCDB_COLLECTION=simple\n` +
    `CONFIG_DB=configs\n` +
    `CONFIG_KB_COL=config_kb\n` +
    `CONFIG_PIPELINE_COL=config_pipeline\n` +
    `CONFIG_API_COL=config_api\n` +
    `\n`;

  writeToEnv(content)
}

async function updateEnv() {
  // update .env with CDK-created values
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const updateEnvScriptPath = path.resolve(__dirname, 'update_env.sh');
  console.log('UPDATE ENV SCRIPT PATH:', updateEnvScriptPath)
  const updateEnvProcess = spawn('bash', [updateEnvScriptPath], { stdio: 'inherit' });

  return new Promise((resolve, reject) => {
    updateEnvProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`update_env.sh script failed with code ${code}`);
        reject(new Error(`update_env.sh script failed with code ${code}`));
      } else {
        console.log('update_env.sh script executed successfully');
        resolve();
      }
    });
  });
}

export async function copyEnv() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const envFilePath = path.resolve(__dirname, '../.env')
  console.log('COPY ENV WITH ENV PATH:', envFilePath)
  dotenv.config({ path: envFilePath, override: true });

  if (!process.env.PUBLIC_IP) {
    console.error('PUBLIC_IP environment variable is not set.');
    process.exit(1);
  }
  console.log('PUBLIC_IP:', process.env.PUBLIC_IP)
  
  if (!process.env.AWS_PEM_PATH) {
    console.error('AWS_PEM_PATH environment variable is not set. Please run \'env\' first.');
    process.exit(1);
  }
  console.log('AWS_PEM_PATH:', process.env.AWS_PEM_PATH)

  const scpCommand = `scp -ri ${process.env.AWS_PEM_PATH} ${envFilePath} ubuntu@${process.env.PUBLIC_IP}:~/db/.env`;

  const scpProcess = spawn('bash', ['-c', scpCommand], { stdio: 'inherit' });
  
  return new Promise((resolve, reject) => {
    scpProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`SCP command failed with code ${code}`);
        reject(new Error(`update_env.sh script failed with code ${code}`));
      } else {
        console.log('SCP command executed successfully');
        resolve();
      }
    });
  })
}

export async function deployCDK(cmdObj) {
  // deploy CDK
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const cdkAppPath = path.resolve(__dirname, '../cdk/ec23');

  let cdkCommand = ['deploy']
  if (cmdObj.verbose) {
    cdkCommand.push('--verbose')
  }

  const deployProcess = spawn('cdk', cdkCommand, { cwd: cdkAppPath, stdio: 'inherit' });

  deployProcess.on('exit', async (code) => {
    if (code !== 0) {
      console.error(`CDK deployment failed with code ${code}`);
    } else {
      console.log('CDK deployment succeeded');
      await updateEnv()
    }
  });
}

export async function destroyCDK(cmdObj) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const cdkAppPath = path.resolve(__dirname, '../cdk/ec23');

  let cdkCommand = ['destroy']
  if (cmdObj.verbose) {
    cdkCommand.push('--verbose')
  }

  const destroyProcess = spawn('cdk', cdkCommand, { cwd: cdkAppPath, stdio: 'inherit' });

  destroyProcess.on('exit', async (code) => {
    if (code !== 0) {
      console.error(`Failed to destroy CDK with code ${code}`);
    } else {
      console.log('CDK successfully destroyed');
    }
  });
}



export async function ssh() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const envFilePath = path.resolve(__dirname, '../.env')
  console.log('SSH WITH ENV PATH:', envFilePath)
  dotenv.config({ path: envFilePath, override: true });

  if (!process.env.PUBLIC_IP) {
    console.error('PUBLIC_IP environment variable is not set.');
    process.exit(1);
  }
  console.log('PUBLIC_IP:', process.env.PUBLIC_IP)

  if (!process.env.AWS_PEM_PATH) {
    console.error('AWS_PEM_PATH environment variable is not set. Please run \'env\' first.');
    process.exit(1);
  }
  console.log('AWS_PEM_PATH:', process.env.AWS_PEM_PATH)

  const sshCommand = `ssh -i ${process.env.AWS_PEM_PATH} ubuntu@${process.env.PUBLIC_IP}`;

  const sshProcess = spawn('bash', ['-c', sshCommand], { stdio: 'inherit' });
}