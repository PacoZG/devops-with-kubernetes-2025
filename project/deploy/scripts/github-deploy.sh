#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color (reset)

while getopts "n:" opt; do
  case $opt in
    t) NAMESPACE_NAME="$OPTARG" ;;
    *) printf "${RED}Usage: %s -n <namesapce>\n${NC}" "$0"; exit 1 ;; # Error usage in red
  esac
done

if [ -z "$TAG" ]; then
  printf "${RED}Error: Tag (-n) is required.\n${NC}" # Error in red
  printf "${RED}Usage: %s -n <namespace>\n${NC}" "$0" # Usage in red
  exit 1
fi

printf "${BLUE}Running Kubernetes deployments script${NC}\n"

printf "${YELLOW}Ensuring '${NAMESPACE_NAME}' namespace exists...${NC}\n"
kubectl get namespace "${NAMESPACE_NAME}" >/dev/null 2>&1 || kubectl create namespace "${NAMESPACE_NAME}"

printf "${YELLOW}Creating Kubernetes volumes${NC}\n"
kubectl apply -f kubernetes/volumes/gkepersistentvolumeclaim.yaml

printf "${YELLOW}Checking for secret.yaml...${NC}\n"
if [ ! -f kubernetes/base/secret.yaml ]; then
  printf "${GREEN}Creating secret.yaml file${NC}\n"
  sops --version
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


printf "${GREEN}Deploying Kubernetes resources with ${NC}"
printf "${YELLOW}kubectl apply -k kubernetes/overlays/dev${NC}\n"
kustomize build . | kubectl apply -f -
kubectl rollout status deployment ${CLIENT_IMAGE}
kubectl rollout status deployment ${SERVER_IMAGE}
kubectl get services -o wide
if [ $? -ne 0 ]; then
  printf "${RED}Error: Failed to apply Kubernetes manifests${NC}\n"
  exit 1
fi

printf "${GREEN}Deployment successfully completed${NC}\n"
