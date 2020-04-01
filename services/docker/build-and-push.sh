#!/bin/bash

display_usage() { 
	echo "Invalid build target. A target is a subdirectory containing a docker file." 
	echo -e "\nUsage:\n ./build-and-push.sh [target] \n" 
	} 

# if less than two arguments supplied, display usage 
	if [  $# -le 0 ] 
	then 
		display_usage
		exit 1
	fi

REPO_NAME=$1

    if [[ ! -d "$REPO_NAME" ]]
    then
        echo "$REPO_NAME is not a valid target."
        display_usage
		exit 1
    fi


# Builds and deploys the docker container to the ECR repo

export set AWS_ACCOUNT_ID=`aws sts get-caller-identity |grep Account |awk '{print $2}'|colrm 15| tr -d '"'`
export set AWS_REGION=`aws configure get region`

echo "Checking ECR Repository ${REPO_NAME}  - will create if needed."

aws ecr describe-repositories --repository-names ${REPO_NAME} || aws ecr create-repository --repository-name ${REPO_NAME}


echo "Building ${REPO_NAME}r docker container..."

cd ${REPO_NAME}
docker build -t ${REPO_NAME} .
docker tag ${REPO_NAME}:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${REPO_NAME}

echo "Logging into ECR for $AWS_ACCOUNT_ID in region $AWS_REGION"
## Login to the ECR repository - set your own region
$(aws ecr get-login --no-include-email --region $AWS_REGION)

docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${REPO_NAME}



