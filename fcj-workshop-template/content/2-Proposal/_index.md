---
title: "Proposal"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 2. </b> "
---


# WeDo Workspace
## Enterprise-Standard AWS Cloud Solution Optimizing Project Management and Collaborative Workspaces

### 1. Executive Summary  
**WeDo Workspace** is a project management and collaboration workspace platform designed to optimize the process of assigning tasks, tracking progress, and storing documents for working teams and students. The system provides a centralized workspace, allowing users to initiate projects, visually assign tasks, submit report files, and exchange information easily, thoroughly resolving the situation of scattered and lost data on traditional chat tools.

Unlike conventional applications, WeDo is built based on modern AWS cloud computing architecture (using Amazon ECS, RDS database, and S3 storage). The platform applies a secure network isolation model and Multi-Availability Zone (Multi-AZ) readiness, combined with a strict authorization system. This not only ensures the application operates stably and scales flexibly according to the number of users but also absolutely secures project data, bringing a professional experience close to enterprise management software.

### 2. Problem Statement  
*Current issues* Currently, student groups and small projects often have their workflows scattered across too many discrete tools (Zalo/Messenger for assigning tasks, Google Drive for submitting files). This leads to difficulties in tracking progress, easily losing report documents, and lacking a centralized system to track work in real-time. Furthermore, project management platforms on the market (like Jira, Asana) often have too many complex features or require high costs, making them unsuitable for the usage needs of small-scale teams.

*Solution* The WeDo Workspace platform uses a multi-zone (Multi-AZ) architecture on AWS to provide a centralized workspace. The system uses Amazon ECS to operate business processing containers (Spring Boot Backend), an Application Load Balancer for load balancing, and Amazon RDS for relational database management. All user report files and attached documents are securely stored on Amazon S3. AWS CloudFront and AWS WAF provide high-speed web interfaces and edge-layer security. Similar to Trello or Basecamp, users can create projects, manage tasks, and submit files directly, but this platform is streamlined, catering precisely to the needs of internal teamwork and academic project management.

*Benefits and Return on Investment (ROI)* The solution creates a centralized digital workspace, helping members completely eliminate manual progress reporting or searching for lost documents, thereby simplifying management and increasing team productivity. More importantly, the platform provides a practical environment for students to apply their knowledge of deploying enterprise-standard Cloud infrastructure (AWS). Monthly operating costs are optimized at extremely low levels by leveraging the AWS Free Tier and flexible container architecture. Since personal computer equipment is already available, the project incurs no hardware costs. The "payback" time is calculated right in the first 1-2 months of use thanks to significant time savings from messy exchanges, while also bringing immense intangible value: excellent project scores and valuable practical experience for their future engineering careers.

### 3. Solution Architecture  
The WeDo Workspace platform applies Containerization architecture on AWS with a Multi-Availability Zone (Multi-AZ) model to manage workflows and project documents. The static web interface is stored on S3 and distributed at ultra-high speed via CloudFront, protected by WAF. Dynamic API processing flows are routed through an Application Load Balancer (ALB) to Backend containers (Spring Boot) running on Amazon ECS placed in a Private Subnet. System data is securely stored and synchronized through Amazon RDS (Database) and Amazon EFS, while user submission documents are pushed directly to S3.

![Wedo_Workspace](/AWS_C3D1_WEDO/images/2-Proposal/Blog_Wedo.jpg)

*AWS services used* - *Amazon Route 53 & AWS WAF*: Domain Name System (DNS) resolution and system protection from malicious web attacks (DDoS, XSS, SQLi).
- *Amazon CloudFront*: Content Delivery Network (CDN) helping to route and load static interfaces quickly.
- *Amazon S3*: Plays a dual role: storing static interface source code (Frontend) and storing report files and user attachment documents.
- *Application Load Balancer (ALB)*: Receives and evenly distributes API traffic flows to backend containers, ensuring no overload.
- *Amazon ECS (Elastic Container Service)*: Operating environment for containers containing business logic (Backend) with auto-scaling capabilities.
- *Amazon RDS & Amazon EFS*: RDS manages relational data (user, project, task information), while EFS provides a shared file system for the containers.
- *AWS Secrets Manager & CloudWatch*: Securely manages sensitive information (connection strings, passwords) and monitors system logs and performance.

*Component design* - *Interface Distribution & Edge Security (Frontend & Edge Security)*: Route 53 resolves DNS, WAF filters requests, and CloudFront distributes the web app from S3 to user browsers.
- *Routing & Load Balancing*: The Internet Gateway allows valid data flows to enter the VPC, then the ALB will route these API flows into internal Subnets.
- *Business Processing (Backend Processing)*: Amazon ECS operates data processing containers. These containers are placed deep in the Private Subnet spread across 2 Availability Zones (AZ-1, AZ-2) to ensure High Availability.
- *Storage & Retrieval (Data Storage)*: The RDS database and EFS file system are completely isolated within the internal network, only allowing ECS access. Attached files uploaded from the web will be saved straight to a dedicated S3 bucket for Uploads.
- *Internal Security & Monitoring (Security & Observability)*: Through VPC Endpoints, the system securely connects with Secrets Manager to retrieve authentication information and pushes metric data to CloudWatch without needing to route out to the Internet. The NAT Gateway assists ECS in downloading updates or calling third-party APIs when necessary.

