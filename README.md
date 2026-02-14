# Pool Lounge Website & Admin System

This project is organized into three main parts:

1.  **Backend** (Node/Express API) - Port 5000
2.  **Frontend** (React/Vite Website) - Port 5173
3.  **Admin** (Next.js Dashboard) - Port 3000

## Prerequisites
- Node.js installed
- MongoDB installed and running

## How to Run (3 Terminals Required)

You need to open **3 separate terminal windows** inside the `Pool_website` folder and run one component in each.

### Terminal 1: Backend (API)
```bash
cd backend
npm run dev
```
*Wait for "MongoDB Connected" message.*

### Terminal 2: Frontend (User Website)
```bash
cd frontend
npm run dev
```
*Access at: http://localhost:5173*

### Terminal 3: Admin (Staff Dashboard)
```bash
cd admin
npm run dev
```
*Access at: http://localhost:3000*

## Features
- **3D Parallax Home**: Immersive scroll experience.
- **Booking System**: Real-time table reservations with conflict checks.
- **Admin Dashboard**: Live view of table status and bookings.
- **Menu & Orders**: Cafe ordering system.
