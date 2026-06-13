# 🚀 Sovereign Real-Time Video Support Platform

A fully self-hosted, sovereign real-time video support platform with **zero external API dependencies**. Built using **Next.js 15 (App Router)**, **Prisma v7**, **SQLite**, and a locally hosted **LiveKit WebRTC SFU** running inside Docker.

---

## 🏗️ Tech Stack & Architecture

### ⚡ Frontend

* Next.js 15 (App Router)
* React 19
* Client-side use of `React.use()` for safely unwrapping dynamic route parameters asynchronously

### 🗄️ Database

* Prisma ORM v7
* SQLite
* `prisma.config.ts` for configuration management
* Native `@prisma/adapter-better-sqlite3` adapter

### 🎥 Real-Time Communication

* LiveKit Server (Pion-based SFU)
* Dockerized deployment
* Server-routed WebRTC media streams
* Reliable NAT traversal and transport stability

### 📁 File Management

* Secure local file uploads
* Shared document support
* Offline-first storage under:

```text
/public/uploads/
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"

LIVEKIT_API_KEY="devkey"
LIVEKIT_API_SECRET="secret"

LIVEKIT_URL="http://localhost:7880"
NEXT_PUBLIC_LIVEKIT_URL="ws://localhost:7880"
```

---

## 🚀 Local Development Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Prepare Database

```bash
npx prisma migrate dev --name init_sovereign_tables
```

### 3️⃣ Start LiveKit Infrastructure

Ensure Docker is running, then launch the local WebRTC stack:

```bash
docker compose up -d
```

### 4️⃣ Start Development Server

```bash
npm run dev
```

---

## 🧪 End-to-End Testing

### 👨‍💼 Agent Session

```text
http://localhost:3000/call/test_room?role=AGENT&identity=Dave
```

### 👤 Customer Session

```text
http://localhost:3000/call/test_room?role=CUSTOMER&identity=John
```

Open both URLs in separate browser windows to test real-time audio/video communication.

---

## 📦 GitHub Repository Setup

### 1️⃣ Create a GitHub Repository

* Visit GitHub
* Click **New Repository**
* Choose a repository name (e.g., `sovereign-webrtc-platform`)
* Set visibility to **Public**
* Click **Create Repository**

### 2️⃣ Push the Project

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your repository URL:

```bash
# Initialize Git
git init

# Stage all files
git add .

# Create initial commit
git commit -m "feat: Completed Sovereign WebRTC Support Platform MVP"

# Set main branch
git branch -M main

# Add remote repository
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>

# Push code
git push -u origin main
```

---

## 🔒 Key Features

* ✅ 100% Self-Hosted Architecture
* ✅ Zero External API Dependencies
* ✅ Sovereign Data Ownership
* ✅ Real-Time WebRTC Communication
* ✅ Dockerized Infrastructure
* ✅ Local File Sharing
* ✅ SQLite + Prisma Persistence
* ✅ Agent & Customer Support Rooms
* ✅ Offline-Friendly Deployment Model
