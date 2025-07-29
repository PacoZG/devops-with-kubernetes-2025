# 🚀 Exercise 5.4. Wikipedia with init and sidecar

## 🎯 Project Goal

Write an app that serves Wikipedia pages. The app should contain

the main container based on nginx image, that just serves whatever content it
has in the public www location
init container that curls page https://en.wikipedia.org/wiki/Kubernetes (opens
in
a new tab) and saves the page content to the public www directory for the main
container
a sidecar container that waits for a random time between 5 and 15 minutes, curls
for a random Wikipedia page in
URL https://en.wikipedia.org/wiki/Special:Random (opens in a new tab) and saves
the page content to the public www directory for the main container

The following is the implementation of the app:

- [wikipedia-app.yaml](./wikipedia-app.yaml)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: wikipedia-app
  labels:
    app: wikipedia
spec:
  # Define a shared emptyDir volume that will be accessible by all containers in the Pod.
  # This volume is temporary and exists only as long as the Pod is running.
  volumes:
    - name: wikipedia-content
      emptyDir: { }

  # Init Containers run to completion before any main container starts.
  # If multiple init containers are defined, they run sequentially.
  initContainers:
    - name: fetch-kubernetes-page
      image: curlimages/curl:latest # Using a lightweight curl image to fetch content
      # The command fetches the Kubernetes Wikipedia page and saves it as index.html
      # in the shared volume, which is mounted at /usr/share/nginx/html.
      command:
        - "sh"
        - "-c"
        - "echo 'Fetching initial Kubernetes page...' && curl -s https://en.wikipedia.org/wiki/Kubernetes -o /usr/share/nginx/html/index.html && echo 'Initial page fetched.'"
      volumeMounts:
        - name: wikipedia-content
          mountPath: /usr/share/nginx/html # Mount the shared volume to Nginx's default web root

  # Main Containers are the primary application containers that run concurrently.
  containers:
    - name: nginx-server
      image: nginx:latest # The Nginx web server image
      ports:
        - containerPort: 80 # Expose port 80 for web traffic
      # Mount the shared volume to Nginx's default web root.
      # Nginx will serve the index.html file placed here by the init container and sidecar.
      volumeMounts:
        - name: wikipedia-content
          mountPath: /usr/share/nginx/html

    # Sidecar Containers run alongside the main container and provide auxiliary services.
    - name: random-page-fetcher
      image: curlimages/curl:latest # Another curl image for fetching random pages
      # The command continuously fetches random Wikipedia pages.
      # It waits for a random time between 5 and 15 minutes before each fetch.
      command:
        - "/bin/sh"
        - "-c"
        - |
          echo "Sidecar: Starting random page fetcher..."
          while true; do
            # Generate a random sleep time between 300 seconds (5 minutes) and 900 seconds (15 minutes)
            SLEEP_TIME=$(( RANDOM % 601 + 300 )) 
            echo "Sidecar: Waiting for $SLEEP_TIME seconds before next fetch..."
            sleep $SLEEP_TIME
            echo "Sidecar: Fetching a random Wikipedia page..."
            # Use -L to follow redirects, -s for silent, -o to output to file, -w to write effective URL to stdout
            FETCHED_URL=$(curl -L -s -o /usr/share/nginx/html/index.html -w "%{url_effective}" https://en.wikipedia.org/wiki/Special:Random)
            echo "Sidecar: Fetched and saved page from URL: $FETCHED_URL"
          done
      volumeMounts:
        - name: wikipedia-content
          mountPath: /usr/share/nginx/html # Mount the shared volume for the sidecar to write to

---
apiVersion: v1
kind: Service
metadata:
  name: wikipedia-service
spec:
  # Selects Pods with the label 'app: wikipedia' to route traffic to.
  selector:
    app: wikipedia
  # Defines the type of service. NodePort exposes the service on a port on each Node.
  type: NodePort
  ports:
    - protocol: TCP
      port: 80       # The port the service listens on
      targetPort: 80 # The port on the Pod (Nginx container) to forward traffic to
      # nodePort: <optional-port-number> # You can specify a port (e.g., 30000-32767)
      # If omitted, Kubernetes will assign one dynamically.

```

We can confirm both the pod and the service are running:

```
kubectl get all
NAME                READY   STATUS    RESTARTS   AGE
pod/wikipedia-app   2/2     Running   0          28s

NAME                        TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/kubernetes          ClusterIP   10.43.0.1       <none>        443/TCP        16m
service/wikipedia-service   NodePort    10.43.207.168   <none>        80:31331/TCP   8m57s
```

And by doing a port forward we can start exposing the saved page in the browser:

```
kubectl port-forward service/wikipedia-service 8080:80
Forwarding from 127.0.0.1:8080 -> 80
Forwarding from [::1]:8080 -> 80
Handling connection for 8080
```
