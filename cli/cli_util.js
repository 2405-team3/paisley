import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import ENV_VARIABLES from './env_variable_prompts.js';
import dotenv from 'dotenv';

function pathFromCurrentDir(relativePath) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return path.resolve(__dirname, relativePath)
}

function envPath() {
  return pathFromCurrentDir('../.env')
}

function checkIPandPemPath() {
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
}

async function writeToEnv(content) {
  const envFilePath = envPath();
  dotenv.config({ path: envFilePath, override: true });

  if (fs.existsSync(envFilePath)) {
    fs.appendFileSync(envFilePath, `\n${content.trim()}`);
  } else {
    fs.writeFileSync(envFilePath, content.trim());
  }
  console.log('.env file created and environment variables set.');
}

async function overWriteExistingEnv() {
  const envFilePath = envPath();
  if (fs.existsSync(envFilePath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: '.env file already exists. Do you want to overwrite it?',
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log('Operation cancelled by the user.');
      return;
    } else {
      fs.writeFileSync(envFilePath, '');
    }
  }
}

export async function setEnv() {
  await overWriteExistingEnv()
  
  // prompt for new variables
  let userVariables = await inquirer.prompt(ENV_VARIABLES);
  userVariables = Object.entries(userVariables).map(([key, value]) => `${key}=${value}`)

  // append non-user variables
  const allVariables = 
    userVariables.join('\n') + '\n' +
    `PG_ADMIN=postgres\n` +
    `PG_PORT=5432\n` +
    `DOCDB_NAME=simple\n` +
    `DOCDB_COLLECTION=simple\n` +
    `CONFIG_DB=configs\n` +
    `CONFIG_KB_COL=config_kb\n` +
    `CONFIG_PIPELINE_COL=config_pipeline\n` +
    `CONFIG_API_COL=config_api\n` +
    `\n`;

  writeToEnv(allVariables)
}

async function updateEnv() {
  // update .env with CDK-created values
  const updateEnvScriptPath = pathFromCurrentDir('update_env.sh');
  const updateEnvProcess = spawn('bash', [updateEnvScriptPath], { stdio: 'inherit' });

  return new Promise((resolve, reject) => {
    updateEnvProcess.on('close', (code) => {
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
  const envFilePath = envPath();
  dotenv.config({ path: envFilePath, override: true });

  checkIPandPemPath()

  const scpCommand = `scp -ri ${process.env.AWS_PEM_PATH} ${envFilePath} ubuntu@${process.env.PUBLIC_IP}:~/db/.env`;
  console.log('SCP COMMAND IN COPYENV IS:', scpCommand)
  const scpProcess = spawn('bash', ['-c', scpCommand], { stdio: 'inherit' });
  
  return new Promise((resolve, reject) => {
    scpProcess.on('close', (code) => {
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
  const cdkAppPath = pathFromCurrentDir('../cdk/paisley');

  let cdkCommand = cmdObj.verbose ? ['deploy', '--verbose'] : ['deploy'];
  const deployProcess = spawn('cdk', cdkCommand, { cwd: cdkAppPath, stdio: 'inherit' });

  deployProcess.on('exit', async (code) => {
    if (code !== 0) {
      console.error(`CDK deployment failed with code ${code}`);
    } else {
      await updateEnv()
      console.log('CDK deployment complete');
    }
  });
}

// Removes PG_HOST, MONGO_URI, S3_BUCKET_NAME, and PUBLIC_IP from .env after destroy
async function cleanEnv() {
  const envFilePath = envPath();

  if (fs.existsSync(envFilePath)) {
    let envContent = fs.readFileSync(envFilePath, 'utf-8');
    const variablesToRemove = ['PG_HOST', 'MONGO_URI', 'S3_BUCKET_NAME', 'PUBLIC_IP', 'SQS_URL'];

    variablesToRemove.forEach(variable => {
      const regex = new RegExp(`^${variable}=.*$`, 'gm');
      envContent = envContent.replace(regex, '');
    });

    // Remove extra newlines
    envContent = envContent.replace(/^\s*[\r\n]/gm, '');

    fs.writeFileSync(envFilePath, envContent, 'utf-8');
    console.log('Environment variables removed successfully');
  } else {
    console.error('.env file does not exist');
  }
}

export async function destroyCDK(cmdObj) {
  const cdkAppPath = pathFromCurrentDir('../cdk/paisley');

  let cdkCommand = cmdObj.verbose ? ['destroy', '--verbose'] : ['destroy'];
  const destroyProcess = spawn('cdk', cdkCommand, { cwd: cdkAppPath, stdio: 'inherit' });

  destroyProcess.on('exit', async (code) => {
    if (code !== 0) {
      console.error(`Failed to destroy CDK with code ${code}`);
    } else {
      await cleanEnv()
      console.log('CDK successfully destroyed');
    }
  });
}



export async function ssh() {
  const envFilePath = envPath();
  dotenv.config({ path: envFilePath, override: true });

  checkIPandPemPath()

  const sshCommand = `ssh -i ${process.env.AWS_PEM_PATH} ubuntu@${process.env.PUBLIC_IP}`;
  const sshProcess = spawn('bash', ['-c', sshCommand], { stdio: 'inherit' });
}