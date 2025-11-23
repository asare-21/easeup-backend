# EaseUp Backend

![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![Express.js](https://img.shields.io/badge/express-4.18.2-blue)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green)
![License](https://img.shields.io/badge/license-ISC-blue)

The ultimate backend API that powers the EaseUp mobile application - revolutionizing how users book handyman services effortlessly.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

EaseUp Backend is a robust Node.js/Express.js REST API that serves as the backbone for the EaseUp mobile application. It provides comprehensive services for connecting users with skilled handymen, managing bookings, handling payments, and facilitating real-time communication.

## ✨ Features

- **Multi-Provider Authentication**
  - Google OAuth 2.0
  - Facebook OAuth
  - Twitter OAuth
  - JWT-based authentication for workers and users

- **User Management**
  - User profiles and preferences
  - Worker profiles with verification
  - Bookmark and favorites system

- **Service Management**
  - Service listings and categorization
  - Search and filtering capabilities
  - Recommendation engine

- **Booking System**
  - Job creation and management
  - Time slot scheduling
  - Job request handling
  - Booking plans

- **Communication**
  - Real-time chat using Socket.IO
  - Chat rooms
  - Notifications system

- **Advanced Features**
  - Azure AI integration
  - Redis caching for performance
  - Rate limiting for API protection
  - Firebase Admin for push notifications
  - Advertisement management
  - Dashboard analytics

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Authentication**: Passport.js (Google, Facebook, Twitter)
- **Security**: Helmet, JWT, Express Rate Limit
- **Process Manager**: PM2
- **Documentation**: Swagger (OpenAPI 3.0)
- **AI/ML**: Azure OpenAI
- **Cloud Services**: Firebase Admin
- **Other**: Morgan (logging), Compression, CORS

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas account)
- **Redis** (for caching)
- **Firebase** project (for push notifications)
- **OAuth Credentials** (Google, Facebook, Twitter - if using social auth)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/asare-21/easeup-backend.git
   cd easeup-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Download the service account JSON file
   - Rename it to `easeup.json` and place it in the root directory

## ⚙️ Configuration

1. **Create environment file**
   
   Create a `.env` file in the root directory with the following variables:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MongoDB Configuration
   MONGO_USER=your_mongo_username
   MONGO_PASS=your_mongo_password

   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

   # Facebook OAuth
   FACEBOOK_CLIENT_ID=your_facebook_app_id
   FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
   FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback

   # Twitter OAuth
   TWITTER_CONSUMER_KEY=your_twitter_consumer_key
   TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret
   TWITTER_CALLBACK_URL=http://localhost:3000/auth/twitter/callback

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Azure OpenAI (if using)
   AZURE_OPENAI_API_KEY=your_azure_openai_key
   AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
   ```

2. **Configure OAuth Applications**
   
   Set up OAuth applications for each provider:
   - **Google**: [Google Cloud Console](https://console.cloud.google.com/)
   - **Facebook**: [Facebook Developers](https://developers.facebook.com/)
   - **Twitter**: [Twitter Developer Portal](https://developer.twitter.com/)

## 🏃‍♂️ Running the Application

### Development Mode

```bash
node index.js
```

### Production Mode with PM2

```bash
npm start
```

This will start the application using PM2 with the configuration from `ecosystem.config.js`.

### Using PM2 Directly

```bash
pm2 start ecosystem.config.js
pm2 logs
pm2 stop all
```

The server will start on the port specified in your `.env` file (default: 3000).

## 📚 API Documentation

### Swagger UI (Development Only)

When running in development mode, access the interactive API documentation at:

```
http://localhost:3000/docs
```

### Base URL

```
http://localhost:3000
```

### Health Check

```
GET /
```

Returns:
```json
{
  "status": 200,
  "success": true
}
```

## 🔐 Authentication

### Social Authentication (Users)

#### Google Authentication

1. Navigate to `{BASE_URL}/auth/google`
2. Complete Google authentication
3. Upon success, you'll be redirected with a JWT token
4. Use the token as a Bearer token in subsequent API requests

**Example:**
```
GET http://localhost:3000/auth/google
```

#### Facebook Authentication

1. Navigate to `{BASE_URL}/auth/facebook`
2. Complete Facebook authentication
3. Upon success, you'll be redirected with a JWT token
4. Use the token as a Bearer token in subsequent API requests

**Example:**
```
GET http://localhost:3000/auth/facebook
```

#### Twitter Authentication

1. Navigate to `{BASE_URL}/auth/twitter`
2. Complete Twitter authentication
3. Upon success, you'll be redirected with a JWT token
4. Use the token as a Bearer token in subsequent API requests

**Example:**
```
GET http://localhost:3000/auth/twitter
```

### Worker Authentication

#### Worker Signup
```
POST {BASE_URL}/worker/create
```

#### Worker Login
```
POST {BASE_URL}/worker/login
```

### Using Bearer Tokens

Include the JWT token in your API requests:

```
Authorization: Bearer <your_jwt_token>
```

## 📁 Project Structure

```
easeup-backend/
├── cache/                  # Redis caching logic
├── config/                 # Configuration files
│   └── config.js          # Main configuration
├── controllers/           # Request handlers
├── models/                # Mongoose models
│   ├── bookingModel.js
│   ├── user_model.js
│   ├── worker_models.js
│   ├── chatRoomModel.js
│   └── ...
├── passport/              # Passport.js strategies
├── routes/                # API routes
│   ├── api/              # API endpoints
│   │   ├── auth.js
│   │   ├── user.router.js
│   │   ├── worker.router.js
│   │   ├── jobs.js
│   │   ├── chat.js
│   │   └── ...
│   └── dashboard/        # Dashboard routes
├── services/              # Business logic
├── validators/            # Request validation
├── .env                   # Environment variables (not in repo)
├── .gitignore            # Git ignore file
├── ecosystem.config.js   # PM2 configuration
├── easeup.json           # Firebase service account (not in repo)
├── index.js              # Application entry point
├── joi.validator.js      # Joi validation setup
├── package.json          # Dependencies
├── Procfile              # Heroku deployment
└── README.md             # This file
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Joseph ASARE**

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the robust database
- All contributors and supporters of this project

---

For questions or support, please open an issue in the GitHub repository.