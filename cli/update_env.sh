#!/bin/bash

# Source the .env file to load existing environment variables, ignoring comments and empty lines
if [ -f .env ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

# Run the AWS CLI command and store the output in a variable
INSTANCE_PUBLIC_DNS=$(aws cloudformation describe-stacks --stack-name Ec23Stack --query "Stacks[0].Outputs[?OutputKey=='InstancePublicDNS'].OutputValue" --output text)
DOCUMENT_DB_ENDPOINT=$(aws cloudformation describe-stacks --stack-name Ec23Stack --query "Stacks[0].Outputs[?OutputKey=='DocumentDBEndpoint'].OutputValue" --output text)
RDS_INSTANCE_ENDPOINT=$(aws cloudformation describe-stacks --stack-name Ec23Stack --query "Stacks[0].Outputs[?OutputKey=='RDSInstanceEndpoint'].OutputValue" --output text)
INSTANCE_PUBLIC_IP=$(aws cloudformation describe-stacks --stack-name Ec23Stack --query "Stacks[0].Outputs[?OutputKey=='InstancePublicIP'].OutputValue" --output text)
MONGO_URI="mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${DOCUMENT_DB_ENDPOINT}:27017/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"

# Write the output to the .env file
echo "PG_HOST=$RDS_INSTANCE_ENDPOINT" >> ../.env
echo "MONGO_URI=$MONGO_URI" >> ../.env
echo "PUBLIC_IP=$INSTANCE_PUBLIC_IP" >> ../.env
