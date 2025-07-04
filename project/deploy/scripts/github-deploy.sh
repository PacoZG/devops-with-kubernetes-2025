#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

while getopts "n:" opt; do
  case $opt in
    n) NAMESPACE_NAME="$OPTARG" ;;
    *) printf "${RED}Usage: %s -n <namespace>\n${NC}" "$0"; exit 1 ;;
  esac
done

if [ -z "$NAMESPACE_NAME" ]; then
  printf "${RED}Error: Namespace (-n) is required.\n${NC}"
  printf "${RED}Usage: %s -n <namespace>\n${NC}" "$0"
  exit 1
fi

printf "${BLUE}Running Kubernetes deployments script${NC}\n"

printf "${YELLOW}Ensuring '${NAMESPACE_NAME}' namespace exists...${NC}\n"
kubectl get namespace "${NAMESPACE_NAME}" >/dev/null 2>&1 || kubectl create namespace "${NAMESPACE_NAME}"


printf "${BLUE}Navigating to /deploy directory${NC}\n"
cd ../../
printg "${YELLOW}Listing files in current directory:${NC}"
ls -la .
printg "${YELLOW}--- End Debugging ---${NC}"

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

printf "${YELLOW}Setting images via kustomize${NC}\n"
cd ../../kubernetes/base
kustomize edit set namespace "${NAMESPACE_NAME}"
kustomize edit set image CLIENT/IMAGE=${GCP_REGISTRY_PATH}/${CLIENT_IMAGE}:${IMAGE_TAG}
kustomize edit set image SERVER/IMAGE=${GCP_REGISTRY_PATH}/${SERVER_IMAGE}:${IMAGE_TAG}

printf "${GREEN}Deploying Kubernetes resources${NC}\n"
kustomize build . | kubectl apply -f -
kubectl rollout status deployment ${CLIENT_IMAGE}-dep
kubectl rollout status deployment ${SERVER_IMAGE}-dep
kubectl get services -o wide
