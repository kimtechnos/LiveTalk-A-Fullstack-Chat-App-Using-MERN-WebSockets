# LiveTalk-A-Fullstack-Chat-App-Using-MERN-WebSockets

**LiveTalk** is a fullstack real-time chat application built with the **MERN stack (MongoDB, Express, React, Node.js)** and **Socket.io** for WebSocket communication.

## 🚀 Features

- 🔒 User authentication with JWT
- 💬 Real-time one-on-one and group chat
- 🟢 Online/offline status indicators
- 📁 Image/file sharing (Cloudinary)
- 🔔 Typing indicators and message timestamps
- 💾 Message history stored in MongoDB
- 📱 Responsive React frontend with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Socket.io-client
- **Backend:** Node.js, Express.js, MongoDB, Socket.io
- **Authentication:** JWT
- **Media Storage:** Multer & Cloudinary

## Deployment

The **LiveTalk** application is fully deployed on **Render**:

- **Backend**:
  Hosted at [https://livetalk-backend-chat-app.onrender.com](https://livetalk-backend-chat-app.onrender.com)  
  API Base URL: `https://livetalk-backend-chat-app.onrender.com/api`
  - **Frontend**:  
    Hosted on Render and configured with environment variable:
  ```env
  VITE_API_BASE_URL=https://livetalk-backend-chat-app.onrender.com

  ```

## 📦 Installation

### 1. Clone the repo

```bash
git clone [https://github.com/yourusername/livetalk.git](https://github.com/kimtechnos/LiveTalk-A-Fullstack-Chat-App-Using-MERN-WebSockets.git)
cd livetalk

Start the backend
cd server
npm install
npm run dev
start frontend
cd client
npm install
npm run dev


```
