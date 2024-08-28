import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import { ConfigProps } from "./config";
// import * as fs from 'fs'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as dotenv from 'dotenv';
import * as path from 'path';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as rds from 'aws-cdk-lib/aws-rds';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// type AwsEnvStackProps = cdk.StackProps & {
//   config: Readonly<ConfigProps>;
// };

type AwsEnvStackProps = cdk.StackProps

const INSTANCE_NUM = process.env.AWS_IDENTIFIER || 'PAISLEY'

export class Ec23Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: AwsEnvStackProps) {
    super(scope, id, props);

    // Create a VPC (Virtual Private Cloud)
    const vpc = new ec2.Vpc(this, `CDKVpc-${INSTANCE_NUM}`, {
      maxAzs: 2, // Default is all AZs in the region
    });

    // Create security group
    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      allowAllOutbound: true,
    });

    ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22), // Allow SSH access
      'Allow SSH access from anywhere',
    );

    ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80), // Allow HTTP access
      'Allow HTTP access from anywhere',
    );

    // EC2 instance

    // Define role
    const ec2Role = new iam.Role(this, 'EC2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSQSFullAccess')
      ],
    });

    // Define an Amazon Machine Image (AMI)
    const ubuntuAmi = ec2.MachineImage.lookup({
      name: 'ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*',
      owners: ['099720109477'], // Canonical's AWS account ID
    });

    // Start-up actions (application code)
    const userData = ec2.UserData.forLinux();

    userData.addCommands(
      `echo -e "\n\n\n ----- SUDO APT UPDATE ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'sudo apt update -y > /home/ubuntu/setup.log 2>&1',


      `echo -e "\n\n\n ----- SUDO APT UPGRADE ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'sudo apt upgrade -y >> /home/ubuntu/setup.log 2>&1',


      `echo -e "\n\n\n ----- INSTALL NGINX ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'DEBIAN_FRONTEND=noninteractive sudo apt -y install nginx >> /home/ubuntu/setup.log 2>&1',
      
      
      `echo -e "\n\n\n ----- INSTALL PYTHON3.10 ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'DEBIAN_FRONTEND=noninteractive sudo apt install -y python3.10 python3-pip -y >> /home/ubuntu/setup.log 2>&1',
      

      `echo -e "\n\n\n ----- GIT CLONE ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      // 'git clone https://github.com/paisley-rag/db /home/ubuntu/db >> /home/ubuntu/setup.log 2>&1',
      'git clone -b fix/cdk2 https://github.com/paisley-rag/db /home/ubuntu/db >> /home/ubuntu/setup.log 2>&1',
      'while [ ! -d /home/ubuntu/db ]; do sleep 1; done', // Check if the directory /home/ubuntu/db exists before running the next commands


      `echo -e "\n\n\n ----- CHMOD DB ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'sudo chmod -R a+rw /home/ubuntu/db >> /home/ubuntu/setup.log 2>&1',
      

      `echo -e "\n\n\n ----- SUDO APT INSTALL PYTHON3-PIP ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'DEBIAN_FRONTEND=noninteractive sudo apt install -y python3-pip >> /home/ubuntu/setup.log 2>&1',
      

      `echo -e "\n\n\n ----- UPGRADING PIP ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'pip install --upgrade pip >> /home/ubuntu/setup.log 2>&1', // Upgrade pip


      `echo -e "\n\n\n ----- PIP INSTALL PIPENV ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'DEBIAN_FRONTEND=noninteractive pip install pipenv >> /home/ubuntu/setup.log 2>&1',
      

      `echo -e "\n\n\n ----- PIPENV --PYTHON ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'DEBIAN_FRONTEND=noninteractive pipenv --python /usr/bin/python3 >> /home/ubuntu/setup.log 2>&1',
      

      `echo -e "\n\n\n ----- SETTING ENVIRONMENT VARIABLES ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'echo "export PIPENV_PATH=$(which pipenv)" >> /home/ubuntu/.profile',
      'echo "export PIPENV_PIPFILE=/home/ubuntu/db/Pipfile" >> /home/ubuntu/.profile',
      'source ~/.profile',

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

      
      `echo -e "\n\n\n ----- TRYING PIPENV INSTALL AGAIN ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
      'export PYTHONPATH=$(pipenv --venv)/bin >> /home/ubuntu/setup.log 2>&1',
      'pipenv install --verbose >> /home/ubuntu/setup.log 2>&1',

      `echo -e "\n\n\n ----- EC2 USER DATA COMMANDS COMPLETED, PLEASE RUN PIPENV INSTALL IN EC2 ----- \n\n\n" >> /home/ubuntu/setup.log 2>&1`,
    )

    const keyPair = ec2.KeyPair.fromKeyPairAttributes(this, 'KeyPair', {
      keyPairName: process.env.AWS_KEY_PAIR_NAME || '',
      type: ec2.KeyPairType.RSA,
    })

    // Create an EC2 instance
    const instance = new ec2.Instance(this, `CDKEC2-${INSTANCE_NUM}`, {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MEDIUM),
      machineImage: ubuntuAmi, 
      securityGroup: ec2SecurityGroup,
      role: ec2Role,
      keyPair: keyPair,
      userData,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC, // Ensure the instance is deployed in a public subnet
      },
      associatePublicIpAddress: true,
      blockDevices: [
        {
            deviceName: '/dev/sda1',
            volume: ec2.BlockDeviceVolume.ebs(25), // Set the volume size to 25GB
        }
      ],// Ensure the instance gets a public IP address
    });

    // output the instance public DNS
    new cdk.CfnOutput(this, 'InstancePublicDNS', {
      value: instance.instancePublicDnsName,
    });

    // Output the instance public IP
    new cdk.CfnOutput(this, 'InstancePublicIP', {
      value: instance.instancePublicIp,
    });

    const docDbSecurityGroup = new ec2.SecurityGroup(this, 'DocDbSecurityGroup', {
      vpc,
    });

    docDbSecurityGroup.addIngressRule(
      ec2SecurityGroup, ec2.Port.tcp(27017)
    )

    // docdb cluster
    const docdbCluster = new docdb.DatabaseCluster(this, `CDKDocDBCluster-${INSTANCE_NUM}`, {
      masterUser: { 
        username: process.env.MONGO_USERNAME || 'docdbadmin',
        password: cdk.SecretValue.unsafePlainText(process.env.MONGO_PASSWORD || 'docdbadmin')
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.R5, ec2.InstanceSize.LARGE),
      vpc,
      securityGroup: docDbSecurityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, 'DocumentDBEndpoint', {
      value: docdbCluster.clusterEndpoint.hostname,
    });

    


    // below is untested
    const rdsSecurityGroup = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
      vpc,
    });

    rdsSecurityGroup.addIngressRule(
      ec2SecurityGroup, ec2.Port.tcp(5432), 'Allow PostgreSQL access from EC2 security group'
    );

    const rdsInstance = new rds.DatabaseInstance(this, `CDKRDSInstance-${INSTANCE_NUM}`, {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      vpc,
      securityGroups: [rdsSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      credentials: rds.Credentials.fromPassword('postgres', cdk.SecretValue.unsafePlainText(process.env.PG_ADMINPW || 'pgadminpw')),
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      publiclyAccessible: false,
    });

    new cdk.CfnOutput(this, 'RDSInstanceEndpoint', {
      value: rdsInstance.instanceEndpoint.hostname,
    });
  }
}
