#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Store the script's original directory for reliable pathing to key.txt
SCRIPT_DIR=$(dirname "$0")

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
kubectl create namespace "${NAMESPACE_NAME}" || true
printf "${YELLOW}Setting working namespace...${NC}\n"
kubectl config set-context --current --namespace="${NAMESPACE_NAME}" >/dev/null

CURRENT_NS=$(kubectl config view --minify --output 'jsonpath={..namespace}')
printf "${GREEN}Current namespace: ${CURRENT_NS}${NC}\n"

printf "${BLUE}Navigating to project/deploy directory${NC}\n"
cd "$SCRIPT_DIR/.."

PVC_NAME="pingpong-files-claim" # Ensure this matches the metadata.name in your gkepersistentvolumeclaim.yaml

printf "${YELLOW}Checking for Kubernetes volume: ${PVC_NAME} in namespace ${NAMESPACE_NAME}${NC}\n"
if ! kubectl get pvc "${PVC_NAME}" -n "${NAMESPACE_NAME}" --ignore-not-found=true | grep -q "${PVC_NAME}"; then
  printf "${YELLOW}Kubernetes volume ${PVC_NAME} not found. Creating...${NC}\n"
  kubectl apply -f kubernetes/volumes/gkepersistentvolumeclaim.yaml -n "${NAMESPACE_NAME}"
else
  printf "${YELLOW}Kubernetes volume ${PVC_NAME} already exists in namespace ${NAMESPACE_NAME}. Skipping creation.${NC}\n"
fi

printf "${YELLOW}Checking for secret.yaml...${NC}\n"
if [ ! -f kubernetes/base/secret.yaml ]; then
  printf "${GREEN}Creating secret.yaml file${NC}\n"
  export SOPS_AGE_KEY_FILE="${SCRIPT_DIR}/key.txt"
  sops --decrypt secret.enc.yaml > kubernetes/base/secret.yaml
else
  printf "${YELLOW}kubernetes/base/secret.yaml already exists${NC}\n"
fi

printf "${YELLOW}Setting images via kustomize${NC}\n"
cd kubernetes/base
kustomize edit set namespace "${NAMESPACE_NAME}"
kustomize edit set image HASH_READER/IMAGE=${GCP_REGISTRY_PATH}/${HASH_READER_IMAGE}:${IMAGE_TAG}
kustomize edit set image HASH_GENERATOR/IMAGE=${GCP_REGISTRY_PATH}/${HASH_GENERATOR_IMAGE}:${IMAGE_TAG}
kustomize edit set image PINGPONG/IMAGE=${GCP_REGISTRY_PATH}/${PINGPONG_IMAGE}:${IMAGE_TAG}

printf "${GREEN}Deploying Kubernetes resources${NC}\n"
kustomize build . | kubectl apply -f -

printf "${YELLOW}Waiting for deployments to be visible...${NC}\n"
sleep 5

kubectl rollout status deployment log-output-dep
kubectl rollout status deployment pingpong-dep
kubectl get services -o wide
