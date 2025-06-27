# Exercise 2.9 The project, step 12

### Create a CronJob that generates a new todo every hour to remind you to do 'Read <URL>', here <URL> is a Wikipedia article that was decided by the job randomly. It does not have to be a hyperlink, the user can copy-paste the URL from the todo.

No changes were necessary in the application or manifests, except with adding a
log with the values of the new todo and throwing an error when the length
exceeds 140 characters

By running the following we can open the Grafana environment

```shell
  export POD_NAME=$(kubectl --namespace prometheus get pod -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=kube-prometheus-stack-1751023888" -oname)
  kubectl --namespace prometheus port-forward $POD_NAME 3000
```

On explore I can see many pods of apps, selecting _app: server_ I can see the
logs produced bby the application.

We can open our client (frontend)
in [http://localhost:8081](http://localhost:8081) port from the browser

Where we can also se the response from the server
in [http://localhost:8081/api/todos](http://localhost:8081/api/todos)
and [http://localhost:8081/api/image](http://localhost:8081/api/image)
