#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color (reset)

printf "${BLUE}Running Kubernetes deployments script${NC}\n"

if [ ! -f manifests/secret.yaml ]; then
  printf "\n${GREEN}Creating secret.yaml file${NC}\n"
  export SOPS_AGE_KEY_FILE=$(pwd)/key.txt
  sops --decrypt secret.enc.yaml > manifests/secret.yaml
else
  printf "\n${YELLOW}manifests/secret.yaml already exists${NC}\n"
fi

printf "\n${GREEN}Deploying Kubernetes resources running manifests${NC}\n"

kubectl apply -f manifests
if [ $? -ne 0 ]; then
  printf -e "\n${RED}Error: Failed to apply Kubernetes manifests${NC}\n"
  exit 1
fi

printf "\n${GREEN}Deployment successfully completed${NC}"
