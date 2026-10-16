# 🎬 VinnovateIT Watch Party

A real-time synchronized video watch party application built for the VinnovateIT recruitment task. 

## Tech Stack
* **Frontend:** Next.js (App Router), Tailwind CSS, Socket.io-client
* **Backend:** Node.js, Express, Socket.io

## Features
* Generate dynamic room codes to create isolated watch sessions.
* Join existing rooms using the exact code.
* Real-time synchronization of Play, Pause, and Video Seeking across all connected clients.

## How to Run Locally

You will need two separate terminal windows to run the frontend and backend simultaneously.

### 1. Start the Backend Server
```bash
cd server
npm install
node index.js
