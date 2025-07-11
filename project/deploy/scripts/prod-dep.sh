#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color (reset)

cd ../kubernetes/overlays/prod

# Get the current working directory where the script is executed
CURRENT_EXEC_PATH=$(pwd)
echo "Script executed from: $CURRENT_EXEC_PATH"

# Navigate to the Git repository root
PROJECT_ROOT=$(git rev-parse --show-toplevel)

while getopts "t:" opt; do
  case $opt in
    t) NEW_TAG="$OPTARG" ;;
    *) printf "${RED}Usage: %s -t <tag>\n${NC}" "$0"; exit 1 ;;
  esac
done

if [ -z "$NEW_TAG" ]; then
  printf "${RED}Error: Tag (-t) is required.\n${NC}"
  printf "${RED}Usage: %s -t <tag>\n${NC}" "$0"
  exit 1
fi

if ! [[ "$NEW_TAG" =~ ^[0-9]+\.[0-9]+$ ]]; then
  printf "${RED}Error: Tag format must be Number.Number (e.g., 1.11)\n${NC}"
  exit 1
fi

printf "${BLUE}Running push script deployments script${NC}\n"

printf "${GREEN}Update production application.yaml with new tag${NC}\n"
APP_MANIFEST_PATH="application.yaml"

if [ ! -f "$APP_MANIFEST_PATH" ]; then
  echo "::error::ArgoCD Application manifest '$APP_MANIFEST_PATH' not found."
  exit 1
fi
echo "Updating $APP_MANIFEST_PATH targetRevision to $NEW_TAG"
# Use yq to update the targetRevision field
yq e ".spec.source.targetRevision = \"$NEW_TAG\"" -i "$APP_MANIFEST_PATH"
echo "--- Updated Manifest Content ---"
cat "$APP_MANIFEST_PATH"
echo "------------------------------"

printf "${YELLOW}Applying change to the argocd app${NC}\n"
kubectl apply -f "$APP_MANIFEST_PATH" # Apply from the correct path

printf "${YELLOW}Project root is: ${PROJECT_ROOT}${NC}\n"
# Change directory to the project root
cd "$PROJECT_ROOT" || { printf "${RED}Error: Could not change to project root.\n${NC}"; exit 1; }

echo "Now operating from project root: $(pwd)"

printf "${GREEN}Checking if tag %s already exists...${NC}\n" "$NEW_TAG"

# Check if the tag exists locally
if git tag -l "$NEW_TAG" | grep -q "$NEW_TAG"; then
  printf "${YELLOW}Local tag '%s' already exists. Forcing update.${NC}\n" "$NEW_TAG"
  git tag -f "$NEW_TAG" # Force update local tag
else
  printf "${GREEN}Local tag '%s' does not exist. Creating new tag.${NC}\n" "$NEW_TAG"
  git tag "$NEW_TAG" # Create new local tag
fi

# Check if the tag exists on the remote (origin)
if git ls-remote --tags origin "$NEW_TAG" | grep -q "$NEW_TAG"; then
  printf "${YELLOW}Remote tag '%s' already exists. Forcing push.${NC}\n" "$NEW_TAG"
  git push origin "$NEW_TAG" -f # Force push to remote
else
  printf "${GREEN}Remote tag '%s' does not exist. Pushing new tag.${NC}\n" "$NEW_TAG"
  git push origin "$NEW_TAG" # Push new tag
fi

printf "${GREEN}Tagging and pushing complete for tag: %s${NC}\n" "$NEW_TAG"
