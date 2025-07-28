# 🚀 Exercise 3.4. Rewritten routing

### 🎯 Goal

Make this change to your ping-pong app and to the HTTP route!

Note that replaceFullPath is not yet supported in GKE so you should use
replacePrefixMatch, see here for more.

Changes to the pingpong application were necessary and can be
found [here](./pingpong/src/controller/pingPongRouter.js)

- [pingPongRouter.yaml](./pingpong/src/controller/pingPongRouter.js)

```js
pingPongRouter.get('/', async (req, res) => {
  console.log('GET request to path / done successfully')
  let counter = await getCounter()
  counter += 1
  await setCounter(counter)

  res.status(200).send(`
    <div>
      <p>Ping / Pongs: ${counter}</p>
    </div>`)
})
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
      filters:
        - type: URLRewrite
          urlRewrite:
            path:
              type: ReplacePrefixMatch
              replacePrefixMatch: /
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

