# Exercise 3.10: The project, step 18

#### Create now a CronJob that makes a backup of your todo database (once per 24 hours) and saves it to Google Object Storage(opens in a new tab).

#### In this exercise, you can create the secret for the cloud access from the command line, thus, there is no need to create it in the GitHub action.

# 🛠️ GCP Postgres Backup Setup – Command Explanations

This document explains each command used to create and configure a service
account for backing up a Postgres database to Google Cloud Storage (GCS), and
exposing the credentials to Kubernetes.

---

### 1. Set Project ID

```shell
  export PROJECT_ID=paco-learning-project
```

Sets the active GCP project ID in an environment variable to use in later
commands.

### 2. Create a Service Account

```shell
  gcloud iam service-accounts create db-backup-agent \
    --display-name "Postgres Backup Agent"
```

Creates a new service account named `db-backup-agent` for running backup tasks.

### 3. Grant Storage Permissions

```shell
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:db-backup-agent@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"
```

Grants the service account permission to read and write objects in GCS buckets.

### 4. Create a Service Account Key

```shell
  gcloud iam service-accounts keys create key.json \
    --iam-account=db-backup-agent@$PROJECT_ID.iam.gserviceaccount.com
```

Generates a private key (`key.json`) for authenticating as the service account.

### 5. Grant GCS Bucket Permissions

```shell
  gsutil iam ch serviceAccount:db-backup-agent@paco-learning-project.iam.gserviceaccount.com:objectCreator gs://todo-db-backups
```

Gives the service account permission to **upload files** to the GCS bucket.

```shell
  gsutil iam ch serviceAccount:db-backup-agent@paco-learning-project.iam.gserviceaccount.com:objectViewer gs://todo-db-backups
```

Gives the service account permission to **read/download files** from the GCS
bucket.

### 6. Recreate Service Account Key

```shell
  gcloud iam service-accounts keys create key.json \
    --iam-account=db-backup-agent@paco-learning-project.iam.gserviceaccount.com
```

Re-generates the key file if needed again (e.g., if lost or rotated).

### 7. Create Kubernetes Secret from Key

```shell
  kubectl create secret generic --dry-run=client --output=yaml --from-file="key.json" \
    --type=Opaque > "db-backup-svc-account-key.yaml"
```

Creates a Kubernetes Secret YAML file with the service account key to mount in
backup jobs.

The following is the cronjob created for this purpose:
[todo-db-backup-cronjob.yaml](deploy/kubernetes/base/todo-db-backup-cronjob.yaml)

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: todo-db-backup
  namespace: project
spec:
  schedule: "0 6 * * *" # Every 24 hours at 6:00
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: google/cloud-sdk:slim
              env:
                - name: POSTGRES_DB
                  value: postgres
                - name: POSTGRES_HOST
                  valueFrom:
                    configMapKeyRef:
                      name: config-map-variables
                      key: postgres-host
                - name: POSTGRES_USER
                  value: postgres
                - name: POSTGRES_PASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: project-secret
                      key: postgres-password
                - name: GOOGLE_APPLICATION_CREDENTIALS
                  value: /secrets/key.json
              command:
                - /bin/sh
                - -c
                - |
                  export BACKUP_FILE="/tmp/todo-backup-$(date +%Y-%m-%d).sql"
                  pg_dump -U $PGUSER -h $PGHOST -d todo > $BACKUP_FILE
                  gcloud auth activate-service-account --key-file /secrets/key.json
                  gsutil cp $BACKUP_FILE gs://todo-db-backups/
              volumeMounts:
                - name: gcs-creds
                  mountPath: /secrets
                  readOnly: true
          restartPolicy: OnFailure
          volumes:
            - name: gcs-creds
              secret:
                secretName: gcs-creds

```
