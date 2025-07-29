#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color (reset)

cd deploy

printf "${BLUE}Running Kubernetes deployments script${NC}\n"

printf "${YELLOW}Ensuring 'knative-serving' namespace exists...${NC}\n"
kubectl get namespace knative-serving >/dev/null 2>&1 || kubectl apply create namespace knative-serving
printf "${YELLOW}Setting working namespace...${NC}\n"
kubectl config set-context --current --namespace=knative-serving >/dev/null

CURRENT_NS=$(kubectl config view --minify --output 'jsonpath={..namespace}')
printf "${GREEN}Current namespace: ${CURRENT_NS}${NC}\n"


PVC_NAME="log-output-files-claim" # Ensure this matches the metadata.name in your persistentvolumeclaim.yaml

printf "${YELLOW}Checking for Kubernetes volume: ${PVC_NAME} in namespace 'knative-serving'${NC}\n"
if ! kubectl get pvc "${PVC_NAME}" --ignore-not-found=true | grep -q "${PVC_NAME}"; then
  printf "${YELLOW}Kubernetes volume ${PVC_NAME} not found. Creating...${NC}\n"
  kubectl apply -f kubernetes/persistentvolumeclaim.yaml
  kubectl apply -f kubernetes/persistentvolume.yaml
else
  printf "${YELLOW}Kubernetes volume ${PVC_NAME} already exists in namespace 'knative-serving'. Skipping creation.${NC}\n"
fi

printf "${YELLOW}Checking for secret.yaml...${NC}\n"
if [ ! -f kubernetes/secret.yaml ]; then
  printf "${GREEN}Creating secret.yaml file${NC}\n"
  export SOPS_AGE_KEY_FILE=$(pwd)/key.txt
  sops --decrypt secret.enc.yaml > kubernetes/secret.yaml
else
  printf "${YELLOW}base/secret.yaml already exists${NC}\n"
fi

cd kubernetes

export DEPLOY_PATH=$(pwd)

printf "$DEPLOY_PATH\n"

printf "${GREEN}Deploying Kubernetes resources with ${NC}"
printf "${YELLOW}kubectl apply -k kubernetes${NC}\n"
kustomize build . | kubectl apply -f -
if [ $? -ne 0 ]; then
  printf "${RED}Error: Failed to apply Kubernetes manifests${NC}\n"
  exit 1
fi

kubectl get services -o wide

printf "${GREEN}Deployment successfully completed${NC}\n"
