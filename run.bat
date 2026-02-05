:: ==========================================
:: BLURZ BOOK SYSTEM - COMMAND CHEATSHEET
:: ==========================================

:: --- 1. SETUP & INSTALLATION ---
:: Create Virtual Environment (Server)
:: python -m venv .venv

:: Activate Virtual Environment
:: Windows CMD: .venv\Scripts\activate.bat
:: PowerShell:  .venv\Scripts\Activate.ps1
:: (If PowerShell fails: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser)

:: Install Dependencies
:: pip install -r requirements.txt

:: --- 2. RUNNING THE APPLICATION ---
:: Run Backend Server (FastAPI)
:: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

:: Run Frontend Client (React)
:: cd ../client
:: npm install
:: npm run dev

:: Run Celery Worker (Background Tasks)
:: celery -A src.celery.celery_tasks worker --loglevel=info --pool=solo

:: --- 3. DATABASE MIGRATIONS ---
:: Create a new migration revision
:: alembic revision --autogenerate -m "describe changes here"

:: Apply migrations to DB
:: alembic upgrade head

:: --- 4. TESTING ---
:: Run backend tests
:: pytest

:: --- 5. INFRASTRUCTURE LINKS ---
:: Redis (Required for Celery):
:: https://github.com/microsoftarchive/redis/releases
:: (Ensure running on port 6379)

:: PostgreSQL (Required for DB):
:: https://www.postgresql.org/download/
:: (Ensure running on port 5432)

