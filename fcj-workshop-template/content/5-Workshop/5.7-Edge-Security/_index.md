---
title : "Edge-Security"
date : 2024-01-01
weight : 7
chapter : false
pre : " <b> 5.7. </b> "
---

Based on the overall architecture diagram, the **Global (Edge Security)** layer acts as the first shield receiving traffic from the Internet. In this module, we will set up the trio of Amazon CloudFront, AWS WAF, and Amazon Route 53 to distribute content and protect the system from cyber attacks.

### 5.7.1. Configure Content Delivery Network (Amazon CloudFront)
Instead of letting users access S3 directly (which has high latency if far away), we use CloudFront as a CDN to cache the interface at Edge Locations globally.

* Access **AWS Console** → **CloudFront** → **Create Distribution**.
* **Origin:**
  * Origin type: Select **Amazon S3**.
  * Origin domain: Select the `wedo-frontend-2026` Bucket containing the React source code.
![Configure CloudFront Origin](/images/5-Workshop/5.7-Edge-Security/cloudfront-origin.jpg)

### 5.7.2. Integrate Web Application Firewall (AWS WAF)
WAF is integrated directly into CloudFront to filter malicious traffic flows (e.g., Layer 7 DDoS, SQL Injection, XSS) before they can reach S3 or the Backend.

* Under the **Enable security** section while creating CloudFront:
  * Check to enable **Web Application Firewall (WAF)**.
  * This option helps automatically block high-risk IPs based on AWS's threat intelligence system.
![Enable WAF Security for CloudFront](/images/5-Workshop/5.7-Edge-Security/cloudfront-waf.png)

* Scroll to the bottom, double-check all information in the **Review and create** section, and click **Create distribution**.
![Confirm CloudFront Creation](/images/5-Workshop/5.7-Edge-Security/cloudfront-create.jpg)

### 5.7.3. Domain Name Routing (Amazon Route 53)
To allow users to access via an easy-to-remember domain name (e.g., `wedo-workspace.com`) instead of a long CloudFront URL, we use Amazon Route 53.

* Access **Route 53** → **Hosted zones**.
* Create a new **Record (DNS Record)**:
  * Record name: Leave blank (to access the root domain directly) or enter a subdomain (e.g., `app`).
  * Record type: Select **A - Routes traffic to an IPv4 address and some AWS resources**.
  * Enable **Alias** → Point (Route traffic to) to **Alias to CloudFront distribution**.
  * Select the Distribution created in the previous step and click **Create records**.

**Verification Results:** All traffic entering the WeDo Workspace system is now forced to travel through the route: `Internet → Route 53 → WAF (Malware Scan) → CloudFront (Cache)`. This ensures ultra-fast page load speeds and maximum security for the entire internal core architecture.