### 4. Technical Implementation  
*Deployment phases* The WeDo Workspace project is divided into 4 main phases to ensure progress:
- *Phase 1*: Analysis & Architecture Design (2 weeks) — Finalize requirements, design the AWS Multi-AZ diagram, model the Database (ERD), and UI/UX.
- *Phase 2*: Infrastructure Setup & CI/CD (2 weeks) — Initialize VPC, configure core services (ALB, RDS, S3, ECS Cluster), set up automated pipelines.
- *Phase 3*: Core Features Development (6-8 weeks) — Build RESTful APIs using Spring Boot, design the interface, integrate direct file upload/download APIs via S3.
- *Phase 4*: Testing & Packaging (2-3 weeks) — Fix bugs (especially CORS issues and authorization), deploy the official version to ECS, perform UAT, and write reports.

*Technical requirements* - *Application System (Frontend & Backend)*: The Frontend requires building a flexible project management interface (Kanban board), calling APIs via Axios. The Backend is developed using Java Spring Boot, integrating the AWS SDK library to handle file upload/download flows. The Backend must strictly be Containerized using Docker to ensure consistency between dev and production environments.
- *Cloud Infrastructure (AWS Cloud)*: Requires practical knowledge and skills in network configuration (Amazon VPC, Internet Gateway, NAT Gateway). Safely operate containers on Amazon ECS (Elastic Container Service) located within the internal network (Private Subnet). Route and load balance access traffic via Application Load Balancer (ALB). Manage relational databases with Amazon RDS (MySQL/PostgreSQL) and flexibly store static files/attachments with Amazon S3. Use AWS CloudFront as a CDN and AWS WAF to protect the system's edge layer.

### 5. Roadmap & Deployment Milestones  
| Phase | Week | Main Content | Expected Outcomes |
| :--- | :--- | :--- | :--- |
| **Design** | Weeks 1–2 | Draw AWS diagram, ERD, interface design | Architecture Document & Wireframes |
| **AWS Setup** | Weeks 3–4 | Create VPC, RDS, S3, config CloudFront & WAF | Cloud infrastructure ready |
| **Backend API** | Weeks 5–7 | Code Spring Boot, Project/Task CRUD, JWT Auth | API endpoints operating stably |
| **Frontend & Integration** | Weeks 8–10 | Code UI, integrate API, handle S3 file upload flow | Fully featured web app |
| **Testing & Debug** | Weeks 11–12 | Fix CORS errors, test Load Balancer capacity | System runs smoothly, 0 critical bugs |
| **Deploy & Report** | Week 13 | Push Docker image to ECS, Live web, Report | Live application, ready for defense |

### 6. Estimated Operational Budget (Monthly)

| AWS Service | Purpose | Estimated Cost / Month |
| :--- | :--- | :--- |
| **Amazon ECS (Fargate)** | Run 1-2 Spring Boot containers | ~$15 - $20 |
| **Application Load Balancer** | Load balancing & SSL | ~$16 - $20 |
| **Amazon RDS (t3.micro)** | Database Storage | ~$15 (Free first 12 months) |
| **Amazon S3 & CloudFront** | Store report files, interface CDN | ~$2 - $5 |
| **Other services** | Route53, Secrets Manager, Data Transfer | ~$5 |
| **TOTAL** | | **~$53 - $65 / month** |

*Note*: Utilizing an AWS Educate account or Free Tier can bring the actual cost down to near $0 during the development process.

### 7. Risk Assessment  
*Risk matrix*
- **System crash due to overload (Downtime):** High impact, low probability.
- **Security error / Data leak:** Extremely high impact, low probability.
- **Exceeding AWS budget:** Medium impact, medium probability (very easy to occur due to hanging resources).

*Mitigation strategy*
- **System:** Use an Application Load Balancer (ALB) to distribute traffic and deploy Amazon ECS across multiple availability zones (Multi-AZ) to always have backup containers.
- **Security:** Tightly enclose Amazon RDS and EFS in a Private Subnet; use AWS WAF to filter malicious requests at the edge layer and strictly authenticate using JWT.
- **Cost:** Set up AWS Budgets & Billing Alarms to automatically send warning emails as soon as costs hit the $5 mark.

*Contingency plan*
- **Code deployment error (Deployment Failure):** Quickly Rollback the Task Definition on ECS to the previously stable operating Docker Image version.
- **Data loss incident:** Activate the Automated Backups feature of RDS (storing snapshots up to 35 days) and S3 Versioning to restore to the most recent safe data state.

### 8. Expected Outcomes  
*Technical improvements*
The system digitizes and centralizes the entire management process, completely replacing the manual, disjointed assignment of tasks and file submissions via chat/drive channels. The flexible architecture on Amazon ECS combined with an Application Load Balancer allows the system to Auto-scale, having more than enough capacity to handle loads from small groups of a few people up to thousands of concurrent users without service interruption.

*Long-term value*
Builds a solid core Cloud platform, ready to integrate new Microservices in the future (like Real-time chat features, or AI summarizing project progress). More importantly, the project brings invaluable practical combat experience regarding enterprise-standard AWS Multi-AZ architecture, creating a "heavyweight" highlight in the members' portfolios, acting as a solid stepping stone for their future software engineering careers.