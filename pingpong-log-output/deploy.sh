#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color (reset)

printf "${BLUE}Running Kubernetes deployments script${NC}\n"

printf "${YELLOW}Ensuring 'exercises' namespace exists...${NC}\n"
kubectl get namespace exercises >/dev/null 2>&1 || kubectl apply -f kubernetes/namespace
kubectl config set-context --current --namespace=exercises

printf "${YELLOW}Creating Kubernetes volumes${NC}\n"
kubectl apply -f kubernetes/volumes/gkepersistentvolumeclaim.yaml -n exercises

printf "${YELLOW}Creating Kubernetes Gateway${NC}\n"
kubectl apply -f kubernetes/gateway -n exercises


printf "${YELLOW}Checking for secret.yaml...${NC}\n"
if [ ! -f kubernetes/manifests/secret.yaml ]; then
  printf "${GREEN}Creating secret.yaml file${NC}\n"
  export SOPS_AGE_KEY_FILE=$(pwd)/key.txt
  sops --decrypt secret.enc.yaml > kubernetes/manifests/secret.yaml
  kubectl apply -n secret.yaml -n exercises
else
  printf "${YELLOW}manifests/secret.yaml already exists${NC}\n"
fi

printf "${GREEN}Deploying Kubernetes resources from manifests${NC}\n"
kubectl apply -f kubernetes/manifests -n exercises
if [ $? -ne 0 ]; then
  printf "${RED}Error: Failed to apply Kubernetes manifests${NC}\n"
  exit 1
fi

printf "${GREEN}Deployment successfully completed${NC}\n"
