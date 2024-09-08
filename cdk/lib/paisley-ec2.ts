import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import { ConfigProps } from "./config";
// import * as fs from 'fs'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
// import * as docdb from 'aws-cdk-lib/aws-docdb';
// import * as rds from 'aws-cdk-lib/aws-rds';
// import * as s3 from 'aws-cdk-lib/aws-s3';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import { userDataCommands } from './user-data-commands';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

// type AwsEnvStackProps = cdk.StackProps & {
//   config: Readonly<ConfigProps>;
// };

type AwsEnvStackProps = cdk.StackProps

const PREFIX = process.env.AWS_IDENTIFIER || 'PAISLEYEC2'

export class PaisleyEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: AwsEnvStackProps) {
    super(scope, id, props);

    // Create a VPC (Virtual Private Cloud)
    const vpc = new ec2.Vpc(this, `${PREFIX}-Ec2-CDKVpc`, {
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
        //     iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSQSFullAccess'),
        //     iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
      ],
    });

    // Define an Amazon Machine Image (AMI)
    const ubuntuAmi = ec2.MachineImage.lookup({
      name: 'ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*',
      owners: ['099720109477'], // Canonical's AWS account ID
    });

    // Start-up actions (application code)
    const userData = ec2.UserData.forLinux();

    userData.addCommands(...userDataCommands["s1update"]);
    userData.addCommands(...userDataCommands["s2nginx"]);
    userData.addCommands(...userDataCommands["s3gitclone"]);
    userData.addCommands(...userDataCommands["s4python"]);
    userData.addCommands(...userDataCommands["s5requirements"]);

    const keyPair = ec2.KeyPair.fromKeyPairAttributes(this, 'KeyPair', {
      keyPairName: process.env.AWS_KEY_PAIR_NAME || '',
      type: ec2.KeyPairType.RSA,
    })

    // Create an EC2 instance
    const instance = new ec2.Instance(this, `${PREFIX}-Ec2-CDKEc2`, {
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

    //     const docDbSecurityGroup = new ec2.SecurityGroup(this, 'DocDbSecurityGroup', {
    //       vpc,
    //     });
    // 
    //     docDbSecurityGroup.addIngressRule(
    //       ec2SecurityGroup, ec2.Port.tcp(27017)
    //     )
    // 
    //     // docdb cluster
    //     const docdbCluster = new docdb.DatabaseCluster(this, `${PREFIX}-Ec2-CDKDocDBCluster`, {
    //       masterUser: {
    //         username: process.env.MONGO_USERNAME || 'docdbadmin',
    //         password: cdk.SecretValue.unsafePlainText(process.env.MONGO_PASSWORD || 'docdbadmin')
    //       },
    //       instanceType: ec2.InstanceType.of(ec2.InstanceClass.R5, ec2.InstanceSize.LARGE),
    //       vpc,
    //       securityGroup: docDbSecurityGroup,
    //       vpcSubnets: {
    //         subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    //       },
    //       removalPolicy: cdk.RemovalPolicy.DESTROY,
    //     });
    // 
    //     new cdk.CfnOutput(this, 'DocumentDBEndpoint', {
    //       value: docdbCluster.clusterEndpoint.hostname,
    //     });
    // 
    // 
    // 
    // 
    //     // below is untested
    //     const rdsSecurityGroup = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
    //       vpc,
    //     });
    // 
    //     rdsSecurityGroup.addIngressRule(
    //       ec2SecurityGroup, ec2.Port.tcp(5432), 'Allow PostgreSQL access from EC2 security group'
    //     );
    // 
    //     const rdsInstance = new rds.DatabaseInstance(this, `${PREFIX}-Ec2-CDKRdsInstance`, {
    //       engine: rds.DatabaseInstanceEngine.postgres({
    //         version: rds.PostgresEngineVersion.VER_13,
    //       }),
    //       instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
    //       vpc,
    //       securityGroups: [rdsSecurityGroup],
    //       vpcSubnets: {
    //         subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    //       },
    //       credentials: rds.Credentials.fromPassword('postgres', cdk.SecretValue.unsafePlainText(process.env.PG_ADMINPW || 'pgadminpw')),
    //       multiAz: false,
    //       allocatedStorage: 20,
    //       maxAllocatedStorage: 100,
    //       allowMajorVersionUpgrade: false,
    //       autoMinorVersionUpgrade: true,
    //       backupRetention: cdk.Duration.days(7),
    //       deleteAutomatedBackups: true,
    //       removalPolicy: cdk.RemovalPolicy.DESTROY,
    //       deletionProtection: false,
    //       publiclyAccessible: false,
    //     });
    // 
    //     new cdk.CfnOutput(this, 'RDSInstanceEndpoint', {
    //       value: rdsInstance.instanceEndpoint.hostname,
    //     });
    // 
    //     // s3
    // 
    //     // Add a Gateway VPC Endpoint for S3
    //     const s3GatewayEndpoint = vpc.addGatewayEndpoint('S3GatewayEndpoint', {
    //       service: ec2.GatewayVpcEndpointAwsService.S3,
    //     });
    // 
    //     const s3Endpoint = new ec2.InterfaceVpcEndpoint(this, 'S3Endpoint', {
    //       vpc,
    //       service: ec2.InterfaceVpcEndpointAwsService.S3,
    //     });
    // 
    //     const bucket = new s3.Bucket(this, `${PREFIX}-Ec2-CDKS3`, {
    //       versioned: true,
    //       removalPolicy: cdk.RemovalPolicy.DESTROY, // Deletes S3 along with stack
    //       autoDeleteObjects: true, // Deletes S3 contents along with self
    //     });
    // 
    //     new cdk.CfnOutput(this, 'S3BucketName', {
    //       value: bucket.bucketName,
    //     });
    // 
    //     // Restrict access to VPC
    //     bucket.addToResourcePolicy(new iam.PolicyStatement({
    //       actions: ['s3:*'],
    //       resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
    //       principals: [new iam.ArnPrincipal('*')], // Consider specifying specific IAM roles or users
    //       conditions: {
    //         StringEquals: {
    //           'aws:SourceVpce': s3Endpoint.vpcEndpointId
    //         }
    //       }
    //     }));
    // 
    //     bucket.node.addDependency(s3GatewayEndpoint);
    // 
    //     // SQS
    //     const queue = new sqs.Queue(this, `${PREFIX}-Ec2-CDKSqs`, {
    //       visibilityTimeout: cdk.Duration.seconds(300),
    //       retentionPeriod: cdk.Duration.days(4),
    //       queueName: `SQSQueuePaisley.fifo`,
    //       fifo: true, // instead of standard
    //       contentBasedDeduplication: true // makes sqs responsible for not duplicating
    //     });
    // 
    //     new cdk.CfnOutput(this, 'SQSURL', {
    //       value: queue.queueUrl,
    //     });
  }
}
