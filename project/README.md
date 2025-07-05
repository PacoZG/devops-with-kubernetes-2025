# Exercise 3.8: The project, step 17

### Finally, create a new workflow so that deleting a branch deletes the environment

On push delete workflow:

- [delete.yaml](../.github/workflows/delete.yaml)

```yaml
name: Delete branch environment

on:
  delete:

env:
  PROJECT_ID: ${{ secrets.GKE_PROJECT }}
  GKE_CLUSTER: dwk-cluster
  GKE_ZONE: europe-north1-b

jobs:
  build-todo-app:
    name: Delete
    runs-on: ubuntu-20.04

    steps:
      - name: 'Checkout'
        uses: actions/checkout@v4

      - name: 'Get GCloud credentials'
        uses: google-github-actions/auth@v2
        with:
          credentials_json: '${{ secrets.GKE_SA_KEY }}'

      - name: 'Use gcloud CLI'
        run: gcloud info

      - name: 'Get GKE credentials'
        uses: 'google-github-actions/get-gke-credentials@v2'
        with:
          cluster_name: '${{ env.GKE_CLUSTER }}'
          project_id: '${{ env.PROJECT_ID }}'
          location: '${{ env.GKE_ZONE }}'

      - name: Set kubectl to the right cluster
        run: |-
          gcloud container clusters get-credentials "$GKE_CLUSTER" --zone "$GKE_ZONE"

      - name: Delete deployment
        run: |-
          NAMESPACE_NAME=${GITHUB_REF#refs/heads/}
          printf "\033[1;33mDeleting namespace: $NAMESPACE_NAME\033[0m"
          kubectl delete namespace "$NAMESPACE_NAME"
```
