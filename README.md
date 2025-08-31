Complete Authentication System with OTP Verification
A full-stack authentication system with email OTP verification, built with React (TypeScript) frontend and Node.js/Express backend.
Features

User registration and login
Email OTP verification
JWT-based authentication
Password hashing with bcrypt
MongoDB integration
TypeScript support
Error handling middleware
Responsive UI components

Tech Stack
Frontend

React 18
TypeScript
Axios for API calls
React Hooks for state management
CSS for styling

Backend

Node.js
Express.js
TypeScript
MongoDB with Mongoose
JWT for authentication
Nodemailer for email sending
bcrypt for password hashing

git clone <your-repo-url>
cd <project-name>
cd client
npm install
cd server
npm install
cd ..
4. Environment Configuration
Backend Environment (.env)
Create a .env file in the server/ directory:


# Server Configuration
PORT=5000                   # Port on which the server will run
NODE_ENV=development        # Environment (development/production)

# Database Configuration
MONGODB_URI=your-mongodb-connection-string  # MongoDB connection URI

# Secrets
JWT_SECRET=your-jwt-secret                  # Secret key for signing JWT tokens
SESSION_SECRET=your-session-secret          # Secret key for session management

# Client (Frontend URL)
CLIENT_URL=http://localhost:3000            # URL of the frontend client

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id          # Google OAuth client ID
GOOGLE_CLIENT_SECRET=your-google-client-secret  # Google OAuth client secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback  # OAuth redirect URL

# Email Configuration (using Gmail)
EMAIL_USER=your-email@gmail.com        # Gmail address for sending emails
EMAIL_PASS=your-email-app-password     # Gmail App Password
EMAIL_FROM=your-email@gmail.com        # Sender email address

# Optional: SendGrid (if you switch later)
# SENDGRID_API_KEY=your-sendgrid-api-key      # API key for SendGrid

# Optional: Custom SMTP
# SMTP_HOST=smtp.your-provider.com            # SMTP host
# SMTP_PORT=587                               # SMTP port
# SMTP_USER=your-smtp-user                    # SMTP username
# SMTP_PASS=your-smtp-password                # SMTP password

Frontend Environment (.env)
Create a .env file in the root directory:
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api    # Backend API base URL

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id  # Google OAuth client ID for frontend

5. MongoDB Setup
Option A: Local MongoDB

Install MongoDB locally
Start MongoDB service
Use connection string: mongodb://localhost:27017/auth-app

Option B: MongoDB Atlas

Create a MongoDB Atlas account
Create a new cluster
Get your connection string
Update MONGODB_URI in server/.env

6. Email Service Setup (Gmail Example)

Enable 2-Factor Authentication on your Gmail account
Generate an App-Specific Password:

Go to Google Account Settings
Security → 2-Step Verification → App passwords
Generate password for "Mail"


Use this app password in EMAIL_PASS

Running the Application
Development Mode
Terminal 1: Start Backend Server
bashcd server
npm run dev
Server will run on http://localhost:5000
Terminal 2: Start Frontend Application
bashnpm start
Frontend will run on http://localhost:3000
Production Build
Build Frontend
bashnpm run build
Build Backend
bashcd server
npm run build
npm start

Contributing

Fork the repository
Create feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open Pull Request
