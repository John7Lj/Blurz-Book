# 📚 Blurz Book System

A full-stack book management web application built with a FastAPI server and React client. This system demonstrates modern web architecture including Authentication, Database management, Background tasks (Celery/Redis), and Email services.

---

## 🏗️ Architecture

- **Backend:** FastAPI (Python)
- **Frontend Web:** React + Vite (JavaScript/TypeScript)
- **Frontend Mobile:** React Native + Expo (TypeScript)
- **Database:** PostgreSQL (Async)
- **Background Tasks:** Celery + Redis
- **Email:** SMTP (Gmail)

---

## 🚀 Getting Started

Follow these instructions to set up the project on your local machine.

### 📋 Prerequisites

Ensure you have the following installed:
- [Python 3.12+](https://www.python.org/downloads/)
- [Node.js & npm](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/downloads)

---

### 1️⃣ Database Setup (PostgreSQL)

The system requires a PostgreSQL database.

1. **Download & Install:** [PostgreSQL Installer (EnterpriseDB)](https://sbp.enterprisedb.com/getfile.jsp?fileid=1259914)
2. **Setup:**
   - Open **pgAdmin 4** (installed with Postgres).
   - Create a new Database named `blurz`.
   - Create a user `postgres` with password `blurz` (or use your own and update `.env` later).
   - Ensure the server is running on port `5432`.

### 2️⃣ Redis Setup (Worker Broker)

Redis is needed for background tasks (like sending emails).

1. **Download:** [Redis for Windows](https://github.com/microsoftarchive/redis/releases) or [Redis.io](https://redis.io/download/)
2. **Run:**
   - Start the `redis-server` executable.
   - Ensure it is running on port `6379`.

---

### 3️⃣ Server Setup (Backend)

1. **Navigate to the server folder:**
   ```powershell
   cd server
   ```

2. **Create a Virtual Environment:**
   ```powershell
   python -m venv .venv
   ```

3. **Activate Environment:**
   - **Command Prompt:** `.venv\Scripts\activate.bat`
   - **PowerShell:**
     ```powershell
     # If activation fails, run this first:
     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
     
     .venv\Scripts\Activate.ps1
     ```

4. **Install Dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables:**
   Create a `.env` file in the `server/` directory with the following configuration:
   
   ```env
   # Database Connection (Async)
   DB_URL=postgresql+asyncpg://postgres:blurz@localhost:5432/blurz

   # Security (Generate a secure secret in production)
   jwt_secret=YOUR_SECRET_KEY_HERE
   password_secrete_reset=YOUR_RESET_SECRET_HERE
   jwt_algorithm=HS256
   
   # Token Expiry
   refresh_token_expiary=7
   access_token_expiary=30

   # Redis Configuration
   ResisHost=localhost  
   ResdisPort=6379
   Redis_DB=0
   Redis_Url=redis://localhost:6379/0

   # Domain Configuration (Update IP to your machine's or localhost)
   domain=http://localhost:5173

   # Email Configuration (Gmail App Password)
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password
   MAIL_FROM=your_email@gmail.com
   MAIL_PORT=587
   MAIL_SERVER=smtp.gmail.com
   MAIL_FROM_NAME=Blurz_Book
   ```
   > **Note:** For Gmail, generate an **App Password** from your Google Account Security settings. Do not use your normal login password.

6. **Run the API Server:**
   ```powershell
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   *The server will start at `http://localhost:8000`*

7. **Run Celery Worker (Background Tasks):**
   Open a **new terminal**, activate the `.venv`, and run:
   ```powershell
   celery -A src.celery.celery_tasks worker --loglevel=info --pool=solo
   ```

---

### 4️⃣ Client Setup (Frontend)

1. **Open a new terminal and navigate to the client folder:**
   ```powershell
   cd client
   ```

2. **Install Dependencies:**
   ```powershell
   npm install
   ```

3. **Run Development Server:**
   ```powershell
   npm run dev
   ```
   *The frontend will start at `http://localhost:5173`*

---

### 5️⃣ Mobile App Setup (React Native + Expo)

The mobile app provides a native Android/iOS experience with the same functionality as the web client.

#### Prerequisites
- **Node.js** (same as web client)
- **Expo Go** app on your phone (for testing) - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779)
- **EAS CLI** (for building production APKs/IPAs)

#### Setup Steps

1. **Navigate to the mobile app folder:**
   ```powershell
   cd mobile-blurz
   ```

2. **Install Dependencies:**
   ```powershell
   npm install
   ```

3. **Update API Configuration:**
   Edit `services/api.ts` to point to your server:
   ```typescript
   const API_URL = "http://YOUR_LOCAL_IP:8000";  // e.g., http://192.168.1.100:8000
   ```
   > **Note:** Use your machine's local IP address (not `localhost`) so the mobile device can access the server.

### 6️⃣ Network Configuration (Crucial for Mobile)

Since the mobile app runs on a physical device, it needs permission to access your local development server.

#### 1. Android Network Security
The project includes a custom Expo Config Plugin (`plugins/withAndroidNetworkSecurityConfig.js`) that automatically:
- Configures Android to allow **cleartext (HTTP) traffic** to your local IP.
- You don't need to do anything manually for this; it's applied during the build.

#### 2. Windows Firewall (Inbound Rules)
Your computer's firewall may block the mobile device from connecting to the server. We have provided a script to fix this.

**Run this command in PowerShell as Administrator:**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; & "scripts/allow_firewall.ps1"
```
*This opens Port 8000 for inbound TCP traffic.*

#### Running the Mobile App

**Start the Development Server:**
```powershell
npx expo start
```

**Options to run:**
- Press `a` to run on **Android Emulator** (requires Android Studio)
- Press `i` to run on **iOS Simulator** (requires Xcode - macOS only)
- Scan the **QR code** with Expo Go app on your physical device

#### Building for Production

**1. Install EAS CLI Globally:**
```powershell
npm install -g eas-cli
```

**2. Login to Expo:**
```powershell
eas login
```

**3. Configure Build:**
```powershell
eas build:configure
```

**4. Build APK (Android):**
```powershell
# For production APK
npx eas build --platform android

# For development build (faster, for testing)
npx eas build --platform android --profile preview
```

**5. Build IPA (iOS):**
```powershell
npx eas build --platform ios
```

**6. Build for Both Platforms:**
```powershell
npx eas build --platform all
```

> **Note:** Building requires an Expo account (free). The build happens in the cloud and may take 10-20 minutes. You'll receive a download link when complete.

#### Running Production APK

After the build completes:
1. Download the APK from the provided link
2. Transfer to your Android device
3. Install and run (you may need to enable "Install from Unknown Sources")

---

## 📂 Project Structure

```
blurz book system
├── client/              # React Web Frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── mobile-blurz/        # React Native Mobile App
│   ├── app/             # App screens
│   ├── components/      # Reusable components
│   ├── contexts/        # Auth & state management
│   ├── services/        # API calls
│   ├── app.json         # Expo configuration
│   ├── eas.json         # Build configuration
│   └── package.json
├── server/              # FastAPI Backend
│   ├── src/
│   │   ├── auth/        # Authentication logic
│   │   ├── book/        # Book management
│   │   ├── celery/      # Background tasks
│   │   ├── db/          # Database models & config
│   │   └── mailserver/  # Email templates & logic
│   ├── .env             # Environment variables
│   ├── main.py          # App entry point
│   └── requirements.txt
└── README.md            # This documentation
```

---

## ✅ Features Checklist

### Backend Features
- [x] User Authentication (JWT)
- [x] Email Verification & Password Reset
- [x] Book Management (CRUD)
- [x] E-book Upload/Download (PDF, EPUB, MOBI)
- [x] Background Email Sending (Celery)

### Web App Features
- [x] Reactive UI (React + Tailwind)
- [x] Responsive Design
- [x] Book Library with Search/Filter
- [x] User Profile & Password Management

### Mobile App Features
- [x] Native Android/iOS App (Expo)
- [x] User Authentication & Registration
- [x] Book Library Browsing
- [x] Book Upload (PDF, EPUB, MOBI)
- [x] Book Download & Sharing
- [x] PDF Viewing
- [x] User Profile & Password Management
- [x] Cross-platform (Android & iOS)

---

## 🚀 Quick Commands Reference

### Running All Services
```powershell
# Terminal 1 - Backend Server
cd server
.venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Celery Worker
cd server
.venv\Scripts\activate
celery -A src.celery.celery_tasks worker --loglevel=info --pool=solo

# Terminal 3 - Web Client
cd client
npm run dev

# Terminal 4 - Mobile App (Optional)
cd mobile-blurz
npx expo start
```

### Mobile App Commands
```powershell
# Development
npx expo start                              # Start dev server
npx expo start --tunnel                     # Use tunnel for remote access
npx expo start --clear                      # Clear cache and start

# Production Builds
npm install -g eas-cli                      # Install EAS CLI
eas login                                   # Login to Expo
eas build:configure                         # Configure builds
npx eas build --platform android            # Build Android APK
npx eas build --platform ios                # Build iOS IPA
npx eas build --platform all                # Build both platforms
npx eas build --platform android --profile preview  # Quick preview build
```

### Useful Development Commands
```powershell
# Check running services
# Server: http://localhost:8000/docs (API Documentation)
# Web Client: http://localhost:5173
# Mobile: Scan QR code with Expo Go app

# Clear caches when facing issues
cd mobile-blurz
npx expo start --clear

# Update dependencies
cd mobile-blurz
npm install
npx expo install --check
```

