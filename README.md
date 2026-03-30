# VibAura - Modern Music Streaming Platform

<div align="center">

![VibAura](https://img.shields.io/badge/VibAura-Music%20Player-blueviolet?style=for-the-badge&logo=spotify)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0--Stable-orange?style=for-the-badge)

**A sleek, modular music streaming platform built for high-performance and design parity across all devices.**

</div>

---

## 👀 Overview

**VibAura** is a performant single-page application (SPA) centered around a clean, modular architecture. It provides a seamless experience for discovering music, managing personal libraries, and secure user authentication—all without the overhead of heavy frameworks.

### Why VibAura?
- **Modular v2 Architecture**: Completely decoupled frontend renderers and modularized backend services for maximum maintainability.
- **Unified Design Parity**: Absolute visual consistency between Artist and Playlist pages on both desktop and mobile.
- **Secure & Robust**: Integrated OTP-based security for password management and JWT-backed session control.
- **Lightweight & Fast**: Pure Vanilla JS/CSS with optimized lazy loading for specialized components like the Music Player and Search systems.

---

## 🌟 Key Features

### 🎶 Immersive Music Player
- **Real-time Controls**: Play, pause, skip, and seek functionality with a precision progress bar.
- **Queue Management**: Dynamic queue handling with persistent playback states.
- **Responsive Controls**: Optimized for desktop hover interactions and mobile touch gestures.

### 🔍 Advanced Search System
- **Real-time Filtering**: Instant search results for songs, artists, and playlists as you type.
- **Categorized Results**: Organized display sections for easy discovery.
- **Performance Optimized**: Debounced API calls and lazy loading to keep the UI snappy.

### 🎓 Artist Profiles & Library
- **Circular Framing**: Premium artist profile designs with circular imagery and discographies.
- **Library Management**: Access liked songs, recently played tracks, and custom playlists.
- **Route Guarding**: Secure client-side routing to protect private library data.

### 🛡️ Security & Auth
- **OTP Verification**: Secure password reset flow using one-time passcodes sent via email.
- **Encryption**: Industry-standard password hashing using Bcrypt.
- **JWT Sessions**: Token-based authentication for persistent and secure user logins.

---

## 💻 Tech Stack

### Frontend
- **HTML5 & CSS3**: Custom properties (CSS variables) for robust light/dark theming and modular layouts.
- **Vanilla JavaScript (ES6+)**: Modular rendering logic (no frameworks) and client-side routing (SPA).
- **Responsive Components**: Tailored CSS for `desktop/`, `mobile/`, and `pages/` roles.

### Backend
- **Node.js & Express.js**: High-efficiency backend server handling API routing and static file serving.
- **MongoDB (Mongoose)**: Document-oriented database for storing song metadata, user profiles, and playlists.
- **Compression**: Gzip/Brotli integration for lightning-fast asset delivery.

---

## 📁 Project Structure

```text
VibAura/
├── backend/                  # Express.js Server & API
│   ├── routes/               # Modularized API endpoints (Auth, Search, Songs, etc.)
│   ├── utils/                # Centralized Logging & Helpers
│   └── server.js             # Main Entry Point
├── frontend/                 # Web Application
│   ├── public/               # Static Assets
│   │   ├── css/              # Modular CSS (components, pages, mobile, versions)
│   │   ├── images/           # Icons, Logos, UI Assets
│   │   └── index.html        # Main SPA Shell
│   └── scripts/              # Application Logic
│       ├── auth/             # Login, Signup, OTP Logic
│       ├── core/             # SPA Router & Core App Context
│       └── ui/               # Renderers, Components, Search logic
├── models/                   # Mongoose Database Schemas
└── package.json              # Project Dependencies & Scripts
```

---

## 🔧 Setup & Installation

### Prerequisites
- **Node.js** (v14.0 or higher)
- **MongoDB** (Local or Atlas Atlas connection URI)
- **NPM** (Package manager)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/iakashy05/VibAura.git
   cd VibAura
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root based on `.env.example`:
   ```bash
   DB_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Run the Application:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

---

## 👤 Author
**Akash Yadav** ([@iakashy05](https://github.com/iakashy05))

---
<div align="center">
  ### Made with ❤️ by Akash Yadav
</div>
