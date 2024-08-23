#!/usr/bin/env node

// npm install commander
// npm install --save-dev @types/commander
// npm i --save-dev @types/node
// npm install inquirer
// npm install --save-dev @types/inquirer

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

// import { exec } from 'child_process';

const program = new Command();

program
  .name('Paisley CLI')
  .description('A CLI tool to manage environment variables and deploy Paisley onto your AWS.')
  .helpOption('-h, --help', 'Display help for command');

program
  .command('env')
  .description('Allows user to set their OpenAI and LlamaCloud API keys')
  .action(async () => {
    const questions = [
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
    ];

    const answers = await inquirer.prompt(questions);

    /// Create .env file content
    const envContent = 
      `OPENAI_API_KEY=${answers.OPENAI_API_KEY}\n` +
      `LLAMA_CLOUD_API_KEY=${answers.LLAMA_CLOUD_API_KEY}\n` +
      `PG_ADMINPW=${answers.PG_ADMINPW}\n` +
      `PG_DATABASE=${answers.PG_DATABASE}\n` +
      `PG_USER=${answers.PG_USER}\n` +
      `PG_PASSWORD=${answers.PG_PASSWORD}\n` +
      `MONGO_USERNAME=${answers.MONGO_USERNAME}\n` +
      `MONGO_PASSWORD=${answers.MONGO_PASSWORD}\n` +
      `AWS_KEY_PAIR_NAME=${answers.AWS_KEY_PAIR_NAME}\n` +
      `PG_ADMIN=postgres\n` +
      `PG_PORT=5432\n` +
      `CONFIG_DB=configs\n` +
      `CONFIG_KB_COL=config_kb\n` +
      `CONFIG_PIPELINE_COL=config_pipeline\n`;
    
    const envFilePath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envFilePath)) {
      fs.appendFileSync(envFilePath, `\n${envContent.trim()}`);
    } else {
      fs.writeFileSync(envFilePath, envContent.trim());
    }
    console.log('.env file created and environment variables set.');
  });

program
  .command('deploy')
  .description('Builds, synthesizes, and deploys Paisley on AWS')
  .action(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const cdkAppPath = path.resolve(__dirname, '../cdk/ec23');

    const deployProcess = spawn('cdk', ['deploy'], { cwd: cdkAppPath, stdio: 'inherit' });

    deployProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`CDK deployment failed with code ${code}`);
      } else {
        console.log('CDK deployment succeeded');
      }
    });
  });



program.parse(process.argv);