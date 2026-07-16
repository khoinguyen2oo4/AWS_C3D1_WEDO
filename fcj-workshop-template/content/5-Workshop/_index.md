---
title: "Workshop"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Workshop: Deploying WeDo Workspace System on AWS

#### Overview

**WeDo Workspace** is an internal project management and collaborative workspace system designed with a Container architecture, utilizing Java Spring Boot for the Backend and ReactJS/NextJS for the Frontend.

In this hands-on Workshop series, we will learn step-by-step how to transition the system from a local development environment to an enterprise-grade AWS Cloud platform. Unlike simple Serverless systems, this Workshop will dive deep into deploying a highly secure **Multi-Availability Zone (Multi-AZ)** infrastructure.

You will manually set up an internal network (VPC), a relational database (Amazon RDS), package the application using Docker to run on Amazon ECS (Fargate), and configure an Application Load Balancer to ensure High Availability. The ultimate goal is to help you master the deployment lifecycle of a real-world application on AWS, from configuring the base infrastructure to officially and securely publishing the website to the Internet.

#### Workshop Contents

1. [Module 1: Overview & Project Goals](5.1-Introduction/)
2. [Module 2: Prerequisites & Setup](5.2-Prerequisites/)
3. [Module 3: Network Infrastructure (VPC) & IAM](5.3-IAM-Infrastructure/)
4. [Module 4: Database (RDS) & Storage (EFS)](5.4-Database/)
5. [Module 5: Backend Core - Spring Boot & ECS](5.5-Backend-Core/)
6. [Module 6: Frontend & S3 Integration](5.6-Frontend-S3/)
7. [Module 7: Edge Security (WAF & CloudFront)](5.7-Edge-Security/)
8. [Module 8: System Monitoring (CloudWatch)](5.8-Monitoring/)
9. [Module 9: Deployment & Go-Live](5.9-Deployment/)
10. [Module 10: Resource Cleanup](5.10-Cleanup/)