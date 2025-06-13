# Project v1.0

### Javascript implementation based on app1 from material example

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

  docker tag project sirpacoder/server:v1.5

  docker push sirpacoder/server:v1.5
```

The image can be found [here](https://hub.docker.com/r/sirpacoder/server/tags)

```shell
  kubectl apply -f ./manifests
```

### Steps after running the deployment

```shell
$ kubectl get po
NAME                                 READY   STATUS    RESTARTS      AGE
project-dep-7986c67b7b-c9kx7         1/1     Running   0             23s
```

```shell
$ kubectl port-forward project-dep-7986c67b7b-c9kx7 3001:3001

Forwarding from 127.0.0.1:3001 -> 3001
Forwarding from [::1]:3001 -> 3001
Handling connection for 3001
```

We can test the projects response doing a GET request to `http://localhost:3001/api/todos` using Postman or use the small client application bellow.
___

