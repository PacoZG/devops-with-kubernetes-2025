# Project v1.0

### This exercise has the same content in the root folder as in previous exercise, the only difference is the implementation of the service.yaml file and the commands used to be able to access to the deployment port via the browser.

The image can be found [here](https://hub.docker.com/r/sirpacoder/server/tags)
### In order to make te right configuration I implemented the manifests files as follow:

- [deployment.yaml](../project/manifests/deployment.yml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: project-dep
spec:
  selector:
    matchLabels:
      app: project
  template:
    metadata:
      labels:
        app: project
    spec:
      containers:
      - name: server
        image: sirpacoder/server:v1.5
        imagePullPolicy: Always
        env:
          - name: PORT
            value: "3001"
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
```
___
- [ingress.yaml](../project/manifests/ingress.yaml)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: project
  labels:
    name: project
spec:
  rules:
  - http:
      paths:
      - path: "/"
        pathType: Prefix
        backend:
          service:
            name: server-svc
            port:
              number: 30081
```
___
- [service.yaml](../project/manifests/service.yaml)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: server-svc
spec:
  selector:
    app: project
  ports:
  - port: 30081
    protocol: TCP
    targetPort: 3001
```
and then created a new cluster using the following script

```shell
  k3d cluster create --port 4000:30081@agent:0 -p 8080:80@loadbalancer --agents 2
```

With that I was able to access the [http://localhost:8080/api/todos](http://localhost:8080/api/todos) port from the browser
___

