@echo off
echo ===================================================
echo   Project Matrice - Démarrage Local (Windows)
echo ===================================================

echo.
echo [1/3] Lancement du Backend (FastAPI)...
:: /min lance la fenetre reduite dans la barre des taches
start "Backend - FastAPI" /min cmd /k "call .venv\Scripts\activate & cd backend & uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo [2/3] Lancement du Backend (Django)...
:: /min lance la fenetre reduite dans la barre des taches
start "Backend - Django" /min cmd /k "call .venv\Scripts\activate & cd backend\django & python manage.py runserver 0.0.0.0:8001"

echo.
echo [3/3] Lancement du Frontend (Vite)...
:: /min lance la fenetre reduite dans la barre des taches
start "Frontend - Vite" /min cmd /k "cd frontend & npm run dev"

echo.
echo ===================================================
echo   Services lances en ARRIERE-PLAN (reduits).
echo   - Backend : http://localhost:8000/api/hello
echo   - Backend Django: http://localhost:8001/admin/
echo   - Frontend: http://localhost:5173
echo.
echo   NOTE: Les fenetres sont reduites dans la barre des taches.
echo         Fermez-les manuellement pour arreter les serveurs.
echo ===================================================
@REM pause
