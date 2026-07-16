---
title : "Network Infrastructure (VPC) & IAM"
date : 2024-01-01 
weight : 3
chapter : false
pre : " <b> 5.3. </b> "
---

### 5.3.1. Configure IAM Roles & Policies (Permissions)
The Containerized system requires 2 distinct roles to execute and interact with other AWS services securely.

**Step 1: Create ECS Task Execution Role (Execution Permissions)**
* Access **AWS Console** → **IAM** → **Roles** → **Create role**.
* Select trusted entity: **AWS service**.
* Use case: **Elastic Container Service** → Select **Elastic Container Service Task**.
* Click **Next**.
* Attach policies (Search and select):
  * `AmazonECSTaskExecutionRolePolicy` (To pull images from ECR)
  * `CloudWatchLogsFullAccess` (For system logging)
* Click **Next** → Role name: `WeDo-ECS-Execution-Role` → **Create role**.

**Step 2: Create ECS Task Role (Spring Boot Application Permissions)**
* Similar to Step 1, create a new Role for the ECS Task.
* Attach policies:
  * `AmazonS3FullAccess` (To allow Spring Boot to upload/download files)
  * `SecretsManagerReadWrite` (To read DB credentials securely)
* Click **Next** → Role name: `WeDo-ECS-Task-Role` → **Create role**.

![Create IAM Role](/images/5-Workshop/5.3-IAM-Infrastructure/hinh-iam-role.jpg)
*(Note: You must configure accurate permissions so that services can communicate internally).*

### 5.3.2. Network Infrastructure Setup (VPC Setup)
To prevent errors associated with manual subnet configurations, we will use the "VPC and more" feature.

**Step 1: Initialize Multi-AZ VPC**
* Access **AWS Console** → **VPC** → **Your VPCs** → **Create VPC**.
* Select **VPC and more**.
* Name tag auto-generation: `wedo-workspace`
* IPv4 CIDR block: `10.0.0.0/16`
* Number of Availability Zones (AZs): **2**
* Number of public subnets: **2** (For Load Balancer & NAT)
* Number of private subnets: **4** (2 for ECS, 2 for RDS)
* NAT gateways: **In 1 AZ** (To optimize costs instead of 1 per AZ)
* Click **Create VPC** and wait for AWS to automatically provision the network routing.

![Create VPC and Subnets](/images/5-Workshop/5.3-IAM-Infrastructure/hinh-vpc-subnet.jpg)

### 5.3.3. Route 53 & WAFv2 Setup
**Route 53 - DNS Configuration:**
Currently, Route 53 no longer offers free custom domains. To save on budget, we will temporarily use the **default Domain name provided by the Application Load Balancer (ALB)** or **CloudFront** instead of purchasing a new domain name.
*(Note: You can skip this step; we will return to configure CNAME if the team purchases a domain later).*

**WAFv2 - Firewalls & Protection:**
* Access **AWS Console** → **WAF & Shield** → **Web ACLs** → **Create web ACL**.
* Name: `WeDo-WAF-Protection`
* Resource type: Select **Regional resources** (if attached to ALB) or **CloudFront distributions** (if attached at the outermost boundary layer).
* Add rules: Select **Managed rule groups** → Add `Core rule set` and `SQL database` to block malicious SQL Injections.

### 5.3.4. Configure VPC Endpoints (AWS PrivateLink)
To enhance security and minimize costs (by reducing the traffic load running through the NAT Gateway), we will establish VPC Interface Endpoints so that Containers in Private Subnets can communicate directly with AWS core services.

**1. Endpoint for Secrets Manager (`wedo-secrets-endpoint`):**
* Access **AWS Console** → **VPC** → **Endpoints** → **Create endpoint**.
* Service category: Select **AWS services**.
* Service name: Search and select `com.amazonaws.ap-southeast-1.secretsmanager`.
* VPC: Select `wedo-workspace-vpc`.
* Subnets: Check the corresponding **Private Subnets** created earlier.
* Security groups: Select the internal Security Group (allow Inbound Port 443 from the VPC CIDR range).
* Click **Create endpoint**.

![Create VPC Endpoint for Secrets Manager](/images/5-Workshop/5.3-IAM-Infrastructure/hinh-endpoint-1.jpg)

**2. Endpoint for CloudWatch Logs (`wedo-cloudwatch-endpoint`):**
* Similar to the step above, create a new Endpoint.
* Service name: Search and select `com.amazonaws.ap-southeast-1.logs`.
* Configure VPC, Subnets, and Security Group identical to the Secrets Manager Endpoint.
* Click **Create endpoint** and wait for the status to change to **Available**.

![Create VPC Endpoint for CloudWatch](/images/5-Workshop/5.3-IAM-Infrastructure/hinh-endpoint-2.jpg)

**Verification Results:** After a few minutes, both Endpoints will successfully transition to the active state.

![Endpoint Verification Results](/images/5-Workshop/5.3-IAM-Infrastructure/endpoint_ket_qua.png)

### 5.3.5. Initialize NAT Gateway and Configure Route Tables
To allow resources located in the internal network (Private Subnets) such as ECS Fargate or RDS to access the Internet (e.g., to pull Docker images or call external APIs) while maintaining security against unsolicited inbound traffic, we need to establish a NAT Gateway.

**Step 1: Create NAT Gateway**
* Access **AWS Console** → **VPC** → **NAT gateways** → **Create NAT gateway**.
* Name: `wedo-nat-gateway`.
* Subnet: You must select a **Public Subnet** (e.g., `wedo-workspace-subnet-public1`).
* Elastic IP allocation: Select **Allocate Elastic IP** to have AWS allocate a static IP for the NAT.
* Click **Create NAT gateway** and wait a few minutes for the status to transition to *Available*.
![Initialize NAT Gateway](/images/5-Workshop/5.3-IAM-Infrastructure/nat-create.jpg)
![NAT Gateway Succeeded](/images/5-Workshop/5.3-IAM-Infrastructure/nat-success.png)

**Step 2: Update Route Table for Private Subnets**
* Navigate to the **Route tables** menu in the VPC dashboard.
* Search for and select the Route Table associated with the **Private Subnets** (e.g., `wedo-workspace-rtb-private`).
![Select Private Route Table](/images/5-Workshop/5.3-IAM-Infrastructure/rtb-private.jpg)
* Switch to the **Routes** tab → Click **Edit routes**.
* Click **Add route**:
  * Destination: `0.0.0.0/0` (Represents all outbound Internet traffic).
  * Target: Select **NAT Gateway** and point to the `wedo-nat-gateway` created in Step 1.
* Click **Save changes** to apply.
![Point Route to NAT Gateway](/images/5-Workshop/5.3-IAM-Infrastructure/rtb-save-route.png)

From this point on, Containers residing in the Private Subnets can securely access the Internet through the NAT Gateway.