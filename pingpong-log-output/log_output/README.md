# Exercise 1.10: Even more services

### To make te right configuration I implemented the manifests files as follows:

- [deployment.yaml](./manifests/deployment.yml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: log-output-dep
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
        - name: files
      containers:
      - name: hash-generator
        image: sirpacoder/hash-generator:v1.10
        imagePullPolicy: Always
        env:
          - name: PORT
            value: "3002"
        volumeMounts:
          - name: files
            mountPath: /app/files
        resources:
          limits:
            memory: "256Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "500m"
      - name: hash-reader
        image: sirpacoder/hash-reader:v1.10
        imagePullPolicy: Always
        env:
          - name: PORT
            value: "3001"
        volumeMounts:
          - name: files
            mountPath: /app/files
        resources:
          limits:
            memory: "256Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "500m"
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
```
___
- [service.yaml](./manifests/service.yaml)

```yaml
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
then create a new cluster using the following script

```shell
  k3d cluster create --port 3004:30081@agent:0 -p 8080:80@loadbalancer --agents 2
```

followed by
```shell
  kubectl apply -f ./manifests
```

The image of the hash writer can be found [here](https://hub.docker.com/repository/docker/sirpacoder/hash-generator/general)

The image of the hash reader can be found [here](https://hub.docker.com/repository/docker/sirpacoder/hash-reader/general)

with that I was able to access the [http://localhost:8080/api/strings](http://localhost:8080/api/strings) port from the browser
