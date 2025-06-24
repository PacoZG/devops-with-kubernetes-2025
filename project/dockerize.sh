#!/usr/bin/env bash


while getopts "t:" opt; do
  case $opt in
    t) TAG="$OPTARG" ;;
    *) echo "Usage: $0 -t <tag>"; exit 1 ;;
  esac
done

if [ -z "$TAG" ]; then
  echo "Error: Tag (-t) is required."
  echo "Usage: $0 -t <tag>"
  exit 1
fi

if ! [[ "$TAG" =~ ^v[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Tag format must be number.number (e.g., v1.11)"
  exit 1
fi

echo "Creating and push Docker images with tag=$TAG"
echo "Building images"
docker-compose build --no-cache

echo "Tagging images"
docker tag client sirpacoder/client:$TAG
docker tag server sirpacoder/server:$TAG

echo "Pushing images"
docker push sirpacoder/client:$TAG
docker push sirpacoder/server:$TAG

