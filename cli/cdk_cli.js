#!/usr/bin/env node

import { Command } from 'commander';
import {
  setEnv,
  deployCDK,
  destroyCDK,
  copyEnv,
  ssh
} from './cli_util.js';

const program = new Command();

program
  .name('Paisley CLI')
  .description('A CLI tool to manage environment variables and deploy Paisley onto your AWS.')
  .helpOption('-h, --help', 'Display help for command');

program
  .command('env')
  .description('Allows user to set their environment variables and API keys')
  .action(setEnv)

program
  .command('deploy')
  .description('Builds, synthesizes, and deploys Paisley on AWS')
  .action(deployCDK)

program
  .command('destroy')
  .option('-v, --verbose', 'Run cdk destroy --verbose')
  .description('Destroys Paisley AWS infrastructure')
  .action(destroyCDK)

program
  .command('copy-env')
  .description('Updates environment variables with information from created AWS stack')
  .action(copyEnv)

program
  .command('ssh')
  .description('SSH into the new EC2 instance')
  .action(ssh)

program.parse(process.argv);