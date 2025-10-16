#!/bin/bash
cd /home/ubuntu/campplanner-backend

# Fetch secrets from Parameter Store
AWS_ACCESS_KEY_ID=$(aws ssm get-parameter --name "/campplanner/AWS_ACCESS_KEY_ID" --with-decryption --query "Parameter.Value" --output text)
AWS_SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "/campplanner/AWS_SECRET_ACCESS_KEY" --with-decryption --query "Parameter.Value" --output text)
AWS_REGION=$(aws ssm get-parameter --name "/campplanner/AWS_REGION" --query "Parameter.Value" --output text)
PORT=$(aws ssm get-parameter --name "/campplanner/PORT" --query "Parameter.Value" --output text)
JWT_SECRET=$(aws ssm get-parameter --name "/campplanner/JWT_SECRET" --with-decryption --query "Parameter.Value" --output text)
RIDB_API_KEY=$(aws ssm get-parameter --name "/campplanner/RIDB_API_KEY" --with-decryption --query "Parameter.Value" --output text)
NODE_ENV=$(aws ssm get-parameter --name "/campplanner/NODE_ENV" --query "Parameter.Value" --output text)

# Write .env file
cat <<EOT > .env
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=${AWS_REGION}
PORT=${PORT}
JWT_SECRET=${JWT_SECRET}
RIDB_API_KEY=${RIDB_API_KEY}
NODE_ENV=${NODE_ENV}
EOT