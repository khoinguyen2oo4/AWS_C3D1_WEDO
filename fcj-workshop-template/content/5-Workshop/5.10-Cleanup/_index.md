---
title : "Cleanup"
date : 2024-01-01 
weight : 10
chapter : false
pre : " <b> 5.10. </b> "
---

**NOTE:** To avoid unwanted AWS charges after completing the project, cleaning up resources is mandatory. Below is the list and priority order for deletion to avoid dependency errors.

### 5.10.1. Resource Cleanup (AWS CLI)

Instead of manual operations on the AWS Console, administrators can use the command-line interface (AWS CLI) to automate the resource deletion process. The cleanup process must strictly adhere to the principle: **Delete from the core to the edge**.

#### Step 1: Core Layer Cleanup (App & Data)
Includes the ECS server cluster, Application Load Balancer, and database system.
![Cleanup Core](/images/5-Workshop/5.10-Cleanup/Det_App&Data.jpg)

**Delete RDS PostgreSQL database (Skip the final snapshot creation):**
```bash
aws rds delete-db-instance \
  --db-instance-identifier wedo-database \
  --skip-final-snapshot \
  --region ap-southeast-1
```

**Delete Amazon ECS Service and Cluster (Backend):**
```bash
aws ecs update-service --cluster wedo-cluster --service wedo-backend-service --desired-count 0
aws ecs delete-service --cluster wedo-cluster --service wedo-backend-service
aws ecs delete-cluster --cluster wedo-cluster
```

**Delete Application Load Balancer (ALB):**
```bash
aws elbv2 delete-load-balancer \
  --load-balancer-arn <YOUR_ALB_ARN>
```

---

#### Step 2: Network Layer Cleanup (Network)
Includes internal routing and communication gateways.
![Cleanup Network](/images/5-Workshop/5.10-Cleanup/Det_Network.jpg)

**Delete NAT Gateway (The most expensive resource):**
```bash
aws ec2 delete-nat-gateway \
  --nat-gateway-id <YOUR_NAT_GATEWAY_ID>
```
*Note: After deleting the NAT Gateway and waiting for the status to change to `Deleted`, you need to Release the Elastic IP and delete the entire VPC.*

---

#### Step 3: Edge Layer Cleanup (Global & Edge)
Finally, remove the static content distribution cache and the outer protection layer.
![Cleanup Edge](/images/5-Workshop/5.10-Cleanup/Det_Global.jpg)

**Delete all data and Frontend S3 Bucket:**
```bash
aws s3 rb s3://wedo-frontend-2026 --force
```
*(Note: Advanced resources like CloudFront and WAF should be checked and deleted manually on the AWS Console to ensure nothing is missed).*

---

### 5.10.2. Checklist — Project Acceptance
After completing the entire project, the team reviewed and confirmed that the following items are operating stably as designed:
- [x] **Module 1:** Understand the network infrastructure architecture and data flows clearly.
- [x] **Module 2:** Fully install tools (Docker, Postman, Git) and configure the environment.
- [x] **Module 3 (IAM):** Roles and Policies are configured according to the Least Privilege principle.
- [x] **Module 4 (Database):** RDS PostgreSQL successfully initialized in the Private Subnet, securely managing credentials via Secrets Manager.
- [x] **Module 5 & 6 (Backend & Frontend):** Spring Boot Backend container runs stably on ECS Fargate; ReactJS Frontend interface successfully deployed to S3.
- [x] **Module 7 (Edge Security):** CloudFront content delivery network and AWS WAF firewall operate well, successfully routing domains via Route 53.
- [x] **Module 8 (Monitoring):** System logs successfully pushed to CloudWatch, configured Alarm to alert when Backend cluster CPU exceeds 80%.
- [x] **Module 9 (Go-Live):** Access the application smoothly in a real Internet environment, with good load balancing via Application Load Balancer.
- [x] **Module 10 (Cleanup):** Grasp the procedures and order of cleaning up AWS resources to optimize costs.

### References
* [AWS Documentation – Amazon Virtual Private Cloud (VPC)](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)
* [AWS Documentation – Amazon Elastic Container Service (ECS) & Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)
* [AWS Documentation – Application Load Balancer (ALB)](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)
* [AWS Documentation – Amazon Relational Database Service (RDS)](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
* [AWS Documentation – Amazon CloudFront & AWS WAF](https://docs.aws.amazon.com/cloudfront/latest/APIReference/Welcome.html)
* [Spring Boot Framework Reference Guide](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
* [ReactJS Official Documentation](https://react.dev/)
* [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)