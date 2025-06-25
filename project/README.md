# Exercise 2.6. The project, step 10

### Make sure that your project has no hard coded ports, URL or other configurations in the source code. Pass all the configurations to pods as env variables that are defined either in a config map or in deployments.
- [namespace.yaml](namespace/namespace.yaml)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: project 
```

- [client.yaml](./manifests/client.yaml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: client-dep
  namespace: project
spec:
  selector:
    matchLabels:
      app: client
  template:
    metadata:
      labels:
        app: client
    spec:
      containers:
      - name: client
        image: sirpacoder/client:v1.13
        imagePullPolicy: Always
        env:
          - name: REACT_APP_SERVER_URL
            value: http://localhost:8081
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
  name: client-svc
  namespace: project
spec:
  type: ClusterIP
  selector:
    app: client
  ports:
  - port: 30081
    protocol: TCP
    targetPort: 3000
```

[server.yaml](./manifests/server.yaml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: server-dep
  namespace: project
spec:
  replicas: 1
  selector:
    matchLabels:
      app: server
  template:
    metadata:
      labels:
        app: server
    spec:
      volumes:
        - name: shared-files
          persistentVolumeClaim:
            claimName: project-files-claim
      containers:
      - name: server
        image: sirpacoder/server:v1.13
        imagePullPolicy: Always
        env:
          - name: PORT
            value: "3001"
          - name: IMAGE_FILE_PATH
            value: "files/image.jpg"
          - name: TIMESTAMP_FILE_PATH
            value: "files/timestamp.txt"
        volumeMounts:
          - name: shared-files
            mountPath: /usr/src/app/files
        resources:
          limits:
            memory: "1Gi"
            cpu: "1000m"
          requests:
            memory: "256Mi"
            cpu: "500m"

---

apiVersion: v1
kind: Service
metadata:
  name: server-svc
  namespace: project
spec:
  type: ClusterIP
  selector:
    app: server
  ports:
  - port: 30081
    protocol: TCP
    targetPort: 3001
```
___
- [ingress.yaml](./manifests/ingress.yaml)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: project
  namespace: project
  labels:
    name: project
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: client-svc
            port:
              number: 30081
      - path: /api/image
        pathType: Prefix
        backend:
          service:
            name: server-svc
            port:
              number: 30081
      - path: /api/todos
        pathType: Prefix
        backend:
          service:
            name: server-svc
            port:
              number: 30081

```
The cluster is created running the following command in the terminal
```shell
  k3d cluster create --port 4000:30081@agent:0 -p 8081:80@loadbalancer --agents 2
```

Before creating the storage, we make sure tu run
```shell
  docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube
```

Before creating volumes, pods, services and ingress we create the designated namespace by running
```shell
  kubectl apply -f namespace
```

Then we deploy our storage
```shell
  kubectl apply -f volumes
```

Follow by the microservices, client and server 
```shell
  kubectl apply -f manifests
```

After that,
we can open our client (frontend)
in [http://localhost:8081](http://localhost:8081) port from the browser

Where we can also se the response from the server in [http://localhost:8081/api/todos](http://localhost:8081/api/todos) and [http://localhost:8081/api/image](http://localhost:8081/api/image)
