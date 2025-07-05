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
  delete-env:
    name: Delete branch
    runs-on: ubuntu-latest

    steps:
      - name: 'Checkout'
        uses: actions/checkout@v4

      - name: Authenticate with GCloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: '${{ secrets.GKE_SA_KEY }}'

      - name: Set up gcloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          project_id: ${{ env.PROJECT_ID }}
          install_components: 'gke-gcloud-auth-plugin'

      - name: Set kubectl to the right cluster
        run: |-
          gcloud container clusters get-credentials "$GKE_CLUSTER" --zone "$GKE_ZONE"

      - name: Delete namespace
        run: |-
          BRANCH_NAME="${{ github.event.ref }}"
          NAMESPACE_NAME="${BRANCH_NAME//\//-}"
          echo -e "\033[1;33mDeleting namespace: $NAMESPACE_NAME\033[0m"
          kubectl delete namespace "$NAMESPACE_NAME" --ignore-not-found

```
