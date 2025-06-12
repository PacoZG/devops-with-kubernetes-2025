# Log Output

### Javascript implementation based on app1 from material example
```javascript
import { v4 } from  'uuid';

const stringGenerator = () => {

  const newString = v4()

  const newDate = new Date()

  const result = [newDate.toISOString() , newString].join(': ')

  console.log(result)

  setTimeout(stringGenerator, 5000)
}

stringGenerator()
```
I used the same Dockerfile to build the image but I implemented a basic docker-compose file to run it

```yaml
version: '3.9'

services:
  log-output:
    image: log-output
    build:
      context: /log-output
      dockerfile: Dockerfile
    container_name: log-output
```

The image can be found [here](https://hub.docker.com/r/sirpacoder/log-output/tags)

Below we can find the commands used in the terminal to build the image, push it to Docker Hub and create en run the Kubernetes cluster

```shell
    k3d cluster create -a 2
    
    kubectl cluster-info
    
    k3d kubeconfig get k3s-default
    
    kubectl config use-context k3d-k3s-default
```

```shell
    docker-compose up -d
    
    docker tag log-output sirpacoder/log-output:v1.1
    
    docker push sirpacoder/log-output:v1.1
```

```shell
    kubectl create deployment log-output-dep --image=sirpacoder/log-output:v1.1
    
    kubectl get pods
    
    kubectl get deployments
    
    kubectl logs -f <pod-name>
```
