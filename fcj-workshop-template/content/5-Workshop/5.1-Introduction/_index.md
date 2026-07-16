---
title : "Introduction"
date : 2024-01-01 
weight : 1
chapter : false
pre : " <b> 5.1. </b> "
---

Overall design and direction of the **WeDo Workspace** project.

### 5.1.1. Overview & Project Goals
**WeDo Workspace** is a collaborative workspace management platform. The project was created to address the challenges of data fragmentation and the difficulty of tracking progress when working in teams using disjointed tools like Zalo, Messenger, or Google Drive.

**Core Goals:**
* Provide a centralized space to create projects, assign tasks, and submit report files.
* Deploy the system entirely on **enterprise-grade AWS Cloud** infrastructure.
* Optimize operating costs while ensuring flexibility and scalability.

### 5.1.2. Containerized Architecture & Data Flow
Unlike traditional monolithic applications running on physical servers, WeDo adopts a modern **Containerization** architecture:
* **Frontend:** The ReactJS/NextJS application is built into static files, stored on **Amazon S3**, and distributed globally at ultra-high speed via the **Amazon CloudFront** CDN network.
* **Backend:** The core logic written in Java Spring Boot is packaged as a Docker Container, running on **Amazon ECS (Fargate)** completely automatically, without needing to manage virtual EC2 servers.

### 5.1.3. Detailed System Design
The system is designed according to **Multi-AZ (Multi-Availability Zone)** standards to ensure High Availability:
1. **Network Layer:** Clear isolation between the Public Subnets (containing Load Balancers, NAT Gateways) and Private Subnets (containing ECS Containers, RDS Databases).
2. **Data Layer:** The Amazon RDS relational database is placed deep inside the Private Subnets, completely preventing direct access from the Internet. Uploaded file attachments are saved directly to a secure S3 Bucket.
3. **Security Layer:** Integrates AWS Secrets Manager to conceal sensitive environment variables.

### 5.1.4. Operations & Deployment Strategy
* **CI/CD:** The Backend's Docker image is automatically built and pushed to the **Amazon ECR** registry.
* **Monitoring:** All system activity logs and API errors are pushed to **Amazon CloudWatch** for monitoring.
* **Scaling:** The ECS Service is configured to automatically scale (Auto-scaling) the number of Containers during sudden traffic spikes.

### 5.1.5. Business Assessment & Vision
WeDo Workspace is not just an ordinary capstone project. The successful deployment of this system demonstrates the ability to apply real-world Cloud architecture to solve business problems, serving a large volume of users with highly optimized operating costs.

### 5.1.6. Team Assignment
The project was executed by a team of 5 members, using a shared AWS account (Shared Account) for deployment:

| Member | Assigned Areas (Workshop Sections) | Corresponding Modules |
| :--- | :--- | :--- |
| **Khoi** | Backend Core Management (Spring Boot + ECS) & System Deployment (Go-Live) | 5, 9 |
| **Anh** | Frontend Development (React/Next.js) & Web UI Integration | 6 |
| **Nam** | Database Setup (RDS MySQL) & Storage System (S3/EFS) | 4 |
| **Viet** | Network Infrastructure (VPC, Subnets, IAM) & Resource Cleanup | 3, 10 |
| **Hoa** | Routing (Route 53), Edge Security (WAF/CloudFront) & System Monitoring | 7, 8 |

*(Note: Modules 1, 2, and 12 were collaboratively executed by the entire team).*

### 5.1.7. Production Flow
![WeDo Workspace Architecture](/images/2-Proposal/Blog_Wedo_KT.jpg)

**Legend/Step descriptions on the diagram:**
1. **DNS Resolution**: Domain name resolution via Route 53.
2. **WAF Protection**: Protect the system from malicious web attacks.
3. **Edge Routing**: High-speed routing at the edge layer.
4. **Serve Static Assets**: Deliver static Frontend assets from S3 via CloudFront.
5. **API Routing**: Load balancing and API routing via the Application Load Balancer.
6. **Backend Processing**: Process business logic inside ECS Containers (Spring Boot).
7. **Database & File Storage**: Store relational data (RDS) and file attachments (S3/EFS).
8. **Outbound Access**: One-way outbound Internet access via NAT Gateway to download updates.
9. **Security & Observability**: Security management (Secrets Manager) and system monitoring (CloudWatch).

**Detailed Data Request Flow:**
```ini
Client Browser (User)
    │
    ├──> CloudFront (CDN) ──> Amazon S3 (Serve static Web UI)
    │
    └──> (Call API / Submit Report)
         ↓ Route 53 (Domain Name Resolution)
         ↓ AWS WAF (Firewall filtering malicious requests)
         ↓ Application Load Balancer (Load Balancing)
         ↓ Amazon ECS (Fargate Containers running Spring Boot in Private Subnet)
         ├─ AuthController (JWT Token Validation)
         ├─ Project/TaskController ──> Amazon RDS (Save & Retrieve DB)
         ├─ FileController ──> Amazon S3 (Direct Upload/Download of documents)
         └─ Amazon CloudWatch (Collect system logs)