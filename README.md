# k8s-microservices

Two Node/TypeScript services and Postgres running on a local Kubernetes cluster using kind.

I made this to learn Kubernetes by doing.

## Demo

https://github.com/user-attachments/assets/6e3c6dfe-cb30-480f-9222-822b23e8f30c

## Architecture

```
your machine
     |
load balancer (cloud-provider-kind)
     |
  ingress
   /     \
user-service  ----->  tasks-service
 (3000)                 (3001)
     \                  /
        postgres (statefulset + volume)
```

- `user-service` handles users. Fetching a user by id also returns their tasks by calling `tasks-service` over cluster DNS.
- `tasks-service` handles tasks.
- Both talk to the same Postgres, which runs as a StatefulSet with a persistent volume.
- The ingress routes `/api/users` and `/api/tasks` to the right service.
- Services talk to each other internally through ClusterIP services. Only the ingress is reachable from outside.

## Stack

Node.js, TypeScript, Express, PostgreSQL, Docker, Kubernetes (kind), cloud-provider-kind

## Structure

```
.
├── user-service/
├── tasks-service/
├── infrastructure/
│   ├── ingress.yaml
│   ├── postgres/        secret, service, statefulset
│   ├── user-service/    configmap, secret, deployment, service
│   └── tasks-service/   configmap, secret, deployment, service
├── cluster.yml
├── docker-compose.yml
└── init.sql
```

## Running it

Requirements: Docker, kind, kubectl, cloud-provider-kind

**1. Create the cluster**

```bash
kind create cluster --config cluster.yml --name todo-cluster
```

**2. Build the images and load them into the cluster**

```bash
docker build -t user-service:1.0 ./user-service
docker build -t tasks-service:1.0 ./tasks-service
kind load docker-image user-service:1.0 tasks-service:1.0 --name todo-cluster
```

**3. Create the secrets**

Copy each example file and fill in the values:

```bash
cp infrastructure/postgres/secret.yaml.example infrastructure/postgres/secret.yaml
cp infrastructure/user-service/secret.yaml.example infrastructure/user-service/secret.yaml
cp infrastructure/tasks-service/secret.yaml.example infrastructure/tasks-service/secret.yaml
```

**4. Apply everything**

```bash
kubectl apply -R -f infrastructure/
```

**5. Create the tables**

```bash
kubectl wait --for=condition=ready pod/postgres-0 --timeout=120s
kubectl exec -i postgres-0 -- psql -U postgres -d k8s_demo < init.sql
```

**6. Start the load balancer** (in a separate terminal, keep it running)

```bash
sudo cloud-provider-kind
```

**7. Find the port and test**

```bash
docker ps | grep kindccm
```

Use the localhost port mapped to port 80:

```bash
curl localhost:<port>/api/users
curl localhost:<port>/api/tasks
```

## Things to try

Delete a service pod and watch it come back:

```bash
kubectl delete pod <user-service-pod>
kubectl get pods -w
```

Delete the Postgres pod. It comes back with the same name and the same volume, so the data is still there:

```bash
kubectl delete pod postgres-0
```

## Local development

For working on the code itself, `docker compose up` runs both services and Postgres without Kubernetes.
