# 🏍️ Rapido-Pro: Tier-1 Real-Time Ride-Hailing Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-blue?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Rapido-Pro** is a high-fidelity, full-stack clone of India's leading bike-taxi platform. Built for performance and extreme reliability, this platform demonstrates the power of real-time bidirectional communication, interactive maps, and modern UI engineering.

---

## 🚀 Live Production Links
- **Official Website:** [https://rapido-pro.vercel.app/](https://rapido-pro.vercel.app/)
- **Customer Hub:** [/customer](https://rapido-pro.vercel.app/customer)
- **Captain Hub:** [/rider](https://rapido-pro.vercel.app/rider)

---

## ✨ Premium Features

### 📡 Real-Time Synchronized Ecosystem
*   **Instant Matching:** Leveraging **Socket.io** for sub-second synchronization between Customer requests and Rider availability.
*   **State Persistence:** Robust backend handling of pending ride queues ensures no request is ever lost, even if a rider goes offline/online.
*   **Live Connection Indicators:** 🟢 Real-time health checks on every page to ensure stable socket connectivity.

### 📍 Intelligent Map Integration
*   Integrated **Leaflet.js** with **OSRM (Open Source Routing Machine)** for live route calculations.
*   Interactive markers for Pickup, Drop, and Live Rider Movement.
*   Automated fare calculation based on real-world road distances.

### 🔒 Enterprise-Grade Security
*   **Dynamic OTP Verification:** 4-digit ride-start codes generated on the fly and synchronized across clients.
*   **Multi-Factor Auth:** Integrated Google OAuth (NextAuth) and Mock-Phone OTP authentication.
*   **Safety SOS:** Dedicated safety dashboard for commuters.

### 🎨 High-Fidelity UI/UX
*   **Brand Identity:** Strict adherence to the new **Rapido Saffron & Black** wordmark design.
*   **Responsive Engine:** Seamless experience across Mobile, Tablet, and Desktop.
*   **Rich Media:** Professional AI-generated assets for a premium commercial look.

---

## 🛠️ Technical Architecture

### Frontend (The Engine)
- **Framework:** Next.js 15 (App Router)
- **Styling:** Vanilla CSS + Tailwind for complex animations.
- **State Management:** React Context + Socket Refs for stale-closure prevention.
- **Client:** `socket.io-client` for persistent tunneling.

### Backend (The Brain)
- **Runtime:** Node.js (Express)
- **Messaging:** Socket.io Server with event-driven architecture.
- **Deployment:** Render (Web Services) with automated CI/CD.

---

## 📦 Local Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Rupesh033/my-delivery-app.git
    cd my-delivery-app
    ```

2.  **Environment Setup**
    Create a `.env` in the `frontend` folder:
    ```env
    NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
    GOOGLE_ID=your_id
    GOOGLE_SECRET=your_secret
    NEXTAUTH_SECRET=your_secret
    NEXTAUTH_URL=http://localhost:3000
    ```

3.  **Run Development Servers**
    ```bash
    # Backend
    cd backend && npm install && npm start
    
    # Frontend
    cd frontend && npm install && npm run dev
    ```

---

## 🏆 Development Audit
Successfully addressed critical production bugs:
- ✅ Fixed `mockDb` ReferenceError in Backend Socket handlers.
- ✅ Re-engineered Socket Lifecycle to prevent disconnection on state changes.
- ✅ Solved Stale Closures in React effects using `useRef` architecture.
- ✅ Corrected OTP broadcast logic for multi-client synchronization.

---
**Developed with ❤️ by Rupesh Vishwakarma**
"Building the future of urban mobility, one line of code at a time."
