#!/usr/bin/env bash

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color (reset)


while getopts "t:" opt; do
  case $opt in
    t) TAG="$OPTARG" ;;
    *) printf "${RED}Usage: %s -t <tag>\n${NC}" "$0"; exit 1 ;; # Error usage in red
  esac
done

if [ -z "$TAG" ]; then
  printf "${RED}Error: Tag (-t) is required.\n${NC}" # Error in red
  printf "${RED}Usage: %s -t <tag>\n${NC}" "$0" # Usage in red
  exit 1
fi

if ! [[ "$TAG" =~ ^v[0-9]+\.[0-9]+$ ]]; then
  printf "${RED}Error: Tag format must be vNumber.Number (e.g., v1.11)\n${NC}" # Error in red
  exit 1
fi

printf "${YELLOW}--- Cleaning up existing Docker containers and volumes (if any) ---\n${NC}" # Info in blue
docker-compose down --rmi all --volumes --remove-orphans || true

printf "${GREEN}Creating and pushing Docker images with tag=%s\n${NC}" "$TAG" # Success/Main action in green
printf "${YELLOW}Building images...\n${NC}" # Step info in yellow
docker-compose build --no-cache

printf "${YELLOW}Tagging images...\n${NC}" # Step info in yellow
docker tag client sirpacoder/client:$TAG
docker tag server sirpacoder/server:$TAG

printf "${YELLOW}Pushing images...\n${NC}" # Step info in yellow
docker push sirpacoder/client:$TAG
docker push sirpacoder/server:$TAG

printf "${GREEN}Images successfully built and pushed with tag %s!\n${NC}" "$TAG" # Final success in green
