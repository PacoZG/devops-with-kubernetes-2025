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
kubectl get namespace "${NAMESPACE_NAME}" >/dev/null 2>&1 || kubectl create namespace "${NAMESPACE_NAME}"

# Change to the project/deploy directory
printf "${BLUE}Navigating to project/deploy directory${NC}\n"
# This moves the current working directory from project/deploy/scripts to project/deploy
cd "$SCRIPT_DIR/.."

# Removed debugging lines as requested previously

PVC_NAME="project-files-claim" # Ensure this matches the metadata.name in your gkepersistentvolumeclaim.yaml

printf "${YELLOW}Checking for Kubernetes volume: ${PVC_NAME} in namespace ${NAMESPACE_NAME}${NC}\n"
if ! kubectl get pvc "${PVC_NAME}" -n "${NAMESPACE_NAME}" --ignore-not-found=true | grep -q "${PVC_NAME}"; then
  printf "${YELLOW}Kubernetes volume ${PVC_NAME} not found. Creating...${NC}\n"
  # Path is relative to the current working directory (project/deploy)
  kubectl apply -f kubernetes/volumes/gkepersistentvolumeclaim.yaml -n "${NAMESPACE_NAME}"
else
  printf "${YELLOW}Kubernetes volume ${PVC_NAME} already exists in namespace ${NAMESPACE_NAME}. Skipping creation.${NC}\n"
fi

printf "${YELLOW}Checking for secret.yaml...${NC}\n"
# Check for secret.yaml from current directory (project/deploy)
if [ ! -f kubernetes/base/secret.yaml ]; then
  printf "${GREEN}Creating secret.yaml file${NC}\n"
  # Use SCRIPT_DIR to correctly locate key.txt relative to the script's original position
  export SOPS_AGE_KEY_FILE="${SCRIPT_DIR}/key.txt"
  sops --decrypt secret.enc.yaml > kubernetes/base/secret.yaml
else
  printf "${YELLOW}kubernetes/base/secret.yaml already exists${NC}\n"
fi

printf "${YELLOW}Setting images via kustomize${NC}\n"
# Now change to the kubernetes/base directory for kustomize operations
# Current directory is project/deploy, so this moves to project/deploy/kubernetes/base
cd kubernetes/base
kustomize edit set namespace "${NAMESPACE_NAME}"
kustomize edit set image CLIENT/IMAGE=${GCP_REGISTRY_PATH}/${CLIENT_IMAGE}:${IMAGE_TAG}
kustomize edit set image SERVER/IMAGE=${GCP_REGISTRY_PATH}/${SERVER_IMAGE}:${IMAGE_TAG}

printf "${GREEN}Deploying Kubernetes resources${NC}\n"
kustomize build . | kubectl apply -f -
kubectl rollout status deployment ${CLIENT_IMAGE}-dep
kubectl rollout status deployment ${SERVER_IMAGE}-dep
kubectl get services -o wide
