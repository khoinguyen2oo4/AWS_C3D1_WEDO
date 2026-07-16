---
title : "Database"
date : 2024-01-01 
weight : 4 
chapter : false
pre : " <b> 5.4. </b> "
---

### 5.4.1. Prepare Security Groups (Security Firewall)
Before creating the Database and File System, the most important task is to establish the firewall. Core security principle: RDS and EFS are only allowed to receive connections from the Backend (Spring Boot), absolutely blocking all direct access traffic from the Internet.

* **Security Group for EFS (`wedo-efs-sg`):** Add an Inbound Rule allowing the **NFS protocol (Port 2049)**. For the Source, point directly to the Backend's Security Group name (`wedo-backend-sg`).
![Configure Security Group for EFS](/images/5-Workshop/5.4-Database/sg-efs.png)

* **Security Group for RDS (`wedo-db-sg`):** Add an Inbound Rule allowing the **MYSQL/Aurora protocol (Port 3306)**. For the Source, also point directly to the Backend's Security Group.
![Configure Security Group for RDS](/images/5-Workshop/5.4-Database/sg-db.jpg)

### 5.4.2. Initialize Amazon EFS (Elastic File System)
EFS will act as a giant network drive, mounted directly to the Spring Boot Containers to store attached report files uploaded by users.

* Access **AWS Console** → Search for **EFS** → **Create file system** (Click the **Customize** button for detailed configuration).
* **Name:** `wedo-uploads-efs`.
* **VPC:** Select the project's VPC (`wedo-workspace-vpc`).
![Create EFS file system](/images/5-Workshop/5.4-Database/efs-create.jpg)

* Keep the Recommended parameters as they are, such as Elastic Throughput and Automatic backups. 
* Click **Create file system** and wait until the status changes to **Available**.
![EFS created successfully](/images/5-Workshop/5.4-Database/efs-success.png)

### 5.4.3. Initialize Amazon RDS Database (MySQL)
The core business data of WeDo Workspace (project info, tasks, users) will be stored in this Database cluster with a High Availability (Multi-AZ) architecture.

* Access **AWS Console** → **RDS** → **Databases** → **Create database**.
* Choose a database creation method: **Full configuration**.
* Engine options: Select **MySQL**.
* Templates: Select **Dev/Test**.
* Availability and durability: Select **Multi-AZ DB instance deployment** so the system automatically creates a standby replica in a different Availability Zone.
![Configure Template and Multi-AZ](/images/5-Workshop/5.4-Database/rds-template.jpg)

* **Settings:**
  * DB cluster identifier: `wedo-database`.
  * Master username: `admin`.
  * **Credentials management:** Check **Managed in AWS Secrets Manager**. This is an advanced security feature where AWS will automatically generate a random password and securely store it in Secrets Manager, eliminating the need to hardcode the password.
![Configure RDS Settings](/images/5-Workshop/5.4-Database/rds-settings.png)

* **Instance & Storage configuration:** * Select class `db.m5d.large` (or a suitable class).
  * Storage type: Select **General Purpose SSD (gp3)** and allocate **20 GiB** of capacity.
![Configure RDS Storage](/images/5-Workshop/5.4-Database/rds-storage.png)

* **Connectivity:**
  * Compute resource: **Don't connect to an EC2 compute resource**.
  * Virtual private cloud (VPC): Select `wedo-workspace-vpc`.
  * Public access: **No** (Ensures the Database is not exposed to the Internet).
  * VPC security group: Select **Choose existing** and remove the default group, selecting only `wedo-db-sg` created in step 5.4.1.
![Configure RDS Network](/images/5-Workshop/5.4-Database/rds-network.png)

* Scroll to the bottom and click **Create database**. The Multi-AZ initialization process may take 10 - 15 minutes.

**Verification Results:** After waiting, the database has successfully transitioned to the **Available** status!
![RDS created successfully](/images/5-Workshop/5.4-Database/rds-success.png)