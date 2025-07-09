# 🚀 Exercise 4.1: Readines probe

# ✅ Kubernetes Readiness Probes for Applications

## 🏓 1. Ping-pong Application

- **Goal**: The app should only be marked *ready* when it can successfully
  connect to the **PostgreSQL database**.
- **Implementation**:
  Add a `readinessProbe` that checks DB connectivity via an HTTP endpoint (e.g.,
  `/healthz`).

- [pingpong.yaml](deploy/kubernetes/base/00-pingpong.yaml)

  ```yaml
  readinessProbe:
    httpGet:
      path: /healthz
      port: 8000
    initialDelaySeconds: 10
    periodSeconds: 5
    failureThreshold: 10
  ```

- Ensure the `/healthz` endpoint fails (e.g., returns 500) when the app cannot
  connect to the database.

---

## 📤 2. Log Output Application

- **Goal**: The app should only be marked *ready* when it can receive data from
  the Ping-pong application.
- **Implementation**:
  Add a `readinessProbe` that checks if the Ping-pong service is reachable or
  that expected data is available.

- [log_output.yaml](deploy/kubernetes/base/01-log_output.yaml)

  ```yaml
  readinessProbe:
    httpGet:
      path: /healthz
      port: 3001
    initialDelaySeconds: 10
    periodSeconds: 5
    failureThreshold: 10
  ```

- Again, ensure that the endpoint fails (e.g., returns 500) until the Ping-pong
  app is accessible and functional.

---

Also created a backend manifest for GCP to be able to call the endpoint

[backendconfig.yaml](deploy/kubernetes/base/06-backendconfig.yaml)

```yaml
apiVersion: cloud.google.com/v1
kind: BackendConfig
metadata:
  name: pingpong-http-hc-config
spec:
  healthCheck:
    checkIntervalSec: 15
    port: 8000
    type: HTTP
    requestPath: /healthz
---
apiVersion: cloud.google.com/v1
kind: BackendConfig
metadata:
  name: log-output-http-hc-config
spec:
  healthCheck:
    checkIntervalSec: 15
    port: 3001
    type: HTTP
    requestPath: /healthz

```

* Note: Ingress routing can take several minutes to become fully active, so
  there may be a delay before anything is visible in the browser.

Alternatively, you can check it from the GCP Console:

> Kubernetes Engine > Gateways, Services & Ingress

> Ingress

### 🧭 Useful Commands

```shell
  kubectl get ingress
```

```
NAME                          CLASS    HOSTS   ADDRESS          PORTS   AGE
pingpong-log-output-ingress   <none>   *       35.241.59.104    80      19m
```

These help monitor pod status, logs, and troubleshoot any issues.


