# Exercise 3.5: The project, step 14

### Configure the project to use Kustomize, and deploy it to Google Kubernetes Engine.

Few changes were necessary before being able to run the application on GKE

1. Creating and root endpoint for Ingress to do a health check:

```js
app.get('/', (req, res) => {
  res.status(200).json({ message: 'OK' })
})
```

The Services needed to be configured as `NodePort` instead of `ClustrIP`

- [client.yaml](deploy/kubernetes/base/00-client.yaml)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: client-svc
  namespace: project
spec:
  type: NodePort
  selector:
    app: client
  ports:
    - port: 80
      protocol: TCP
      targetPort: 3000
```

---

- [server.yaml](deploy/kubernetes/base/01-server.yaml)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: server-svc
  namespace: project
spec:
  type: NodePort
  selector:
    app: server
  ports:
    - port: 80
      protocol: TCP
      targetPort: 3001
```

and the server Url used by the client to mae requests to the backend had to be
set to an empty string

```yaml
    env:
      - name: REACT_APP_SERVER_URL
        value: ""
```

Now, using `kustomize create` we can build the resources needed to deploy to GKE

```shell
  cd deploy/kubernetes/base
  kustomize create --namespace=project --autodetect
```

After that, I was able to run the following [script](deploy/script.sh)

```shell
  #!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color (reset)

cd deploy

printf "${BLUE}Running Kubernetes deployments script${NC}\n"

printf "${YELLOW}Ensuring 'project' namespace exists...${NC}\n"
kubectl get namespace project >/dev/null 2>&1 || kubectl apply -f kubernetes/namespace

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

printf "${GREEN}Deploying Kubernetes resources with ${NC}"
printf "${YELLOW}kubectl apply -k kubernetes/overlays/dev${NC}\n"
kubectl kustomize kubernetes/base | kubectl apply -f -
if [ $? -ne 0 ]; then
  printf "${RED}Error: Failed to apply Kubernetes manifests${NC}\n"
  exit 1
fi

printf "${GREEN}Deployment successfully completed${NC}\n"
```

Emphasis on `kubectl kustomize kubernetes/overlays/dev | kubectl apply -f -`

Navigating to GKE Ingress in GCloud console we can clearly see all the available
routes on which the the root is reserved for the frontend (client)

```
kubectl get ingress
NAME      CLASS    HOSTS   ADDRESS          PORTS   AGE
project   <none>   *       34.120.253.183   80      103m
```
