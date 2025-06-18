# Exercise 1.11: Persisting data

### To make te right configuration, I implemented the manifests files as follows:

- [log_output.yaml](manifests/log_output.yaml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: log-output
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
            claimName: files-claim
      containers:
      - name: hash-generator
        image: sirpacoder/hash-generator:v1.11
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
        image: sirpacoder/hash-reader:v1.11
        imagePullPolicy: Always
        volumeMounts:
          - name: shared-files
            mountPath: /usr/src/app/shared/files
        env:
          - name: READER_PORT
            value: "3001"
          - name: HASH_FILE_PATH
            value: "/usr/src/app/shared/files/hash.txt"
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
spec:
  selector:
    app: log-output
  ports:
  - port: 30081
    protocol: TCP
    targetPort: 3001
```
___
- [pingpong.yaml](manifests/pingpong.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pingpong
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
            claimName: files-claim
      containers:
      - name: pingpong
        image: sirpacoder/pingpong:v1.11
        imagePullPolicy: Always
        volumeMounts:
          - name: shared-files
            mountPath: /usr/src/app/shared/files
        env:
          - name: PORT
            value: "8000"
          - name: HASH_FILE_PATH
            value: "shared/files/hash.txt"
          - name: COUNT_FILE_PATH
            value: "shared/files/count.txt"
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
  name: pingpong-svc
spec:
  selector:
    app: pingpong
  ports:
  - port: 30081
    protocol: TCP
    targetPort: 8000
```
___
- [ingress.yaml](./manifests/ingress.yaml)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: log-output
  labels:
    name: log-output
spec:
  rules:
  - http:
      paths:
      - path: "/"
        pathType: Prefix
        backend:
          service:
            name: log-output-svc
            port:
              number: 30081
      - path: "/pingpong"
        pathType: Prefix
        backend:
          service:
            name: pingpong-svc
            port:
              number: 30081
```

Creating a new cluster using the following script, I choose port 3004 to avoid conflict when running the application locally

Before running the script to build the pods, it was necessary to run:

```shell
  docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube
```
then,
```shell
  k3d cluster create --port 3004:30081@agent:0 -p 8080:80@loadbalancer --agents 2
```

Create the volumes
```shell
  kubectl apply -f volumes
```
Apply manifests
```shell
  kubectl apply -f manifests
```

Then we can delete the workloads by running
```shell
  kubectl delete -f manifests
```

The image of the hash writer can be found [here](https://hub.docker.com/repository/docker/sirpacoder/hash-generator/general)

The image of the hash reader can be found [here](https://hub.docker.com/repository/docker/sirpacoder/hash-reader/general)

The image of the pingpong can be found [here](https://hub.docker.com/repository/docker/sirpacoder/pingpong/general)

With that,
I was able
to access the [http://localhost:8080/api/strings](http://localhost:8080/api/strings)
to see hash and the [http://localhost:8080/pingpong](http://localhost:8080/pingpong),
to see hash on the browser and the number of requests made
