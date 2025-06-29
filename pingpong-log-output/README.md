# 🚀 Exercise 3.1: Deploying the Pingpong App to GKE

### 🎯 Goal

Deploy the **Pingpong application** into a **Google Kubernetes Engine (GKE)**
cluster, exposing it with a **LoadBalancer service**.

---

## ☁️ Cluster Setup with Terraform

To set up the GKE cluster, I used _Terraform_ scripts for educational purposes.
You can find the scripts in the [terraform](../terraform) directory.

First, authenticate with Google Cloud:

```shell
  gcloud auth application-default login
  gcloud auth login
```

## After running all the commands necessary to login, create a project and create a cluster in google cloud...

Then configure your project and enable the Kubernetes Engine API:

```shell
  gcloud gcloud config set project paco-learning-project
  gcloud services enable container.googleapis.com
```

_ℹ️ Note: I switched from using dwk-cluster to paco-learning-project as this
project is part of my company’s Google Cloud account and is intended solely for
educational purposes._

Now navigate to the Terraform directory and create the cluster:

```shell
  cd ..
  terraform apply
```

### 🛠️ Kubernetes Configuration Updates

- [pingpong.yaml](manifests/pingpong.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pingpong
  namespace: exercises
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pingpong
  template:
    metadata:
      labels:
        app: pingpong
    spec:
      volumes:
        - name: shared-files
          persistentVolumeClaim:
            claimName: pingpong-files-claim
      containers:
        - name: pingpong
          image: sirpacoder/pingpong:v2.7
          imagePullPolicy: Always
          volumeMounts:
            - name: shared-files
              mountPath: /usr/src/app/shared/files
          env:
            - name: PORT
              value: "8000"
            - name: COUNT_FILE_PATH
              value: "shared/files/count.txt"
            - name: POSTGRES_HOST
              value: postgres-svc
            - name: POSTGRES_USER
              value: postgres
            - name: POSTGRES_DB
              value: postgres
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: pingpong-secret
                  key: postgres-password #In secrets.yaml

# No resources requests or limits, we let Gcloud to set them dynamically
---

apiVersion: v1
kind: Service
metadata:
  name: pingpong-svc
  namespace: exercises
spec:
  type: LoadBalancer
  selector:
    app: pingpong
  ports:
    - name: http
      port: 80
      protocol: TCP
      targetPort: 8000
```

---

- [postgres.yaml](kubernetes/manifests/postgres.yaml)

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: exercises
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:latest
          env:
            - name: POSTGRES_HOST
              value: postgres-svc
            - name: POSTGRES_USER
              value: postgres
            - name: POSTGRES_DB
              value: postgres
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: pingpong-secret
                  key: postgres-password
          ports:
            - name: web
              containerPort: 5432
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
              subPath: postgres
  volumeClaimTemplates:
    - metadata:
        name: postgres-storage
      spec:
        accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: 1Gi
---

apiVersion: v1
kind: Service
metadata:
  name: postgres-svc
  namespace: exercises
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
    - name: web
      port: 5432
```

---

- [persistentvolumeClaim.yaml](kubernetes/manifests/persistentvolumeclaim.yaml)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pingpong-files-claim
  namespace: exercises
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

🧪 Deploying with a Shell Script only for the pingpong app
app.

```shell
  ./deploy-pingpong.sh
```

```
  #!/usr/bin/env bash
  
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  NC='\033[0m' # No Color (reset)
  
  printf "${BLUE}Running Kubernetes deployments script${NC}\n"
  
  printf "${YELLOW}Ensuring 'exercises' namespace exists...${NC}\n"
  kubectl get namespace exercises >/dev/null 2>&1 || kubectl create namespace exercises
  
  printf "${YELLOW}Checking for secret.yaml...${NC}\n"
  if [ ! -f kubernetes/manifests/secret.yaml ]; then
    printf "${GREEN}Creating secret.yaml file${NC}\n"
    export SOPS_AGE_KEY_FILE=$(pwd)/key.txt
    sops --decrypt secret.enc.yaml > kubernetes/manifests/secret.yaml
  else
    printf "${YELLOW}manifests/secret.yaml already exists${NC}\n"
  fi
  
  printf "${GREEN}Deploying Kubernetes resources from manifests${NC}\n"
  kubectl apply -f kubernetes/manifests/persistentvolumeclaim.yaml
  kubectl apply -f kubernetes/manifests/secret.yaml
  kubectl apply -f kubernetes/manifests/pingpong.yaml
  kubectl apply -f kubernetes/manifests/postgres.yaml
  if [ $? -ne 0 ]; then
    printf "${RED}Error: Failed to apply Kubernetes manifests${NC}\n"
    exit 1
  fi
  
  printf "${GREEN}Deployment successfully completed${NC}\n"
```

## 🔍 Monitoring & Access

Once deployed, you can retrieve the LoadBalancer IP by running:

```shell
  kubectl get svc --watch
```

Alternatively, you can check it from the GCP Console:

> Kubernetes Engine > Workloads > pingpong > Exposing Services

### 🧭 Useful Commands

```
  kubectl get pods
  kubectl describe pod <pod-id>
  kubectl logs <pod-id> --since 1h
```

These help monitor pod status, logs, and troubleshoot any issues.


