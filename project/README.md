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
              command: [ "/bin/sh", "-c" ]
              args:
                - |
                  export BACKUP_FILE="/tmp/todo-backup-$(date +%Y-%m-%d).sql"
                  pg_dump -U "${POSTGRES_USER}" -h "${POSTGRES_HOST}" -d "${POSTGRES_DB}" > "${BACKUP_FILE}"
                  gcloud auth activate-service-account --key-file /secrets/key.json
                  gsutil cp "${BACKUP_FILE}" gs://todo-db-backups/
                  echo "Backup completed: ${BACKUP_FILE} uploaded to gs://todo-db-backups"
              volumeMounts:
                - name: gcs-backup-key-volume
                  mountPath: /secrets
                  readOnly: true
          restartPolicy: OnFailure
          volumes:
            - name: gcs-backup-key-volume
              secret:
                secretName: gcs-backup-key
                optional: false
```

> **ℹ️ Note:**  
> `gsutil` (along with other Google Cloud tools and libraries) automatically
> looks for credentials using the `GOOGLE_APPLICATION_CREDENTIALS` environment
> variable.
>
> This is the **standard and recommended** method for authentication when
> running in environments such as:
> - Kubernetes pods
> - Virtual machines (VMs)
> - Local development setups
>
> By setting `GOOGLE_APPLICATION_CREDENTIALS` to point to the service account
> key file (`/secrets/key.json`), tools like `gsutil` can authenticate
> seamlessly
> without additional configuration.

Secret created for the cronjob to run:
[db-backup-svc-account-key.yaml](deploy/kubernetes/base/db-backup-svc-account-key.yaml)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gcs-backup-key
type: Opaque
data:
  key.json: ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAicGFjby1sZWFybmluZy1wcm9qZWN0IiwKICAicHJpdmF0ZV9rZXlfaWQiOiAiYTNkYjlkYzk4ZTk3YjRkMTU2ZTI1MDFhMmU2NDI1M2FiMWJmNzExMiIsCiAgInByaXZhdGVfa2V5IjogIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZnSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2d3Z2dTa0FnRUFBb0lCQVFDNFFGR2pic1N4dFRFK1xuTFZJNjN3aUExZkZoZlZnUXJMSkdBaitmRUtmaXdUTzBQS2tNeVE2RnZ3MXpTcTQvbnY2eFFCbTl2RURVTFNhY1xuUEFncTF5M3VvMXREVlZpK3JVRTRmZGxzRXZiUWZxb0huM3BERytNK2NZZlVBUG1NZ0U0S3BpVWtRMVYxcTRMSFxuU2dpeW5JQzFXbi9zK1V1aGpNQm9ENWlDZjlVQzFWNTl2Q2E3RkwyZUduUmVSNHRaVlc0dkFsV0srZkJkSVZmWVxueDk0WnlKRFQ3Vmg4enpDVUZWT09Hc2JEcmtiZmV4eGw5d29qTStGd004ZU5oQmdBN003ZTBuc3NMT1ZOVktmY1xuc0FRMTdtRzhxYU9sZks0NmJySUJEODRIU1l1VWNRUjY5NnNPZ1V4RXVtcXpjOXZNRmtZbktXYjJkV1U1bjRHa1xuamVSTkVYcFpBZ01CQUFFQ2dnRUFET2lZcjZJUmpyKzZpUGdrNURIL0J3TzJLeFhjaHlLS1JPUmdiN1Q3aGlQeVxuQ3VVYkZPVzdLanlsNVJkczJORTdWOUM5WFBFays1aUVOWHJ4T1lzazBTekp0cEJ5ckwwM3JnMEhJQTYrRXdKa1xueUM3d29tWUFTRDRzL1hucUFlRjFWa0tvcEg5QkxBTE5vVWU3RDBSdXNnWDZvM0Fkejk0c0ZyNU0rWXVhTVY0Q1xuQUw4Y0ZrTG5BRGZCUDRmc1NkbmEvcmp5YTA3b3JqbFM2aW94MjNSWkdlRGZyUFduQ3NPUlc3QVRwSFRnYUpueVxubFBXOFY5RTJYR09JckZpeWVyeENUZEVsakhLdmtWZSt2SFRyWmg0cDBrMmNzZmFYUk83d1Vac2dNRkJRVGt2V1xuQkpqOXZhbmlXczNaaEEycFpubDJtWkQzUWQwU2xhQ3RtdDZnNyszSmJ3S0JnUURxZmVFSFhPRDI3NFhXQkwxWFxuMG9ZSm9qMEY3bWJmYnR2SWRYbm9PT0xUeGE1SEd4SUFRaUpTbi9ycUNoUEVDYnJySHdWZm94cWhhU2hrdTRKZFxuckVnWnpWUkM0Si84dTVFM1pnQldWUVlvRlJjNGJaL0R1Vm1IaVZiTGZ3TDBWTHlvUDFqeTBuS1BYRXBPQ0U1Y1xuMWsrMFNudksxd0dDZitySUNHR3NyaDZXYXdLQmdRREpKcjBwMUVyWUdVZ2YwMFdUb2g5RlMzVHVsVlg4cUFVWlxuY0R2UG1DQWNjSzcrVXFPUnM0UEQ1RkN2Y3k4Rnh2dlAvVTB5L0hVZjcweHk2WklQVlV5VmdiUUExMThUcXFRRVxuVUs0dWp6am9CK1NMMjlLektuU1RyTnhKV0VVMzJIZERVR05udHloM3lmVFJ4RTllNUtxYXViZExFSGJKcmg5Q1xub0RPekFRSjdTd0tCZ1FDR0xxNGNSbnU5RW1jbGh1VEtZbitzOTVldjB6SXUzUU1MZkozYjB1R0ppVzhtNVVpeFxudVNabTNZRDVkL2JEa1VYUzBaZURtSlBlbFl3MXlFN2JSNENpc3lwcWNwdGFSZ0xkRHBOVzA2U0lQemxnWXVxdlxuVjFyeUFoY1dyNEdEU3hJQnZPNHJWVjJVeDUwRmRoOVJaSm1MYzZ2TzhLVytoWEJXTXVXaHFLbDhMUUtCZ0RiMlxuOHZHZkpPUnY1Qmx1TGJEdHVBWERYS3hrK2g0VCszQzhEbHZuZ2I3RHU4MmEzejlOQWxCZzd2dENTak1WOEhFaFxuRWh0QWlQQzAvdnJYZ0NYWWRSalZYRTV1aTNoZ1JIazVZcDh1VzZwcm5iUHAyV1ZEMEo4WnVRZ0Jxc2hieWhzR1xudUdMNjFZQUdHM1BHWkxuVldoajFiblNBaHpVTTgxWE5XTk10RDNTSkFvR0JBTVBBbnR5SEFad1NCNnIrR2VlRlxuMTdobm9DdVF3M2hjS092cjZhcGpNaVhQQUVkL3hFeTNKY0owcVdueUZYaFFnVm9GWlVDRGhQb1Y1N1dibWdGcVxuVG1adFhjMlZqb2paUGlGZUFPdUVVTXU4MlVsZ2pHT3ZoS3I5MjcxZlM5Wmp3MkQxMStBc3YvSjRFUzZWcDNGN1xuR2UxZ2JoaFRjbGRtTG52ODdQVmJxUW0yXG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLAogICJjbGllbnRfZW1haWwiOiAiZGItYmFja3VwLWFnZW50QHBhY28tbGVhcm5pbmctcHJvamVjdC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgImNsaWVudF9pZCI6ICIxMDY3Njk5NDA4NjEzNDIzMDc5MTAiLAogICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsCiAgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsCiAgImF1dGhfcHJvdmlkZXJfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvdjEvY2VydHMiLAogICJjbGllbnRfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L2RiLWJhY2t1cC1hZ2VudCU0MHBhY28tbGVhcm5pbmctcHJvamVjdC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgInVuaXZlcnNlX2RvbWFpbiI6ICJnb29nbGVhcGlzLmNvbSIKfQo=
```
