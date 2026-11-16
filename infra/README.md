# BookClub — AWS Infrastructure

This directory contains the **Terraform infrastructure** for [BookClub](https://github.com/SinanErbezci/bookclub), a full-stack book discovery platform deployed on Amazon EKS.

Terraform provisions AWS resources, while Kubernetes application workloads and add-ons are managed separately through **Argo CD and GitOps**. The infrastructure supports on-demand production deployment to limit AWS costs.

## Infrastructure

| Component | Implementation |
|---|---|
| **Networking** | VPC with public and private subnets across two Availability Zones, a NAT gateway for private workloads, and an S3 gateway endpoint |
| **Compute** | Amazon EKS with a managed EC2 node group of `t3.medium` instances (desired: 2; minimum: 1; maximum: 2) |
| **Application ingress** | AWS Application Load Balancer provisioned by the AWS Load Balancer Controller from a Kubernetes Ingress |
| **Caching** | Amazon ElastiCache for Redis (`cache.t4g.micro`) |
| **Asynchronous tasks** | Amazon SQS as the Celery broker, with a dead-letter queue |
| **Container images** | Amazon ECR repositories for the Django backend and FastAPI AI service |
| **Frontend & static assets** | Amazon S3 and CloudFront for the React frontend; a separate S3 bucket for Django static assets |
| **Secrets & identity** | AWS Systems Manager Parameter Store, IAM, EKS Pod Identity, and GitHub Actions OIDC |
| **Cluster bootstrap** | Terraform-managed Helm installations of Argo CD and External Secrets Operator |

The application uses **Neon PostgreSQL**, which is external to this Terraform-managed AWS infrastructure. Kubernetes manifests, Kustomize overlays, and Helm-managed add-ons are maintained in the private `bookclub-deployment` GitOps repository.

## Terraform Configuration

| Files | Responsibility |
|---|---|
| `vpc.tf`, `nat_gateway.tf`, `vpc_endpoints.tf` | VPC, subnets, routing, and network access |
| `eks.tf`, `eks_iam.tf`, `eso.tf` | EKS, node group, add-ons, Pod Identity, Argo CD, and External Secrets Operator |
| `elasticache.tf`, `sqs.tf` | Redis caching and Celery task queues |
| `ecr.tf`, `s3.tf`, `cloudfront.tf`, `acm.tf` | Image storage, static hosting, CDN, and TLS certificates |
| `iam.tf`, `ssm.tf` | CI/CD permissions and application configuration parameters |
| `backend.tf`, `providers.tf`, `variables.tf`, `outputs.tf` | Terraform state, providers, inputs, and outputs |
| `bootstrap-argocd.sh`, `destroy.sh` | GitOps bootstrap and controlled production teardown |

Terraform state is stored remotely in **Amazon S3**. The AWS infrastructure is primarily deployed in **`eu-west-3` (Paris)**, with the CloudFront ACM certificate managed in **`us-east-1`**.

## Infrastructure Lifecycle

The `production_enabled` variable controls the lifecycle of production resources and defaults to `false`.

- **Enabled:** Provisions the EKS cluster and worker nodes, NAT gateway, ElastiCache Redis, SQS queues, and related production resources.
- **Disabled:** Removes those production resources while retaining shared infrastructure such as S3, CloudFront, ECR repositories, VPC networking, and Terraform state.

This approach reduces recurring costs when BookClub is not being actively deployed. Retained services may still incur charges.

### Provisioning

Prerequisites include Terraform **1.8+**, configured AWS CLI credentials, `kubectl`, access to the existing S3 state backend, and the required Terraform variables defined in `variables.tf`. Cloudflare credentials and access to the private GitOps repository are also needed for the complete deployment.

From the repository root:

```bash
cd infra
terraform init
terraform plan -var="production_enabled=true"
terraform apply -var="production_enabled=true"
```

Terraform creates the EKS infrastructure and installs Argo CD and External Secrets Operator using Helm. Then run:

```bash
bash ./bootstrap-argocd.sh
```

The bootstrap script configures `kubectl`, registers the private GitOps repository in Argo CD, and creates the root `argocd-applications` Application. It requires the GitHub App identifiers in the local `infra/.env` and the `bookclub-argo-reader.private-key.pem` file in this directory. **Do not commit credentials or private keys.**

Argo CD subsequently reconciles the Kubernetes configuration from `bookclub-deployment`, including application workloads, ingress, and monitoring. Successful restoration also depends on valid container images in ECR and the required external services and secrets.

### Teardown

Use the controlled teardown script instead of immediately destroying the cluster with Terraform:

```bash
bash ./destroy.sh
```

The script requires `TERRAFORM_DIR` to be set in the local `infra/.env` and asks for explicit confirmation. It:

1. Disables automatic synchronization for the relevant Argo CD Applications.
2. Removes the Django Ingress and verifies that its AWS ALB has been deleted.
3. Deletes the Prometheus custom resource and persistent storage, waiting for the associated EBS volume to disappear.
4. Applies Terraform with `production_enabled=false` to remove the remaining production resources.

**Warning:** Teardown permanently deletes the stored Prometheus monitoring history. Review the Terraform plan and AWS resources before teardown; shared infrastructure remains in place.

## Secrets and Deployment Access

- Application secrets are referenced through **AWS Systems Manager Parameter Store**. External Secrets Operator synchronizes them into Kubernetes, using **EKS Pod Identity** for AWS access.
- Terraform manages the `REDIS_URL` and `CELERY_QUEUE_URL` parameters for provisioned services. Other sensitive parameter values are managed outside Terraform.
- **GitHub Actions** authenticates to AWS using **OIDC** to publish container images and frontend assets without long-lived AWS keys.
- Argo CD uses a **GitHub App** to read the private GitOps repository. Changes to application image tags are delivered through deployment pull requests rather than Terraform applies.

## Related Repositories

- [BookClub](https://github.com/SinanErbezci/bookclub) — Application source, AI features, frontend, and GitHub Actions workflows.
- `bookclub-deployment` (private) — Kubernetes manifests, Argo CD Applications, Kustomize overlays, and Helm values.
