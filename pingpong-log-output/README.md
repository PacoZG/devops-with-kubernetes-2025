# Exercise 2.7. Stateful applications

### Run a Postgres database as a stateful set (with one replica) and save the Ping-pong application counter into the database.

- [postgres.yaml](manifests/postgres.yaml)

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
          ports:
            - containerPort: 5432
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
                  key: postgres-password #In secrets.yaml
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
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
  ports:
    - port: 5432
  clusterIP: None
  selector:
    app: postgres
```

---

## UPDATE

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
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
---

apiVersion: v1
kind: Service
metadata:
  name: pingpong-svc
  namespace: exercises
spec:
  selector:
    app: pingpong
  ports:
    - name: http
      port: 30081
      protocol: TCP
      targetPort: 8000
```

---

- [namespace.yaml](namespace/namespace.yaml)

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: exercises 
```

---

- [configMap.yaml](manifests/configMap.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: log-output-config
  namespace: exercises
data:
  information.txt: |
    this is from file
  MESSAGE: "hello world"
```

---

- [log_output.yaml](manifests/log_output.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: log-output
  namespace: exercises
spec:
  replicas: 1
  selector:
    matchLabels:
      app: log-output
  template:
    metadata:
      labels:
        app: log-output
    spec:
      volumes:
        - name: shared-files
          persistentVolumeClaim:
            claimName: pingpong-files-claim
        - name: reader-files
          configMap:
            name: log-output-config
            items:
              - key: information.txt
                path: information.txt
      containers:
        - name: hash-generator
          image: sirpacoder/hash-generator:v2.5
          imagePullPolicy: Always
          volumeMounts:
            - name: shared-files
              mountPath: /usr/src/app/shared/files
          env:
            - name: GENERATOR_PORT
              value: "3002"
            - name: HASH_FILE_PATH
              value: "/usr/src/app/shared/files/hash.txt"
          resources:
            limits:
              memory: "256Mi"
              cpu: "500m"
            requests:
              memory: "256Mi"
              cpu: "500m"
        - name: hash-reader
          image: sirpacoder/hash-reader:v2.5
          imagePullPolicy: Always
          volumeMounts:
            - name: shared-files
              mountPath: /usr/src/app/shared/files
            - name: reader-files
              mountPath: /usr/src/app/reader/info
          env:
            - name: READER_PORT
              value: "3001"
            - name: HASH_FILE_PATH
              value: "/usr/src/app/shared/files/hash.txt"
            - name: INFORMATION_FILE_PATH
              value: /usr/src/app/reader/info/information.txt
            - name: PING_SERVER_URL
              value: http://pingpong-svc:30081
            - name: MESSAGE
              valueFrom:
                configMapKeyRef:
                  name: log-output-config
                  key: MESSAGE
          resources:
            limits:
              memory: "256Mi"
              cpu: "500m"
            requests:
              memory: "256Mi"
              cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: log-output-svc
  namespace: exercises
spec:
  selector:
    app: log-output
  ports:
    - name: http
      port: 30081
      protocol: TCP
      targetPort: 3001
```

___

- [ingress.yaml](./manifests/ingress.yaml)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pingpong-log-output-ingress
  namespace: exercises
  labels:
    name: pingpong-log-output
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: log-output-svc
                port:
                  number: 30081
          - path: /pingpong
            pathType: Prefix
            backend:
              service:
                name: pingpong-svc
                port:
                  number: 30081
          - path: /pings
            pathType: Prefix
            backend:
              service:
                name: pingpong-svc
                port:
                  number: 30081
```

To make updating and pushing images easier, I created a shell script that only
needs a tag to we want to assign to the image and it run with the following:

```shell
  ./dockerize.sh -t v2.7
```

To dynamically create secret manifest and run all the manifests I also created a
shell script:

```shell
  ./deploy.sh
```

This decrypts and created our secrets manifests from the encrypted
_secret.enc.yaml_

```sh
  #!/usr/bin/env bash
  
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  NC='\033[0m' # No Color (reset)
  
  printf "${BLUE}Running Kubernetes deployments script${NC}\n"
  
  if [ ! -f manifests/secret.yaml ]; then
    printf "\n${GREEN}Creating secret.yaml file${NC}\n"
    export SOPS_AGE_KEY_FILE=$(pwd)/key.txt
    sops --decrypt secret.enc.yaml > manifests/secret.yaml
  else
    printf "\n${YELLOW}manifests/secret.yaml already exists${NC}\n"
  fi
  
  printf "\n${GREEN}Deploying Kubernetes resources running manifests${NC}\n"
  
  kubectl apply -f manifests
  if [ $? -ne 0 ]; then
    printf -e "\n${RED}Error: Failed to apply Kubernetes manifests${NC}\n"
    exit 1
  fi
  
  printf "\n${GREEN}Deployment successfully completed${NC}"
```

The image of the hash writer can be
found [here](https://hub.docker.com/repository/docker/sirpacoder/hash-generator/general)

The image of the hash reader can be
found [here](https://hub.docker.com/repository/docker/sirpacoder/hash-reader/general)

The image of the pingpong can be
found [here](https://hub.docker.com/repository/docker/sirpacoder/pingpong/general)

With that,
I was able
to access to see hash on the browser and the number of requests
made. [http://localhost:8081](http://localhost:8081)
to see the number of
pings [http://localhost:8081/pings](http://localhost:8081/pings),
to increment the number of
pings [http://localhost:8081/pingpong](http://localhost:8081/pingpong),

