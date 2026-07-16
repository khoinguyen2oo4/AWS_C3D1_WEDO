---
title : "Preparation Steps"
date : 2024-01-01 
weight : 2
chapter : false
pre : " <b> 5.2. </b> "
---

### 5.2.1. AWS Account Requirements
To smoothly execute all the Labs in this Workshop, you will need:
* **AWS Account:** An active account (you can use the team's Shared Account). It is highly recommended to have Administrator Access to initialize the VPC, IAM Roles, and other core services.
* **Deployment Region:** It is recommended to use the `ap-southeast-1` (Singapore) region to optimize connection latency.
* **Cost Warnings:** Although the design is optimized to fit within the AWS Free Tier, a Multi-AZ architecture uses several resources (such as NAT Gateways or Application Load Balancers) that incur hourly charges. Make sure you have set up **AWS Budgets** to receive email alerts when costs exceed $5.

### 5.2.2. Local Environment Tools
Please ensure your local machine (such as your MSI Bravo 15 laptop) has the following software and environments fully installed:
* **Docker Desktop:** Required to package (Containerize) your Java Spring Boot source code into a Docker Image before pushing it to Amazon ECR.
* **Java Development Kit (JDK 17+) & Maven:** Used to compile, run, and debug the Backend in your local environment.
* **Node.js (18+) & npm/yarn:** Necessary to fetch dependencies and build the static assets of the ReactJS/NextJS Frontend.
* **AWS CLI v2:** Command-line tool to interact, upload files, and authenticate with your AWS account directly from your Terminal.
* **Git & Code Editor:** Visual Studio Code or IntelliJ IDEA to easily manage and edit the project's source code.

### 5.2.3. Foundational Knowledge Assumptions
This Workshop dives deep into deploying a production-grade enterprise system. To keep up with the pace, you should be familiar with:
* **Basic Networking:** Concepts of static IPs, Subnetting, Ports, and network protocols (TCP/HTTP/HTTPS).
* **Container Architecture:** Basic understanding of Docker operations and how to write a Dockerfile.
* **Web Applications:** A solid grasp of the Client-Server model, JWT authentication mechanisms, and RESTful API structures.