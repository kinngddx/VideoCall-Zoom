Sovereign Real-Time Video Support Platform
A fully self-hosted, sovereign real-time video support platform with zero external API dependencies. Built with Next.js 15 (App Router), Prisma v7, SQLite, and a local LiveKit WebRTC SFU server running inside Docker.

Tech Stack & Architecture
Framework: Next.js 15 (Client-side use of React.use() to safely unwrap dynamic route parameters asynchronously)

Database ORM: Prisma v7 with prisma.config.ts loading connection parameters and a native @prisma/adapter-better-sqlite3 adapter

WebRTC SFU: LiveKit Server (Pion-based) running in Docker, allowing server-routed media calls with complete network transport stability

File System: Standard offline file uploads and shared documents saved securely under local /public/uploads/ directory

Local Setup & Quickstart
Clone the repository:bash
git clone <YOUR_REPOS_URL>
cd videocallplatform


Configure environment variables (.env):
Create a .env file in the root directory:

Code snippet
DATABASE_URL="file:./dev.db"
LIVEKIT_API_KEY="devkey"
LIVEKIT_API_SECRET="secret"
LIVEKIT_URL="http://localhost:7880"
NEXT_PUBLIC_LIVEKIT_URL="ws://localhost:7880"
Install dependencies:

Bash
npm install
Prepare database tables:

Bash
npx prisma migrate dev --name init_sovereign_tables
Spin up local sovereign WebRTC containers (Docker):
Ensure Docker is running on your machine, then run:

Bash
docker compose up -d
Start local development server:

Bash
npm run dev
Test End-to-End Rooms:

Agent Window: http://localhost:3000/call/test_room?role=AGENT&identity=Dave

Customer Window: http://localhost:3000/call/test_room?role=CUSTOMER&identity=John


---

### Step 3: Initialize Git and Push to GitHub (VS Code Terminal)

1. Go to **[GitHub.com](https://github.com/)**, click **New Repository**, name it (e.g., `sovereign-webrtc-platform`), set it to **Public**, and click **Create Repository**.
2. Copy the repository URL (e.g., `https://github.com/your-username/sovereign-webrtc-platform.git`).
3. Run these commands sequentially in your VS Code terminal [1]:

```bash
# Initialize local git repository
git init

# Add all files to staging index (respecting your.gitignore rules)
git add.

# Create the initial commit
git commit -m "feat: Completed Sovereign WebRTC Support Platform Grand Finale MVP"

# Set the default branch to main
git branch -M main

# Link your local folder to your remote GitHub repository
git remote add origin <PASTE_YOUR_COPIED_GITHUB_REPO_URL_HERE>

# Push the codebase up
git push -u origin main
