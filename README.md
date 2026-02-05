# 📚 Blurz Book System

A full-stack book management web application built with a FastAPI server and React client. This system demonstrates modern web architecture including Authentication, Database management, Background tasks (Celery/Redis), and Email services.

---

## 🏗️ Architecture

- **Backend:** FastAPI (Python)
- **Frontend:** React + Vite (JavaScript/TypeScript)
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

## 📂 Project Structure

```
blurz book system
├── client/              # React Frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
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

- [x] User Authentication (JWT)
- [x] Email Verification & Password Reset
- [x] Book Management (CRUD)
- [x] E-book Upload/Download (PDF, EPUB, MOBI)
- [x] Background Email Sending (Celery)
- [x] Reactive UI (React + Tailwind)
