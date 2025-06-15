# Exercise 1.07: External access with Ingress

### In order to make te right configuration I implemented the manifests files as follow:

- [deployment.yaml](../log_output/manifests/deployment.yml)
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
      containers:
      - name: log-output
        image: sirpacoder/log-output:v1.7
        imagePullPolicy: Always
        env:
          - name: PORT
            value: "3001"
        resources:
          limits:
            memory: "256Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "500m"

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
- [service.yaml](../project/manifests/service.yaml)

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
then created a new cluster using the following script

```shell
  k3d cluster create --port 3000:30081@agent:0 -p 8080:80@loadbalancer --agents 2
```

followed by
```shell
  kubectl apply -f manifests/
```

with that I was able to access the [http://localhost:8080/api/strings](http://localhost:8080/api/strings) port from the broswer

The image are available in my Docker Hub at [log-output](https://hub.docker.com/r/sirpacoder/log-output/tag)
