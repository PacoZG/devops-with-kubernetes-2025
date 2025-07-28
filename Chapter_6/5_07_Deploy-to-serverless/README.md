# 🚀 Exercise 5.7. Deploy to serverless

## 🎯 Goal

After applying all the changes to the manifests,
shown [here](./deploy/kubernetes)

and deploying we can see that we have Knative services

```
kubectl get all -n knative-serving
NAME                                                   READY   STATUS      RESTARTS      AGE
pod/activator-58b66568b-l9tm5                          1/1     Running     0             139m
pod/autoscaler-57696c7784-fdh99                        1/1     Running     0             139m
pod/controller-6fff687cd7-v8c25                        1/1     Running     0             139m
pod/default-domain-5drfq                               0/1     Completed   0             138m
pod/log-output-svc-00001-deployment-5fbdc944d8-8w5vp   3/3     Running     0             10m
pod/net-kourier-controller-666c5cf64b-292ln            1/1     Running     0             139m
pod/pingpong-svc-00001-deployment-547465cfd5-xst7p     2/2     Running     2 (16m ago)   16m
pod/postgres-0                                         1/1     Running     0             16m
pod/webhook-f867db5b8-mwzg2                            1/1     Running     0             139m

NAME                                   TYPE           CLUSTER-IP      EXTERNAL-IP                                         PORT(S)                                              AGE
service/activator-service              ClusterIP      10.43.72.190    <none>                                              9090/TCP,8008/TCP,80/TCP,81/TCP,443/TCP              139m
service/autoscaler                     ClusterIP      10.43.190.117   <none>                                              9090/TCP,8008/TCP,8080/TCP                           139m
service/autoscaler-bucket-00-of-01     ClusterIP      10.43.138.146   <none>                                              8080/TCP                                             139m
service/controller                     ClusterIP      10.43.107.82    <none>                                              9090/TCP,8008/TCP                                    139m
service/default-domain-service         ClusterIP      10.43.126.185   <none>                                              80/TCP                                               138m
service/log-output-svc                 ExternalName   <none>          kourier-internal.kourier-system.svc.cluster.local   80/TCP                                               10m
service/log-output-svc-00001           ClusterIP      10.43.125.106   <none>                                              80/TCP,443/TCP                                       10m
service/log-output-svc-00001-private   ClusterIP      10.43.132.42    <none>                                              80/TCP,443/TCP,9090/TCP,9091/TCP,8022/TCP,8012/TCP   10m
service/net-kourier-controller         ClusterIP      10.43.72.12     <none>                                              18000/TCP,9090/TCP                                   139m
service/pingpong-svc                   ExternalName   <none>          kourier-internal.kourier-system.svc.cluster.local   80/TCP                                               16m
service/pingpong-svc-00001             ClusterIP      10.43.183.152   <none>                                              80/TCP,443/TCP                                       16m
service/pingpong-svc-00001-private     ClusterIP      10.43.131.145   <none>                                              80/TCP,443/TCP,9090/TCP,9091/TCP,8022/TCP,8012/TCP   16m
service/postgres-svc                   ClusterIP      None            <none>                                              5432/TCP                                             16m
service/webhook                        ClusterIP      10.43.104.14    <none>                                              9090/TCP,8008/TCP,443/TCP                            139m

NAME                                              READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/activator                         1/1     1            1           139m
deployment.apps/autoscaler                        1/1     1            1           139m
deployment.apps/controller                        1/1     1            1           139m
deployment.apps/log-output-svc-00001-deployment   1/1     1            1           10m
deployment.apps/net-kourier-controller            1/1     1            1           139m
deployment.apps/pingpong-svc-00001-deployment     1/1     1            1           16m
deployment.apps/webhook                           1/1     1            1           139m

NAME                                                         DESIRED   CURRENT   READY   AGE
replicaset.apps/activator-58b66568b                          1         1         1       139m
replicaset.apps/autoscaler-57696c7784                        1         1         1       139m
replicaset.apps/controller-6fff687cd7                        1         1         1       139m
replicaset.apps/log-output-svc-00001-deployment-5fbdc944d8   1         1         1       10m
replicaset.apps/net-kourier-controller-666c5cf64b            1         1         1       139m
replicaset.apps/pingpong-svc-00001-deployment-547465cfd5     1         1         1       16m
replicaset.apps/webhook-f867db5b8                            1         1         1       139m

NAME                        READY   AGE
statefulset.apps/postgres   1/1     16m

NAME                                            REFERENCE              TARGETS        MINPODS   MAXPODS   REPLICAS   AGE
horizontalpodautoscaler.autoscaling/activator   Deployment/activator   cpu: 0%/100%   1         20        1          139m
horizontalpodautoscaler.autoscaling/webhook     Deployment/webhook     cpu: 5%/100%   1         5         1          139m

NAME                       STATUS     COMPLETIONS   DURATION   AGE
job.batch/default-domain   Complete   1/1           19s        138m

NAME                                               LATESTCREATED          LATESTREADY            READY   REASON
configuration.serving.knative.dev/log-output-svc   log-output-svc-00001   log-output-svc-00001   True
configuration.serving.knative.dev/pingpong-svc     pingpong-svc-00001     pingpong-svc-00001     True

NAME                                                CONFIG NAME      GENERATION   READY   REASON   ACTUAL REPLICAS   DESIRED REPLICAS
revision.serving.knative.dev/log-output-svc-00001   log-output-svc   1            True             1                 1
revision.serving.knative.dev/pingpong-svc-00001     pingpong-svc     1            True             1                 1

NAME                                       URL                                                         READY   REASON
route.serving.knative.dev/log-output-svc   http://log-output-svc.knative-serving.172.18.0.3.sslip.io   True
route.serving.knative.dev/pingpong-svc     http://pingpong-svc.knative-serving.172.18.0.3.sslip.io     True

NAME                                         URL                                                         LATESTCREATED          LATESTREADY            READY   REASON
service.serving.knative.dev/log-output-svc   http://log-output-svc.knative-serving.172.18.0.3.sslip.io   log-output-svc-00001   log-output-svc-00001   True
service.serving.knative.dev/pingpong-svc     http://pingpong-svc.knative-serving.172.18.0.3.sslip.io     pingpong-svc-00001     pingpong-svc-00001     True
```
