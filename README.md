# C3D1 Workspace

Project management workspace with React, Spring Boot, MySQL, JWT authentication, Google Sign-In, task submissions, chat, and Admin controls.

## Local Setup

1. Copy `backend/.env.example` and `frontend/.env.example` into your local environment configuration.
2. Set a random `JWT_SECRET` containing at least 32 characters.
3. Configure MySQL through `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
4. Run backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

5. Run frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Google Sign-In

1. Create a Web OAuth client in Google Cloud Console.
2. Add the frontend URL, for example `http://localhost:5173`, to Authorized JavaScript origins.
3. Set the same Web Client ID in:
   - Backend: `GOOGLE_CLIENT_ID`
   - Frontend: `VITE_GOOGLE_CLIENT_ID`

The frontend receives a Google ID token. The backend verifies its signature, audience, issuer, and expiry before issuing a C3D1 access token.

Google Sign-In cannot work until a real Web Client ID is created in Google Cloud and configured in both environments.

## Password Reset Email

Password reset tokens are never returned to the browser. To send reset links through Gmail SMTP:

1. Enable two-step verification on the Gmail account.
2. Create a Google App Password.
3. Set `MAIL_ENABLED=true`, `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_FROM`.

Reset tokens are stored as SHA-256 hashes and expire after one hour.

## File Storage

Uploaded files are removed when their task or project is deleted. Admin can also use **System > Upload storage > Clean orphan files** to remove files that are no longer referenced by the database.

## Production

Set `SPRING_PROFILES_ACTIVE=prod` and provide all values from `backend/.env.example` through the deployment secret manager. Use HTTPS origins for `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS`, keep uploads on persistent storage, and run a database migration before deployment. Production uses `ddl-auto=validate`; do not use `ddl-auto=update`.
