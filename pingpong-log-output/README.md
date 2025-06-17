# Exercise 1.10: Even more services

### To make te right configuration I implemented the manifests files as follows:

- [log-output.yaml](./manifests/log_output.yml)
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
- [ingress.yaml](../log-output/manifests/ingress.yaml)
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
- [pingpong.yaml](./manifests/pingpong.yml)

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
      containers:
      - name: pingpong
        image: sirpacoder/pingpong:v1.9
        imagePullPolicy: Always
        env:
          - name: PORT
            value: "8000"
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
then created a new cluster using the following script, I choose 3004 port to avoid conflict when running the application locally

```shell
  k3d cluster create --port 3004:30081@agent:0 -p 8080:80@loadbalancer --agents 2
```

followed by
```shell
  kubectl apply -f manifests/
```

With that I was able to access the [http://localhost:8080/api/strings](http://localhost:8080/api/strings) port from the browser and generate new string everytime I refresh the screen
and navigating to [http://localhost:8080/pingpong](http://localhost:8080/pingpong) I can see the counter increasing when refreshing the browser 

The image are available in my Docker Hub at [log-output](https://hub.docker.com/repository/docker/sirpacoder/log-output/tags)
The image are available in my Docker Hub at [log-output](https://hub.docker.com/repository/docker/sirpacoder/pingpong/tags)
