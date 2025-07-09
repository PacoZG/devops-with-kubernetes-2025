# Exercise 4.2. The project, step 21

#### Create the required probes and endpoint for The Project to ensure that it's working and connected to a database. Test that the probe indeed works with a version without database access, for example by supplying a wrong database URL or credentials.

- Read documentation for Kubernetes Engine Monitoring here(opens in a new tab)
  and setup logging for the project in GKE. You can optionally include
  Prometheus as well. Submit a picture of the logs when a new todo is created.

## ✅ Changes that needed to be done to the Project application

### 1. Change the code to create the endpoint to the server

```js
app.use('/healthz', async (_, res) => {
  try {
    const isDbConnected = await checkDbConnection()
    if (isDbConnected) {
      console.log(`Received a request to healthz and responding with status 200`)
      res.status(200).send('Application ready')
    } else {
      console.log(`Received a request to healthz and responding with status 500 - DB not connected`)
      res.status(500).send('Application not Ready - Database connection failed')
    }
  }
  catch (error) {
    console.error(`[ERROR] Healthz check failed:`, error.message)
    res.status(500).send(
      'Application not Ready - Internal server error during health check')
  }
})
```

where checkDbConnection function is:

```js
import { pool } from './initDb.js'

const checkDbConnection = async () => {
  try {
    // Perform a simple query to check the connection
    await pool.query('SELECT 1')
    return true
  }
  catch (error) {
    console.error('Database connection check failed:', error.message)
    return false
  }
}

export default checkDbConnection

```

### 2. I added readiness and liveness probes to the application server so that the

application will be only ready when the database is running

---
[server.yaml](deploy/kubernetes/base/01-server.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: server-dep
spec:
  replicas: 1
  strategy:
    type: Recreate
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
          image: SERVER/IMAGE
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
                  name: project-secrets
                  key: postgres-password
          volumeMounts:
            - name: shared-files
              mountPath: /usr/src/app/files
          readinessProbe:
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 10
            httpGet:
              path: /healthz
              port: 3001
          livenessProbe:
            initialDelaySeconds: 20
            periodSeconds: 5
            httpGet:
              path: /healthz
              port: 3001
          resources:
            requests:
              memory: '64Mi'
              cpu: '250m'
            limits:
              memory: '516Mi'
              cpu: '500m'
```

and a backendConfig to allow the connections with the endpoint

```yaml
apiVersion: cloud.google.com/v1
kind: BackendConfig
metadata:
  name: server-http-hc-config
spec:
  healthCheck:
    checkIntervalSec: 15
    port: 3001
    type: HTTP
    requestPath: /healthz
```

I tested with the wrong path to the healthz probe and in fact the server would
never be deployed

```
Running Kubernetes deployments script
Ensuring 'main' namespace exists...
Error from server (AlreadyExists): namespaces "main" already exists
Setting working namespace...
Current namespace: main
Navigating to project/deploy directory
Checking for Kubernetes volume: project-files-claim in namespace main
Kubernetes volume project-files-claim already exists in namespace main. Skipping creation.
Checking for secret.yaml...
Creating secret.yaml file
Setting images via kustomize
Deploying Kubernetes resources
configmap/config-map-variables unchanged
secret/project-secrets unchanged
service/client-svc unchanged
service/postgres-svc unchanged
service/server-svc unchanged
deployment.apps/client-dep configured
deployment.apps/server-dep configured
statefulset.apps/postgres configured
cronjob.batch/create-daily-todo-cron-job unchanged
cronjob.batch/todo-db-backup unchanged
ingress.networking.k8s.io/project unchanged
Waiting for deployment "client-dep" rollout to finish: 0 of 1 updated replicas are available...
deployment "client-dep" successfully rolled out
Waiting for deployment "server-dep" rollout to finish: 0 of 1 updated replicas are available...
Waiting for deployment "server-dep" rollout to finish: 0 out of 1 new replicas have been updated...
Waiting for deployment "server-dep" rollout to finish: 0 of 1 updated replicas are available...
Waiting for deployment spec update to be observed...
Waiting for deployment spec update to be observed...
Waiting for deployment "server-dep" rollout to finish: 0 out of 1 new replicas have been updated...
Waiting for deployment "server-dep" rollout to finish: 1 old replicas are pending termination...
```
