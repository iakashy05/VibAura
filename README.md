<div align="center">

<img src="client/public/logo.webp" alt="VibAura Logo" width="140">

# 🌌 VibAura

### **A Premium Shared Listening Space & High-Fidelity Audio Experience**

VibAura is a high-fidelity music streaming and real-time synchronized listening platform featuring a premium glassmorphic interface, social listening rooms, audio analytics, and Razorpay subscription gates.

[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20MongoDB%20%7C%20Vite-blue?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)](#)

</div>

---

## 📸 Interface Showcase

<div align="center">
  <table>
    <tr>
      <td width="50%">
        <p align="center"><b>🎨 Unified Dashboard (Dark Mode)</b></p>
        <img src="client/public/screenshots/home_dark.png" alt="Unified Dark Mode Dashboard" width="100%">
      </td>
      <td width="50%">
        <p align="center"><b>🎧 VibSync Live Session</b></p>
        <img src="client/public/screenshots/vibsync_session.png" alt="VibSync Live Shared Listening Room" width="100%">
      </td>
    </tr>
    <tr>
      <td width="50%">
        <p align="center"><b>🎵 Desktop Fullscreen Player</b></p>
        <img src="client/public/screenshots/player_fullscreen.png" alt="Fullscreen Player and Vinyl Disc" width="100%">
      </td>
      <td width="50%">
        <p align="center"><b>👑 Pro Vibe & Razorpay Gateway</b></p>
        <img src="client/public/screenshots/payment.png" alt="Pro Subscription Payment Flow" width="100%">
      </td>
    </tr>
  </table>
</div>

---

## ✨ Core Features

- **🎧 VibSync Rooms**: Real-time websocket-powered listening rooms supporting multi-user audio synchronization, interactive presenter gates, and live listener avatars.
- **👑 Pro Vibe Tier**: Gated premium ecosystem including Razorpay payments, custom styled avatars, and exclusive features.
- **📊 Vibrance Wrapped**: Personalized monthly music analytics dashboard mapping auditory ranges, frequencies, and top genres.
- **💿 Physics-based Vinyl Player**: Interactive, hardware-accelerated rotating vinyl player with continuous play/pause state synchronization.
- **🎨 Glassmorphic Aesthetic**: Mathematically aligned pod layout optimizing both desktop and mobile views.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Zustand, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB Atlas via Mongoose
- **Workspace**: npm workspaces (monorepo structure)

---

## 🚀 Installation & Local Launch

### 1. Install Dependencies
Run from the root directory to install packages for the entire workspace:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the `server/` directory:
```env
DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
```
> [!IMPORTANT]
> Never commit your `.env` file or expose your actual credentials.

### 3. Run Development Server
```bash
npm run dev
```
- Client runs at: `http://localhost:5173`
- Server runs at: `http://localhost:4000`

---

## 📁 Repository Structure

```text
VibAura/
├── client/       # Frontend client (Vite + React)
├── server/       # Backend API server (Node.js + Express)
└── package.json  # npm workspaces configuration
```

---

## 👤 Maintainer
**Akash Yadav** — [@iakashy05](https://github.com/iakashy05)
