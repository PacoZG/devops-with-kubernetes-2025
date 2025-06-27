# Exercise 2.9 The project, step 12

### Create a CronJob that generates a new todo every hour to remind you to do 'Read <URL>', here <URL> is a Wikipedia article that was decided by the job randomly. It does not have to be a hyperlink, the user can copy-paste the URL from the todo.

No changes were necessary in the application or manifests, except for creating
the configMap containing the script that the CronJob will execute, shown below.

---

- [configMap.yaml](manifests/create-daily-todo-configMap.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: create-daily-todo
  namespace: project
data:
  create-daily-todo.sh: |-
    #!/usr/bin/env sh

    # Exit immediately if a command exits with a non-zero status.
    set -e

    echo "Posting the new TODO to $SERVER_URL"

    URL_GEN_OUTPUT=$(curl -sS -w "%{url_effective}\n" -I -L https://en.wikipedia.org/wiki/Special:Random -o /dev/null)
    URL_GEN_STATUS=$?

    if [ $URL_GEN_STATUS -eq 0 ]; then
      URL=$(echo "$URL_GEN_OUTPUT" | tail -n 1)
      echo "Generated random Wikipedia URL: $URL"
    else
      echo "Error: Failed to generate random Wikipedia URL (curl exit code: $URL_GEN_STATUS)." >&2
      echo "Curl error details: $URL_GEN_OUTPUT" >&2
      exit 1
    fi

    TODO_POST_RESPONSE=$(curl -s --show-error -X POST -H "Content-Type: application/json" -d '{"text": "<a href='${URL}' target=_blank>'${URL}'<a/>"}' "$SERVER_URL/api/todos")
    TODO_POST_STATUS=$?

    if [ $TODO_POST_STATUS -eq 0 ]; then
      echo "SUCCESS: New TODO posted successfully!"
    else
      echo "ERROR: Failed to post new TODO (curl exit code: $TODO_POST_STATUS)." >&2
      echo "Curl error details: $TODO_POST_RESPONSE" >&2
      exit 1
    fi
```

---

- [cronJob.yaml](manifests/cronJob.yaml)

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: create-daily-todo-cron-job
  namespace: project
spec:
  schedule: "* 8 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: todo-generator-script
              image: curlimages/curl:latest
              command: [ "/bin/sh", "/etc/config/scripts/create-daily-todo.sh" ]
              env:
                - name: SERVER_URL
                  value: http://server-svc:30081
              volumeMounts:
                - name: todo-script
                  mountPath: /etc/config/scripts
                  readOnly: true
          restartPolicy: OnFailure
          volumes:
            - name: todo-script
              configMap:
                name: create-daily-todo
                items:
                  - key: create-daily-todo.sh
                    path: create-daily-todo.sh

```

__The cronjob will be executed every day at 8:00__

We can open our client (frontend)
in [http://localhost:8081](http://localhost:8081) port from the browser

Where we can also se the response from the server
in [http://localhost:8081/api/todos](http://localhost:8081/api/todos)
and [http://localhost:8081/api/image](http://localhost:8081/api/image)
