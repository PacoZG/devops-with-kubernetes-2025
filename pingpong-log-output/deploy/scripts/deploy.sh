#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color (reset)

cd deploy

printf "${BLUE}Running Kubernetes deployments script${NC}\n"

printf "${YELLOW}Ensuring 'exercises' namespace exists...${NC}\n"
kubectl get namespace exercises >/dev/null 2>&1 || kubectl apply -f kubernetes/namespace
printf "${YELLOW}Setting working namespace...${NC}\n"
kubectl config set-context --current --namespace=exercises >/dev/null

CURRENT_NS=$(kubectl config view --minify --output 'jsonpath={..namespace}')
printf "${GREEN}Current namespace: ${CURRENT_NS}${NC}\n"


PVC_NAME="pingpong-files-claim" # Ensure this matches the metadata.name in your persistentvolumeclaim.yaml

printf "${YELLOW}Checking for Kubernetes volume: ${PVC_NAME} in namespace 'exercises'${NC}\n"
if ! kubectl get pvc "${PVC_NAME}" --ignore-not-found=true | grep -q "${PVC_NAME}"; then
  printf "${YELLOW}Kubernetes volume ${PVC_NAME} not found. Creating...${NC}\n"
  kubectl apply -f kubernetes/volumes/persistentvolumeclaim.yaml
  kubectl apply -f kubernetes/volumes/persistentvolume.yaml
else
  printf "${YELLOW}Kubernetes volume ${PVC_NAME} already exists in namespace 'exercises'. Skipping creation.${NC}\n"
fi

printf "${YELLOW}Checking for secret.yaml...${NC}\n"
if [ ! -f kubernetes/base/secret.yaml ]; then
  printf "${GREEN}Creating secret.yaml file${NC}\n"
  export SOPS_AGE_KEY_FILE=$(pwd)/key.txt
  sops --decrypt secret.enc.yaml > kubernetes/base/secret.yaml
else
  printf "${YELLOW}base/secret.yaml already exists${NC}\n"
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

kubectl rollout status deployment pingpong-dep
kubectl rollout status deployment log-output-dep
kubectl get services -o wide

printf "${GREEN}Deployment successfully completed${NC}\n"
