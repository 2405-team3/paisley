#!/bin/bash

# script dir
SCRIPT_DIR=$(dirname "$0")
ENV_LOC="$SCRIPT_DIR/../.env"

# Source the .env file to load existing environment variables, ignoring comments and empty lines
if [ -f "$ENV_LOC" ]; then
	export $(grep -v '^#' "$ENV_LOC" | xargs)
fi

# Run the AWS CLI command and store the output in a variable
INSTANCE_PUBLIC_IP=$(aws cloudformation describe-stacks --stack-name PaisleyEc2Stack --query "Stacks[0].Outputs[?OutputKey=='InstancePublicIP'].OutputValue" --output text) ||
{
	INSTANCE_PUBLIC_DNS=$(aws cloudformation describe-stacks --stack-name PaisleyStack --query "Stacks[0].Outputs[?OutputKey=='InstancePublicDNS'].OutputValue" --output text)
	DOCUMENT_DB_ENDPOINT=$(aws cloudformation describe-stacks --stack-name PaisleyStack --query "Stacks[0].Outputs[?OutputKey=='DocumentDBEndpoint'].OutputValue" --output text)
	RDS_INSTANCE_ENDPOINT=$(aws cloudformation describe-stacks --stack-name PaisleyStack --query "Stacks[0].Outputs[?OutputKey=='RDSInstanceEndpoint'].OutputValue" --output text)
	INSTANCE_PUBLIC_IP=$(aws cloudformation describe-stacks --stack-name PaisleyStack --query "Stacks[0].Outputs[?OutputKey=='InstancePublicIP'].OutputValue" --output text)
	S3_BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name PaisleyStack --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text)
	SQS_URL=$(aws cloudformation describe-stacks --stack-name PaisleyStack --query "Stacks[0].Outputs[?OutputKey=='SQSURL'].OutputValue" --output text)

	MONGO_URI="mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${DOCUMENT_DB_ENDPOINT}:27017/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"

	# Write the output to the .env file
	echo -e "\n" >>"$ENV_LOC"
	echo "PG_HOST=$RDS_INSTANCE_ENDPOINT" >>"$ENV_LOC"
	echo "MONGO_URI=$MONGO_URI" >>"$ENV_LOC"
	echo "SQS_URL=$SQS_URL" >>"$ENV_LOC"
	echo "S3_BUCKET_NAME=$S3_BUCKET_NAME" >>"$ENV_LOC"

}

# Write the output to the .env file
echo "PUBLIC_IP=$INSTANCE_PUBLIC_IP" >>"$ENV_LOC"
