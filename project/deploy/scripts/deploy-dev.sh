#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color (reset)

cd deploy

printf "${BLUE}Running Kubernetes deployments script${NC}\n"

printf "${YELLOW}Ensuring 'project' namespace exists...${NC}\n"
kubectl get namespace project >/dev/null 2>&1 || kubectl apply -f kubernetes/namespace
printf "${YELLOW}Setting working namespace...${NC}\n"
kubectl config set-context --current --namespace=project >/dev/null

CURRENT_NS=$(kubectl config view --minify --output 'jsonpath={..namespace}')
printf "${GREEN}Current namespace: ${CURRENT_NS}${NC}\n"

PVC_NAME="project-files-claim" # Ensure this matches the metadata.name in your persistentvolumeclaim.yaml

printf "${YELLOW}Checking for Kubernetes volume: ${PVC_NAME} in namespace 'Project'${NC}\n"
if ! kubectl get pvc "${PVC_NAME}" --ignore-not-found=true | grep -q "${PVC_NAME}"; then
  printf "${YELLOW}Kubernetes volume ${PVC_NAME} not found. Creating...${NC}\n"
  kubectl apply -f kubernetes/volumes/persistentvolume.yaml
  printf "${YELLOW}Waiting for the volumes to be created...${NC}\n"
  sleep 10

  kubectl apply -f kubernetes/volumes/persistentvolumeclaim.yaml
else
  printf "${YELLOW}Kubernetes volume ${PVC_NAME} already exists in namespace 'Project'. Skipping creation.${NC}\n"
fi

printf "${YELLOW}Checking for secrets.yaml...${NC}\n"
if [ ! -f kubernetes/base/secrets.yaml ]; then
  printf "${GREEN}Creating secrets.yaml file${NC}\n"
  export SOPS_AGE_KEY_FILE=./key.txt
  sops --decrypt secrets.enc.yaml > kubernetes/base/secrets.yaml
else
  printf "${YELLOW}kubernetes/base/secrets.yaml already exists${NC}\n"
fi

cd kubernetes/base

export DEPLOY_PATH=$(pwd)

printf "$DEPLOY_PATH\n"

printf "${GREEN}Deploying Kubernetes resources with ${NC}"
printf "${YELLOW}kubectl apply -k kubernetes/base${NC}\n"
kustomize build . | kubectl apply -f -
if [ $? -ne 0 ]; then
  printf "${RED}Error: Failed to apply Kubernetes manifests${NC}\n"
  exit 1
fi

printf "${YELLOW}Waiting for deployments to be visible...${NC}\n"
sleep 10

kubectl rollout status deployment broadcaster-dep
kubectl rollout status deployment server-dep
kubectl rollout status deployment client-dep
kubectl get services -o wide

printf "${GREEN}Deployment successfully completed${NC}\n"
