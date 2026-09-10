# infra/

Terraform for the AWS production and staging environments. Built in phase **P9**.

Planned modules:

| Module | Resources |
|--------|-----------|
| `network` | VPC, public/private subnets, NAT gateway, security groups |
| `data` | RDS PostgreSQL 16 (Multi-AZ), RDS Proxy, ElastiCache Redis, SQS queue |
| `compute` | ECS cluster, Fargate services (api, celery-worker, celery-beat), ALB, target groups |
| `storage` | S3 buckets (media, static), CloudFront distribution, ACM certs |
| `edge` | Route 53 records, WAF web ACL |
| `iam` | ECS task roles/policies (S3, SQS, Secrets Manager, CloudWatch) |
| `secrets` | Secrets Manager entries: DB creds, DJANGO_SECRET_KEY, Google client secret, FIELD_ENCRYPTION_KEY |
| `cicd` | ECR repositories, GitHub OIDC role for deploys |

Environments: `envs/staging`, `envs/prod` — separate state, same modules.
