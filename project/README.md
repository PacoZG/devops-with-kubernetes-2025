# 🚀 Exercise 4.9: ToDo Application - Project Step 25

## 🎯 Project Goal

This phase of the ToDo application project focuses on enhancing our deployment
setup to support robust and automated continuous delivery. Our key objectives
were to:

- 🌐 **Establish Separate Environments**: Create distinct **production** and *
  *staging** environments, each residing within its own Kubernetes namespace.
- 🔄 **Automate Staging Deployments**: Configure our pipeline so that **every
  commit to the `main` branch automatically triggers a deployment to the staging
  environment**.
- 🚀 **Automate Production Deployments**: Implement a system where **each tagged
  commit results in a deployment to the production environment**.
- 📝 **Staging Broadcaster Behavior**: In the staging environment, ensure the
  broadcaster simply **logs all messages** instead of forwarding them to
  external services.
- 🚫 **Staging Database Policy**: Confirm that the **staging database is not
  backed up**.
- 🔑 **Secrets Management**: Assume that all necessary **secrets are applied
  externally** to ArgoCD.

-----

## 🏗️ Implementation Structure

Our approach involved a well-organized manifest structure using Kustomize
overlays, ensuring clear separation and reusability for our different
environments.

```
deploy/kubernetes/
├── base/
│   ├── 00-broadcaster.yaml
│   ├── 01-postgres.yaml
│   ├── 02-server.yaml
│   ├── 03-client.yaml
│   ├── ... (other base manifests)
│   └── kustomization.yaml
└── overlays/
    ├── prod/
    │   ├── application.yaml  # ArgoCD App for prod
    │   ├── broadcaster.yaml  # Prod specific broadcaster (if needed)
    │   ├── kustomization.yaml # Prod kustomize overlay
    │   ├── ... (other prod specific manifests)
    └── stg/
        ├── application.yaml  # ArgoCD App for staging
        ├── kustomization.yaml # Staging kustomize overlay
        ├── ... (other stg specific manifests)
```

-----

## ✅ Deployment Insights

### 🖥️ Local Deployment

For local production deployments, a
dedicated [deployment script](deploy/scripts/prod-dep.sh))
was created to push tags with the latest changes. Accessing the ArgoCD
application locally via an IP address proved to be more complex than
anticipated; some crucial information might be missing for simpler local access.

### ☁️ Cloud Deployment (GCP)

After configuring ArgoCD on Google Cloud Platform (GCP), we successfully
obtained an external IP address for the ArgoCD server:

```
kubectl get svc -n argocd
NAME                                      TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)                      AGE
argocd-applicationset-controller          ClusterIP      10.3.243.241   <none>           7000/TCP,8080/TCP            152m
argocd-dex-server                         ClusterIP      10.3.248.126   <none>           5556/TCP,5557/TCP,5558/TCP   152m
argocd-metrics                            ClusterIP      10.3.244.17    <none>           8082/TCP                     152m
argocd-notifications-controller-metrics   ClusterIP      10.3.242.69    <none>           9001/TCP                     152m
argocd-redis                              ClusterIP      10.3.241.153   <none>           6379/TCP                     152m
argocd-repo-server                        ClusterIP      10.3.249.50    <none>           8081/TCP,8084/TCP            152m
argocd-server                             LoadBalancer   10.3.252.3     35.228.167.226   80:30882/TCP,443:30627/TCP   152m
argocd-server-metrics                     ClusterIP      10.3.255.240   <none>           8083/TCP                     152m
```

To manage production updates,
a [GitHub workflow](../.github/workflows/prod-sync.yml)
was implemented. This workflow is responsible for updating the
`application.yaml` manifest and signaling ArgoCD about the new revision,
ensuring smooth and automated production synchronization.

-----

### 📦 Environments Running Smoothly\!

Both the staging and production environments are
running without any issues, as demonstrated by the following snapshots:

![image](images/project_4.9_1.png)

![image](images/project_4.9_2.png)

![image](images/project_4.9_3.png)

As visible, the **latest revision in production is 4.9**, confirming successful
and up-to-date deployments.

-----
