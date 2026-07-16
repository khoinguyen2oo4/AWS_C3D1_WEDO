---
title: "Week 6 Worklog"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.6. </b> "
---


### Week 6 Objectives:
* Understand and set up AWS Security Hub for centralized monitoring of security alerts and compliance.
* Build secure, direct network connections between VPCs using VPC Peering.
* Scale and simplify large-scale network architectures (multiple VPCs) using AWS Transit Gateway.
* Optimize Amazon EC2 operational costs through automation with AWS Lambda and learn about Savings Plans.

### Tasks to be carried out this week:
| Day | Task | Start Date | Completion Date | Reference Material |
| :--- | :--- | :--- | :--- | :--- |
| 2 | **Study - AWS Security Hub & VPC Peering:** Research the Security Hub console. Establish a Peering connection between 2 VPCs for communication without traversing the Internet. Configure Network ACLs (stateless firewall) and Cross-Peering DNS. | 25/05/2026 | 25/05/2026 | https://000019.awsstudygroup.com/1-introduction/ |
| 3-4 | **AWS Transit Gateway:** Deploy an expanded network architecture connecting 4 VPCs via Transit Gateway (acting as a central hub). Create and configure Transit Gateway Attachments and their corresponding Route Tables. | 26/05/2026 | 27/05/2026 | https://000020.awsstudygroup.com/1-introduction/ |
| 6 | **Optimizing EC2 Costs with Lambda:** Write and test a Lambda function (Serverless) to automate the start/stop process of EC2 instances that do not need to run 24/7 based on Tags. Learn about the strategy of purchasing Savings Plans for continuously running instances. | 29/05/2026 | 29/05/2026 | https://000022.awsstudygroup.com/1-introduction/ |

### Week 6 Achievements:
* **Security & Monitoring (Security Hub & NACL):** Grasped how to aggregate and analyze security risks from multiple services (GuardDuty, Macie, Inspector) into a single dashboard. Clearly understood the operating principles of Network ACLs (Subnet level, stateless) combined with Security Groups (Instance level, stateful) for multi-layered security.
* **Network Architecture (VPC Peering vs Transit Gateway):** Clearly distinguished use-cases: using VPC Peering for simple network connections (non-transitive) and using Transit Gateway as a cloud router for centralized management, reducing complexity for multi-VPC architectures.
* **Cost Optimization (AWS Lambda):** Successfully applied Lambda Functions and IAM Roles for automated resource management. Effectively controlled the EC2 start/stop schedule, significantly minimizing infrastructure costs for testing environments or instances not requiring 24/7 operation.