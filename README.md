 
blurz book system
├─ client
│  ├─ .env
│  ├─ index.html
│  ├─ next-env.d.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ a.png
│  │  ├─ Accesories.png
│  │  ├─ android-chrome-192x192.png
│  │  ├─ android-chrome-512x512.png
│  │  ├─ apple-touch-icon.png
│  │  ├─ banner.svg
│  │  ├─ cabel-min - Copy.png
│  │  ├─ favicon-16x16.png
│  │  ├─ favicon-32x32.png
│  │  ├─ favicon.ico
│  │  ├─ harddisk-min.png
│  │  ├─ keyboard.png
│  │  ├─ laptop.png
│  │  ├─ mouse.png
│  │  ├─ site.webmanifest
│  │  ├─ Speaker.png
│  │  └─ vite.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.jsx
│  │  ├─ components
│  │  │  ├─ BookCard.jsx
│  │  │  ├─ Header.jsx
│  │  │  └─ ProtectedRoute.jsx
│  │  ├─ context
│  │  │  └─ AuthContext.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ AddBookPage.jsx
│  │  │  ├─ BookDetailPage.jsx
│  │  │  ├─ BooksPage.jsx
│  │  │  ├─ HomePage.jsx
│  │  │  ├─ LoginPage.jsx
│  │  │  ├─ MyBooksPage.jsx
│  │  │  └─ SignupPage.jsx
│  │  ├─ services
│  │  │  └─ api.js
│  │  └─ vite-env.d.ts
│  ├─ tailwind.config.js
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ desktop.ini
├─ README.md
└─ server
   ├─ .env
   ├─ .pytest_cache
   │  ├─ CACHEDIR.TAG
   │  ├─ README.md
   ├─ alembic.ini
   ├─ basic_components.txt
   ├─ build.txt
   ├─ first lesson.txt
   ├─ main.py
   ├─ migrations
   │  ├─ env.py
   │  ├─ README
   │  ├─ script.py.mako
   ├─ notes
   │  ├─ functions.py
   │  ├─ middleware.py
   │  ├─ relational_DB.txt
   │  └─ tests.py
   ├─ pip
   ├─ README.md
   ├─ requirement.txt
   ├─ run.bat
   ├─ src
   │  ├─ auth
   │  │  ├─ dependencies.py
   │  │  ├─ routes.py
   │  │  ├─ schema.py
   │  │  ├─ service.py
   │  │  ├─ utils.py
   │  │  ├─ __init__.py
   │  ├─ book
   │  │  ├─ books_db.py
   │  │  ├─ routes.py
   │  │  ├─ schema.py
   │  │  ├─ service.py
   │  ├─ celery
   │  │  ├─ celery_config.py
   │  │  ├─ celery_tasks.py
   │  │  └─ __pycache__
   │  │     ├─ celery_config.cpython-312.pyc
   │  │     └─ celery_tasks.cpython-312.pyc
   │  ├─ db
   │  │  ├─ config.py
   │  │  ├─ main.py
   │  │  ├─ models.py
   │  │  ├─ redis.py
   │  │  ├─ __init__.py
   │  ├─ err.py
   │  ├─ errors.py
   │  ├─ mailserver
   │  │  ├─ routes.py
   │  │  ├─ schema.py
   │  │  ├─ service.py
   │  │  ├─ templates
   │  │  │  ├─ k
   │  │  │  ├─ password_reset_link.html
   │  │  │  ├─ verify_message.html
   │  │  │  └─ welcome.html
   │  ├─ middleware.py
   │  ├─ reviews
   │  │  ├─ routes.py
   │  │  ├─ schema.py
   │  │  ├─ service.py
   │  │  ├─ __init__.py
   │  ├─ tests
   │  │  ├─ conftest.py
   │  │  ├─ test_auth.py
   │  │  ├─ __init__.py


this is the stucture of my book web app , this app is intended to show you how muliple services work togother like auth , DB engine ,
celery (background processing), fastapi , email service and other services during the merge or updating the DB like aulumbic 



Instructions for running this app (notice this instructuions for windows) ::
server , DB , celery and env variables ::

first server :: 
1:go to the server folder by commmand line or powershell: cd server
2:you must have installed python v12 then create and activate python environment to isolate the packages from in the machine by: python -m venv .venv
then actiavte by :.venv\Scripts\activate.bat
3:installing depedencies by : pip install -r requirements.txt
4:the final step for server running is uvicorn main:app --reload

second DB
1: you have to install postgresql then 



