# 🚀 Exercise 3.3. To the Gateway

### 🎯 Goal

Replace the Ingress with Gateway API. See here for more about HTTP routing.

Configuration for the Gateway can be found [here](./kubernetes/gateway)

- [gateway.yaml](./kubernetes/gateway/gateway.yaml)

```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: Gateway
metadata:
  name: pingpong-log-output-gateway
  namespace: exercises
spec:
  gatewayClassName: gke-l7-global-external-managed
  listeners:
    - name: http
      protocol: HTTP
      port: 80
      allowedRoutes:
        kinds:
          - kind: HTTPRoute
```

- [route.yaml](./kubernetes/gateway/route.yaml)

```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: pingpong-log-output-route
  namespace: exercises
spec:
  parentRefs:
    - name: pingpong-log-output-gateway
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /pingpong
      backendRefs:
        - name: pingpong-svc
          port: 80
    - matches:
        - path:
            type: PathPrefix
            value: /reset
      backendRefs:
        - name: pingpong-svc
          port: 80
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: log-output-svc
          port: 80 
```

