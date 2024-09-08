import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn, exec, execFile } from 'child_process';
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

function getEnv() {
  const envFilePath = envPath();
  dotenv.config({ path: envFilePath, override: true });
}

export async function pause() {
  console.log('********* Please wait 10 min while completing server setup ************');
  await new Promise(resolve => {
    let num = 0;
    const int = setInterval(()=>{
      num += 1;
      console.log(`${num} min${num > 1 ? 's' : ''} elapsed`);
    }, 60000);
    setTimeout(() => {
      clearInterval(int);
      console.log(`Continuing with Paisley setup\n\n`)
      resolve()
    }, 600000);
  });
}

export async function allSteps() {
  console.log('********* INITIATING "start" STEP ************');
  console.log(' ');
  console.log(' ');
  await setEnv();
  await deployCDK();
  await pause();
  await copyEnv();
  await setupEc2();
}

export async function deployCDK() {
  console.log('********* INITIATING "deploy" STEP ************');
  return new Promise((res, rej) => {
    const cdkAppPath = pathFromCurrentDir('../cdk/');
    console.log('deployCDK:  ', cdkAppPath);
    const deployProcess = spawn('cdk', ['deploy'], { cwd: cdkAppPath, stdio: 'inherit' });

    deployProcess.on('error', (error) => {
        console.error(`CDK deployment failed with error: ${error.message}`);
        rej(new Error(error.message));
    });

    deployProcess.on('close', async (code) => {
        await updateEnv();
        console.log(`CDK deployment complete\n\n`);
        console.log(` `);
        res('CDK deployment complete');
    });
  });
}

export async function checkIPandPemPath() {
  getEnv();
  console.log('checkIPandPemPath', process.env.PUBLIC_IP);

  if (!process.env.PUBLIC_IP) {
    console.error('PUBLIC_IP environment variable is not set.');
    process.exit(1);
  }
  console.log('PUBLIC_IP:', process.env.PUBLIC_IP)

  if (!process.env.AWS_PEM_PATH) {
    console.error('AWS_PEM_PATH environment variable is not set. Please run \'env\' first.');
    process.exit(1);
  }
  console.log('AWS_PEM_PATH:', process.env.AWS_PEM_PATH, '\n');
}

async function writeToEnv(content) {
  const envFilePath = envPath();

  if (fs.existsSync(envFilePath)) {
    fs.appendFileSync(envFilePath, `\n${content.trim()}`);
  } else {
    fs.writeFileSync(envFilePath, content.trim());
  }
  console.log(`.env file created and environment variables set.\n\n`);
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
      console.log(`No changes to existing .env made\n\n`);
      return false;
    } else {
      fs.writeFileSync(envFilePath, '');
      return true;
    }
  }
}

export async function setEnv() {
  console.log('********* INITIATING "env" STEP ************');

  let overwrite = await overWriteExistingEnv();
  if (!overwrite) return;

  // prompt for new variables
  let userVariables = await inquirer.prompt(ENV_VARIABLES);

  let username = { 'USERNAME': '' };
  while (!username['USERNAME'] || username['USERNAME'] === 'admin') {
    username = await inquirer.prompt([
      {
        type: 'input',
        name: 'USERNAME',
        message: 'Select a username for Paisley (not admin):',
      }
    ]);
  }

  userVariables['PAISLEY_ADMIN_USERNAME'] = username['USERNAME'];
  userVariables['PG_USER'] = username['USERNAME'];
  userVariables['MONGO_USERNAME'] = username['USERNAME'];

  let masterPw = { 'MASTER_PW': '' };
  while (masterPw['MASTER_PW'].length < 8) {
    masterPw = await inquirer.prompt([
      {
        type: 'password',
        name: 'MASTER_PW',
        message: 'Select a password for all databases (minimum 8 characters):',
      }
    ]);
  };
  userVariables['PAISLEY_ADMIN_PASSWORD'] = masterPw['MASTER_PW'];
  userVariables['PG_ADMINPW'] = masterPw['MASTER_PW'];
  userVariables['MONGO_PASSWORD'] = masterPw['MASTER_PW'];

  userVariables = Object.entries(userVariables).map(([key, value]) => `${key}=${value}`)
  // append non-user variables
  const allVariables =
    userVariables.join('\n') + '\n' +
    `PG_DATABASE=paisley\n` +
    `PG_ADMIN=postgres\n` +
    `PG_PORT=5432\n` +
    `DOCDB_NAME=simple\n` +
    `DOCDB_COLLECTION=simple\n` +
    `CONFIG_DB=configs\n` +
    `CONFIG_KB_COL=config_kb\n` +
    `CONFIG_PIPELINE_COL=config_pipeline\n` +
    `CONFIG_API_COL=config_api\n` +
    `\n`;

  await writeToEnv(allVariables);
  console.log(`New variables for .env set\n\n`)
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
        console.log(`AWS infrastructure variables set in .env successfully\n\n`);
        resolve();
      }
    });
  });
}

