---
title: "Week 5 Worklog"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.5. </b> "
---



### Week 5 Objectives:
* Master the technique of migrating virtual machines between on-premises environments and AWS using VM Import/Export.
* Master the deployment, management, and operation of applications in a containerized environment (Docker, Amazon ECR, Nginx).
* Understand the Amazon ECS architecture, version update strategies (Rolling, Blue/Green), and the CI/CD automation process.
* Effectively monitor container systems and manage logs using CloudWatch Container Insights and FireLens.

### Tasks to be carried out this week:
| Day | Task | Start Date | Completion Date | Reference Material |
| :--- | :--- | :--- | :--- | :--- |
| 2 | **VM Import/Export:** Practice the virtual machine image import/export feature from on-premises environments (like VMware) to Amazon EC2 for application migration or backup (Disaster Recovery). Learn about Amazon S3 storage. | 18/05/2026 | 18/05/2026 | https://000014.awsstudygroup.com/1-introduction/ |
| 3-5 | **Deploying Applications with Docker Containers:** Build and manage the deployment process using Docker Hub, Amazon ECR, Amazon EC2, and Amazon RDS. Configure Nginx as a Reverse Proxy and Load Balancer to route traffic from the Client to the Frontend/Backend. | 19/05/2026 | 21/05/2026 | https://000015.awsstudygroup.com/1-introduction/ |
| 6 | **Study - ECS, CI/CD & Monitoring:** Research Amazon ECS architecture (Task, Service, Cluster, Fargate/EC2). Explore CI/CD platforms (GitHub Actions, GitLab CI/CD, AWS CodePipeline) and monitoring tools (CloudWatch Container Insights, FireLens). | 22/05/2026 | 22/05/2026 | https://000016.awsstudygroup.com/1-introduction/ <br>&emsp; https://000017.awsstudygroup.com/1-introduction/|
| 7 | Event: Participate in Event 2. | 23/05/2026 | 23/05/2026 | [View Event 2 Report](/4-eventparticipated/4.2-event2/) |

### Week 5 Achievements:
* **Cloud Migration & Storage:** Capable of securely converting and transferring virtual machine (VM) images from a local environment to Amazon EC2 infrastructure, effectively meeting the needs for workload migration scenarios and disaster recovery.
* **Containerization & Application Operation:** Successfully established a comprehensive containerized application environment. Smoothly configured the request workflow from the Internet Gateway through Nginx to the Frontend/Backend containers and securely connected to the Amazon RDS database.
* **ECS Architecture & CI/CD Automation:** Gained a deep understanding of how Amazon ECS operates, clearly distinguishing between Cluster/Service Scaling strategies and safe deployment methods (Rolling vs Blue/Green). Understood the CI/CD automation lifecycle to optimize the software build, test, and release processes.
* **Monitoring & Log Routing:** Accumulated knowledge in setting up container performance monitoring (CPU, RAM, Network) with CloudWatch Container Insights and learned how to flexibly route logs using the FireLens feature.