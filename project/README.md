# Exercise 3.8: The project, step 16

### Improve the deployment so that each branch creates a separate environment. The main branch should still be deployed in the namespace project.

No significant changes were apply to the workflow or the script

- [main.yaml](../.github/workflows/main.yaml)

```yaml
name: Project Application Deployment Workflow

on:
  push:

env:
  BRANCH: ${{ github.ref_name }}
  PROJECT_ID: ${{ secrets.GKE_PROJECT }}
  NAMESPACE: $(echo "${GITHUB_REF#refs/heads/}" | tr '/' '-')
  GKE_CLUSTER: dwk-cluster
  GKE_ZONE: europe-north1-b
  REGISTRY: europe-north1-docker.pkg.dev
  GCP_REGISTRY_PATH: europe-north1-docker.pkg.dev/paco-learning-project/dwk-repository
  IMAGE: dwk-environments
  SERVICE: dwk-environments
  CLIENT_IMAGE: client
  SERVER_IMAGE: server

jobs:
  project-build-publish-deploy:
    name: Build, Publish and Deploy
    runs-on: ubuntu-latest

    steps:
      - name: 'Checkout'
        uses: actions/checkout@v4

      - name: 'Get GCloud credentials'
        uses: google-github-actions/auth@v2
        with:
          credentials_json: '${{ secrets.GKE_SA_KEY }}'

      - name: 'Set up Cloud SDK'
        uses: google-github-actions/setup-gcloud@v2

      - name: 'Use gcloud CLI'
        run: gcloud info

      - name: 'Get GKE credentials'
        uses: 'google-github-actions/get-gke-credentials@v2'
        with:
          cluster_name: '${{ env.GKE_CLUSTER }}'
          project_id: '${{ env.PROJECT_ID }}'
          location: '${{ env.GKE_ZONE }}'

      - name: 'Set up Docker Buildx'
        run: gcloud auth configure-docker "$REGISTRY"

      - name: 'Verify current working directory (should be repo root)'
        run: pwd

      - name: "Set tag based on branch"
        run: echo "IMAGE_TAG=$BRANCH-$GITHUB_SHA" >> $GITHUB_ENV

      - name: 'Build Client Image'
        working-directory: project
        run: |-
          docker build --tag "$GCP_REGISTRY_PATH/$CLIENT_IMAGE:$IMAGE_TAG" ./client

      - name: 'Build Server Image'
        working-directory: project
        run: |-
          docker build --tag "$GCP_REGISTRY_PATH/$SERVER_IMAGE:$IMAGE_TAG" ./server

      - name: 'Publish Client Image'
        run: |-
          docker push "$GCP_REGISTRY_PATH/$CLIENT_IMAGE:$IMAGE_TAG"

      - name: 'Publish Server Image'
        run: |-
          docker push "$GCP_REGISTRY_PATH/$SERVER_IMAGE:$IMAGE_TAG"

      - name: 'Set up Kustomize'
        uses: imranismail/setup-kustomize@v2.1.0

      - name: Setup SOPS
        uses: nhedger/setup-sops@v2
        with:
          version: 'latest'

      - name: 'Make deploy.sh executable'
        run: chmod +x project/deploy/scripts/github-deploy.sh


      - name: 'Run deployment script'
        working-directory: project/deploy/scripts
        run: |-
          NAMESPACE_NAME=${GITHUB_REF#refs/heads/}
          ./github-deploy.sh -n "$NAMESPACE_NAME"
        env:
          GCP_REGISTRY_PATH: ${{ env.GCP_REGISTRY_PATH }}
          CLIENT_IMAGE: ${{ env.CLIENT_IMAGE }}
          SERVER_IMAGE: ${{ env.SERVER_IMAGE }}
          IMAGE_TAG: ${{ env.IMAGE_TAG }}
```

---

- [github-deploy.yaml](deploy/scripts/github-deploy.sh)

```shell
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
kubectl config set-context --current --namespace="${NAMESPACE_NAME}"

printf "${BLUE}Navigating to project/deploy directory${NC}\n"
cd "$SCRIPT_DIR/.."

PVC_NAME="project-files-claim" # Ensure this matches the metadata.name in your gkepersistentvolumeclaim.yaml

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
kustomize edit set image CLIENT/IMAGE=${GCP_REGISTRY_PATH}/${CLIENT_IMAGE}:${IMAGE_TAG}
kustomize edit set image SERVER/IMAGE=${GCP_REGISTRY_PATH}/${SERVER_IMAGE}:${IMAGE_TAG}

printf "${GREEN}Deploying Kubernetes resources${NC}\n"
kustomize build . | kubectl apply -f -

printf "${YELLOW}Waiting for deployments to be visible...${NC}\n"
sleep 10

kubectl rollout status deployment ${CLIENT_IMAGE}-dep
kubectl rollout status deployment ${SERVER_IMAGE}-dep
kubectl get services -o wide
```

After a successful workflow run there are the logs:

```
Run NAMESPACE_NAME=$(echo "$***GITHUB_REF#refs/heads/***" | tr '/' '-')
Running Kubernetes deployments script
Ensuring 'dev' namespace exists...
Context "gke_***_europe-north1-b_dwk-cluster" modified.
Navigating to project/deploy directory
Checking for Kubernetes volume: project-files-claim in namespace dev
Kubernetes volume project-files-claim already exists in namespace dev. Skipping creation.
Checking for secret.yaml...
Creating secret.yaml file
Setting images via kustomize
Deploying Kubernetes resources
configmap/config-map-variables unchanged
secret/project-secret unchanged
service/client-svc unchanged
service/postgres-svc unchanged
service/server-svc unchanged
deployment.apps/client-dep configured
deployment.apps/server-dep unchanged
statefulset.apps/postgres configured
cronjob.batch/create-daily-todo-cron-job unchanged
ingress.networking.k8s.io/project unchanged
Waiting for deployments to be visible...
deployment "client-dep" successfully rolled out
deployment "server-dep" successfully rolled out
NAME           TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE   SELECTOR
client-svc     NodePort    10.3.246.243   <none>        80:32422/TCP   26m   app=client
postgres-svc   ClusterIP   None           <none>        5432/TCP       26m   app=postgres
server-svc     NodePort    10.3.255.58    <none>        80:30351/TCP   26m   app=server
```
