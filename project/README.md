# Exercise 2.8. The project, step 11

### Create a database and save the todos there. Again, the database should be defined as a stateful set with one replica. Use Secrets and/or ConfigMaps to have the backend access the database.

- [postgres.yaml](manifests/postgres.yaml)

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: project
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
                  name: project-secret
                  key: postgres-password
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
  namespace: project
spec:
  ports:
    - port: 5432
  clusterIP: None
  selector:
    app: postgres
```

---

## UPDATE

- [server.yaml](./manifests/server.yaml)

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
          image: sirpacoder/server:v2.7
          imagePullPolicy: Always
          env:
            - name: PORT
              value: "3001"
            - name: IMAGE_FILE_PATH
              value: "files/image.jpg"
            - name: TIMESTAMP_FILE_PATH
              value: "files/timestamp.txt"
            - name: POSTGRES_HOST
              value: postgres-svc
            - name: POSTGRES_USER
              value: postgres
            - name: POSTGRES_DB
              value: postgres
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: project-secret
                  key: postgres-password
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

- [namespace.yaml](namespace/namespace.yaml)

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: project 
```

---

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

---

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

To make updating and pushing images easier, I created a shell script that only
needs a tag to we want to assign to the image and it run with the following:

```shell
  ./dockerize.sh -t v2.7
```

To dynamically create secret manifest and run all the manifests I also created a
shell script: [deploy.sh](deploy.sh)

```shell
  ./deploy.sh
```

This decrypts and created our secrets manifests from the encrypted
_secret.enc.yaml_

After that,
we can open our client (frontend)
in [http://localhost:8081](http://localhost:8081) port from the browser

Where we can also se the response from the server
in [http://localhost:8081/api/todos](http://localhost:8081/api/todos)
and [http://localhost:8081/api/image](http://localhost:8081/api/image)