export async function copyEnv() {
  console.log('********* INITIATING "copy-env" STEP ************');
  await updateEnv();
  console.log('env updated with recently deployed config');

  getEnv();
  const envFilePath = envPath();

  await checkIPandPemPath()

  const scpCommand = `scp -ri ${process.env.AWS_PEM_PATH} ${envFilePath} ubuntu@${process.env.PUBLIC_IP}:~/db/.env`;
  console.log('SCP COMMAND IN COPYENV IS:', scpCommand)
  const scpProcess = spawn('bash', ['-c', scpCommand], { stdio: 'inherit' });

  return new Promise((resolve, reject) => {
    scpProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`SCP command failed with code ${code}\n\n`);
        reject(new Error(`update_env.sh script failed with code ${code}`));
      } else {
        console.log(`SCP command executed successfully\n\n`);
        resolve();
      }
    });
  })
}

export async function setupEc2() {
  console.log('********* INITIATING "initiate" STEP ************');
  getEnv();

  const setupEc2ScriptPath = pathFromCurrentDir('setup_ec2.sh');
  const command = `ssh -i ${process.env.AWS_PEM_PATH} ubuntu@${process.env.PUBLIC_IP} 'bash -s' < ${setupEc2ScriptPath}`;
  console.log('setupEc2 command:', command);
  const scriptProcess = spawn('bash', ['-c', command], { stdio: 'inherit' });

  return new Promise((res, rej) => {
    scriptProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`initiate step failed with code ${code}\n\n`);
        rej(new Error(`initiate script (setup_ec2.sh) failed with code ${code}`));
      } else {
        console.log(`initiate script (setup_ec2.sh) executed successfully\n\n`);
        res();
      }
    });
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
    console.log(`AWS environment variables removed from .env successfully\n\n`);
  } else {
    console.error(`.env file does not exist\n\n`);
  }
}

export async function destroyCDK() {
  console.log('********* INITIATING "destroy" STEP ************');
  const cdkAppPath = pathFromCurrentDir('../cdk/');

  const destroyProcess = spawn('cdk', ['destroy'], { cwd: cdkAppPath, stdio: 'inherit' });

  destroyProcess.on('error', (error) => {
      console.error(`CDK tear down failed with error: ${error.message}\n\n`);
  });

  destroyProcess.on('close', async (code) => {
      await cleanEnv();
      console.log(`CDK tear down complete with code ${code}\n\n`);
  });
}



export async function ssh() {
  const envFilePath = envPath();
  dotenv.config({ path: envFilePath, override: true });

  await checkIPandPemPath()

  const sshCommand = `ssh -i ${process.env.AWS_PEM_PATH} ubuntu@${process.env.PUBLIC_IP}`;
  const sshProcess = spawn('bash', ['-c', sshCommand], { stdio: 'inherit' });
}
