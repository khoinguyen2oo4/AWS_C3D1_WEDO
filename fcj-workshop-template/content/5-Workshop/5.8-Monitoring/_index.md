---
title : "System Monitoring"
date : 2024-01-01
weight : 8
chapter : false
pre : " <b> 5.8. </b> "
---

### 5.8.1. Application Log Monitoring
Thanks to the VPC Endpoint and Task Execution Role, the Spring Boot containers automatically push execution logs to **Amazon CloudWatch Logs**.
* Access CloudWatch Logs → Log groups to monitor Backend logs in real-time, making it easy to debug errors (such as Database Connection Refused errors).
![CloudWatch Log Group](/images/5-Workshop/5.8-Monitoring/cloudwatch-logs.jpg)

### 5.8.2. Set up CloudWatch Alarms
Configure alerts based on the `CPUUtilization` and `MemoryUtilization` Metrics of the ECS Cluster.
* Setup: If the CPU exceeds 80% continuously for 5 minutes, the system will automatically send an alert so the administrator can handle it promptly.
![CloudWatch Alarms](/images/5-Workshop/5.8-Monitoring/cloudwatch-alarm.jpg)