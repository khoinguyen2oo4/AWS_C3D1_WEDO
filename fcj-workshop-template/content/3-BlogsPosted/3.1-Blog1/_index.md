---
title: "Blog 1"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 3.1. </b> "
---

# INTEGRATING AI TO BUILD A CALORIE & PROTEIN TRACKING APP WITH AWS SERVERLESS

This article introduces a practical architecture utilizing the AWS Serverless platform combined with artificial intelligence to develop the "AI Diet Tracker" – a personal assistant that automatically analyzes and tracks your nutritional intake. This solution transforms the tedious manual weighing, measuring, and looking up of every ounce of chicken breast or beef into a simple photo-taking action. Thereby, it completely eliminates the time barrier in tracking macros (calories, protein) for those maintaining a high-intensity workout schedule.

**Key Takeaways:**
* **Fully Serverless Architecture:** Utilizing AWS Lambda and Amazon API Gateway to handle logic, which optimizes costs (pay-per-request) and completely removes the operational burden of running 24/7 servers.
* **AI-Driven Automation:** Integrating Amazon Rekognition to analyze food images, automatically extract labels, and cross-reference them with a nutritional database to convert them into detailed macro quantities (e.g., 200g of chicken breast = ~330 calories & 62g of protein).
* **High-Speed Data Retrieval:** The entire nutritional history is centrally stored in the NoSQL database Amazon DynamoDB with millisecond latency, laying the groundwork for generating a Dashboard to track fitness progress weekly/monthly.
* **Decoupled Microservices Architecture:** The user interface (Frontend) developed with Flutter communicates completely independently with the Backend processing flow via API endpoints. This keeps the system flexible, making it easy to replace or expand to custom-trained Computer Vision models in the future without affecting the user experience.
* **Observability and Secure Storage:** Storing all original images securely on Amazon S3 for future tracking, while closely monitoring system performance, latency, and exceptions via Amazon CloudWatch.

![AI Diet Tracker Architecture Diagram](/images/3-blogsposted/blog1/blog1.jpg)

**Detailed Implementation Guide:**

1. **Frontend Setup and Image Collection Flow:** Build a mobile application using Flutter with a minimalist dark-themed UI. The app integrates a Camera module to capture food trays. Before sending, the image is lightly compressed to optimize the payload. The Mobile client then executes a POST request containing the image data (in base64 or multipart format) directly to the Amazon API Gateway endpoint.

2. **API Gateway & Trigger Configuration:** Set up Amazon API Gateway as a REST API. This gateway acts as the entry point to receive requests, handle CORS for the mobile app, and trigger a dedicated AWS Lambda function. This helps protect the backend processing flow and makes it easy to attach authentication mechanisms (like Amazon Cognito) if multi-user authorization is needed.

3. **AI Analysis Integration via AWS Lambda:** The AWS Lambda function (written in Node.js or Python) acts as the coordinating "brain". Here, Lambda calls the `DetectLabels` API function of the Amazon Rekognition service to analyze the image. The system filters out food-related labels (Food, Meat, Chicken, Vegetables, etc.), then runs them through an internal algorithm to calculate and return the estimated total Calories and Protein.

4. **Logging Structured Data into DynamoDB:** As soon as the macro results are available from step 3, AWS Lambda formats the data (JSON) and executes a `PutItem` command into an Amazon DynamoDB table. This table is designed with `UserID` as the Partition Key and `Timestamp` (meal time) as the Sort Key, making daily dietary history queries extremely fast.

5. **Long-term Raw Data Storage (Amazon S3):** In parallel with saving the dry numbers, AWS Lambda pushes a copy of the original food tray image to an Amazon S3 bucket. This not only allows users to review their meal logs on the app but also creates a valuable Data Lake source to train more specialized AI models for specific Vietnamese dishes in the future.

6. **Monitoring and Logging Setup (Amazon CloudWatch):** Configure the system so that the entire function invocation process, AI processing latency, and error streams are automatically pushed by AWS Lambda to Amazon CloudWatch Logs. CloudWatch Alarms can also be set up to send notifications if the API's error recognition rate increases abnormally.