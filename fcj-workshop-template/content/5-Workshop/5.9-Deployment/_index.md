---
title : "Deployment"
date : 2024-01-01 
weight : 9
chapter : false
pre : " <b> 5.9. </b> "
---

### 5.9.1. Overall Architecture Review
The current system satisfies the standards of the AWS Well-Architected Framework:
* **High Availability:** Multi-AZ deployment with VPC, ALB, NAT Gateway, and RDS.
* **Security:** Private Subnets, WAF, Secrets Manager, and least-privilege IAM permissions.
* **Scalability:** Uses Serverless ECS Fargate to automatically scale based on load.

### System demo

| | Content |
| :--- | :--- |
| **Web access URL** | [WeDo Workspace Web](https://tinyurl.com/Wedo-c3d1) |
| **Demo video** | Watch below or download [Demo-aws.mp4](https://drive.google.com/file/d/19jLMrXjSZSN6gKfXB3MJ4Kub92MRf-f-/view?usp=sharing) |

<br>

<video width="100%" controls style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
  <source src="/fcj-workshop-template/video/demo-aws.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


### 5.9.2. Production Environment
* The user interface is being distributed globally at ultra-high speed via the edge network (S3 + CloudFront).
* The Backend operates stably and handles thousands of concurrent requests safely behind the Application Load Balancer in the Private Subnet.
![Go-live Screen](/AWS_C3D1_WEDO/images/5-Workshop/5.9-Deployment/wedo-live.jpg)