# Exercise 3.11. The project, step 19

#### Set sensible resource requests and limits for the project. The exact values are not important. Just test what works. You may find the command kubectl top pods useful.

During the development of the application and its Kubernetes manifests, I
continuously evaluated and adjusted the resource requests and limits for each
workload. This ensured efficient utilization based on the specific needs of each
component.

Below are the manifests, each with resource configurations tailored to its
expected load and behavior.

[client.yaml](deploy/kubernetes/base/00-client.yaml)

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
          image: sirpacoder/client:v3.5
          imagePullPolicy: Always
          env:
            - name: REACT_APP_SERVER_URL
              value: ""
          resources:
            requests:
              memory: '64Mi'
              cpu: '250m'
            limits:
              memory: '516Mi'
              cpu: '500m'
```

[server.yaml](deploy/kubernetes/base/01-server.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: server-dep
  namespace: project
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
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
          image: sirpacoder/server:v3.5
          imagePullPolicy: Always
          env:
            - name: PORT
              value: "3001"
            - name: IMAGE_FILE_PATH
              value: "files/image.jpg"
            - name: TIMESTAMP_FILE_PATH
              value: "files/timestamp.txt"
            - name: POSTGRES_HOST
              valueFrom:
                configMapKeyRef:
                  name: config-map-variables
                  key: postgres-host
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: project-secret
                  key: postgres-password
          volumeMounts:
            - name: shared-files
              mountPath: /usr/src/app/files
          resources:
            requests:
              memory: '64Mi'
              cpu: '250m'
            limits:
              memory: '516Mi'
              cpu: '500m'
```
