# 🚀 Exercise 3.2: Back to Ingress

### 🎯 Goal

Deploy the **Pingpong application** into a **Google Kubernetes Engine (GKE)**
cluster, exposing it with a **LoadBalancer service**.

Deploy the **Log output** and **Ping-pong** applications into **Google
Kubernetes Engine (GKE)** and expose it with __Ingress__.

**Ping-pong** will have to respond from `/pingpong` path. This may require you
to rewrite parts of the code.

---

## 🛠️ Kubernetes Configuration Updates

I had to rename the manifest files by prefixing them with numbers to ensure that
the Ingress is created only after the corresponding services and pods are up and
running.

---

- [04-ingress.yaml](kubernetes/manifests/04-ingress.yaml)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pingpong-log-output-ingress
  namespace: exercises
  labels:
    name: pingpong-log-output
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: log-output-svc
                port:
                  number: 80
          - path: /pingpong
            pathType: Prefix
            backend:
              service:
                name: pingpong-svc
                port:
                  number: 80
          - path: /reset
            pathType: Prefix
            backend:
              service:
                name: pingpong-svc
                port:
                  number: 80

```

---

## 🔍 Monitoring & Access

Once deployed, you can retrieve the Ingress configuration where the available IP
route is running the application by running:

```shell
  kubectl describe ingress pingpong-log-output-ingress -n exercises
```

* Note: Ingress routing can take several minutes to become fully active, so
  there may be a delay before anything is visible in the browser.

Alternatively, you can check it from the GCP Console:

> Kubernetes Engine > Gateways, Services & Ingress

> Ingress

### 🧭 Useful Commands

```
  kubectl get pods
  kubectl describe pod <pod-id>
  kubectl logs <pod-id> --since 1h
```

These help monitor pod status, logs, and troubleshoot any issues.


