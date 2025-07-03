#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color (reset)

cd deploy

printf "${BLUE}Running Kubernetes deployments script${NC}\n"

printf "${YELLOW}Ensuring 'project' namespace exists...${NC}\n"
kubectl get namespace project >/dev/null 2>&1 || kubectl apply -f kubernetes/namespace

printf "${YELLOW}Creating Kubernetes volumes${NC}\n"
kubectl apply -f kubernetes/volumes/gkepersistentvolumeclaim.yaml

printf "${YELLOW}Checking for secret.yaml...${NC}\n"
if [ ! -f kubernetes/base/secret.yaml ]; then
  printf "${GREEN}Creating secret.yaml file${NC}\n"
  export SOPS_AGE_KEY_FILE=$(pwd)/key.txt
  sops --decrypt secret.enc.yaml > kubernetes/base/secret.yaml
else
  printf "${YELLOW}kubernetes/base/secret.yaml already exists${NC}\n"
fi

printf "${GREEN}Deploying Kubernetes resources with ${NC}"
printf "${YELLOW}kubectl apply -k kubernetes/overlays/dev${NC}\n"
kubectl kustomize kubernetes/overlays/dev | kubectl apply -f -
if [ $? -ne 0 ]; then
  printf "${RED}Error: Failed to apply Kubernetes manifests${NC}\n"
  exit 1
fi

printf "${GREEN}Deployment successfully completed${NC}\n"
