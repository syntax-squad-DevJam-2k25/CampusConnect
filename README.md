# <h1 align="center">🎓 Campus Connect</h1>

<p align="center">
A full-stack social networking platform for college students where they can connect, chat in real time, share posts, discover coding profiles, and build meaningful academic relationships.
</p>

<p align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-RealTime-black?logo=socket.io)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

</p>

---

#  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Modules](#-api-modules)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

---

# Features

###  Authentication
- User Registration & Login
- Google Authentication
- JWT Authentication
- Protected Routes
- Password Encryption using bcrypt

###  Posts
- Create Posts
- Edit Posts
- Delete Posts
- Like & Unlike Posts
- Comment on Posts
- Reply to Comments
- Image Upload using Cloudinary

### Real-Time Chat
- One-to-One Chat
- Socket.IO Integration
- Real-Time Messaging
- Read Receipts
- Edit Messages
- Emoji Support
- File Sharing

###  Social Features
- Follow & Unfollow Users
- User Profiles
- Coding Profile Integration
- Suggested Connections

###  AI Moderation
- Detect Harmful Content
- Prevent Offensive Posts
- AI-powered Content Moderation

---

#  Tech Stack

## Frontend

- React.js
- Redux Toolkit
- Tailwind CSS
- Axios
- Socket.io Client
- React Router DOM

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt.js
- Socket.io
- Multer
- Cloudinary

---

#  Folder Structure

```text
CampusConnect
├── Backend
│   ├── config
│   │   ├── cloudinary.js
│   │   ├── multer.js
│   │   └── socket.js
│   │
│   ├── controllers
│   │   ├── platformController/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── commentController.js
│   │   ├── googleAuthController.js
│   │   ├── matchController.js
│   │   ├── postController.js
│   │   └── userController.js
│   │
│   ├── middleware
│   │   ├── authMiddleware.js
│   │   └── upload.middleware.js
│   │
│   ├── models
│   │   ├── chat.js
│   │   ├── Comment.js
│   │   ├── Post.js
│   │   └── User.js
│   │
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── postRoutes.js
│   │   ├── routeCodeforces.js
│   │   └── userRoutes.js
│   │
│   ├── utils
│   │   ├── aiModeration.js
│   │   └── cloudinaryUpload.js
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── Frontend
│   ├── public
│   │
│   ├── src
│   │   ├── Assets
│   │   ├── chatApiCalls
│   │   ├── Components
│   │   ├── lib
│   │   ├── Pages
│   │   ├── redux
│   │   ├── utils
│   │   ├── App.js
│   │   ├── chartSetup.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── reportWebVitals.js
│   │   ├── setupTests.js
│   │   └── socket.js
│   │
│   ├── .env
│   ├── package.json
│   ├── craco.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

#  Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CampusConnect.git
```

```bash
cd CampusConnect
```

---

## 2. Backend Setup

```bash
cd Backend
```

Install dependencies

```bash
npm install
```

Run backend

```bash
npm start
```

---

## 3. Frontend Setup

```bash
cd Frontend
```

Install dependencies

```bash
npm install
```

Run frontend

```bash
npm start
```

---

#  Environment Variables

## Backend (.env)

```env
PORT=5000

MONGODB_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET_KEY

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=
```

---

## Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000

REACT_APP_SOCKET_URL=http://localhost:5000
```

---

#  API Modules

### Authentication

- Register
- Login
- Google Login
- JWT Verification

### Users

- Profile
- Follow / Unfollow
- Search Users

### Posts

- Create
- Edit
- Delete
- Like
- Comment

### Chat

- Create Chat
- Send Message
- Edit Message
- Read Messages
- Upload Files

---

# 📷 Screenshots

Add your screenshots here.

```
screenshots/
│── Home.png
│── Login.png
│── Feed.png
│── Chat.png
│── Profile.png
```

Example

```markdown
## Home

![Home](screenshots/Home.png)

## Chat

![Chat](screenshots/Chat.png)
```

---

