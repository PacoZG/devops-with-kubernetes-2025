# Exercise 1.2: Project v1.0

### Javascript implementation based on app1 from material example

Implementation of the web server can be found [here](./project)

The steps were pretty much the same as in the exercise 1.01 and are as we can see on the scripts bellow
Below we can find the commands used in the terminal to build the image, push it to Docker Hub and create en run the Kubernetes cluster

```shell
  k3d cluster create -a 2

  kubectl cluster-info

  k3d kubeconfig get k3s-default

  kubectl config use-context k3d-k3s-default
```

```shell
  docker-compose up -d

  docker tag project sirpacoder/project:v1.2

  docker push sirpacoder/project:v1.2
```

The image can be found [here](https://hub.docker.com/r/sirpacoder/project/tags)

```shell
  kubectl create deployment project-dep --image=sirpacoder/project:v1.2

  kubectl get pods

  kubectl get deployments

  kubectl logs -f <pod_name>
```
