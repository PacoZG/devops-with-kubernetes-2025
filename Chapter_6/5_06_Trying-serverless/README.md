# 🚀 Exercise 5.6. Trying serverless

## 🎯 Goal

Where Host is the URL you get with the following command:

Following all the steps I have the following results:

```
➜  ~ kubectl get pods -n knative-serving
NAME                                      READY   STATUS      RESTARTS   AGE
activator-58b66568b-l9tm5                 1/1     Running     0          10m
autoscaler-57696c7784-fdh99               1/1     Running     0          10m
controller-6fff687cd7-v8c25               1/1     Running     0          10m
default-domain-5drfq                      0/1     Completed   0          9m29s
net-kourier-controller-666c5cf64b-292ln   1/1     Running     0          10m
webhook-f867db5b8-mwzg2                   1/1     Running     0          10m

➜  ~ curl -H "Host: hello.default.192.168.240.3.sslip.io" http://localhost:8081

➜  ~ kubectl get ksvc
NAME    URL                                        LATESTCREATED   LATESTREADY   READY   REASON
hello   http://hello.default.172.18.0.3.sslip.io   hello-00002     hello-00002   True
```
