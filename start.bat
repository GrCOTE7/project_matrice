@echo off
echo ===================================================
echo   Project Matrice - Démarrage Local (Windows)
echo ===================================================

echo.
echo [1/2] Lancement du Backend (FastAPI)...
:: /min lance la fenetre reduite dans la barre des taches
start "Backend - FastAPI" /min cmd /k "call .venv\Scripts\activate & cd backend & uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo [2/2] Lancement du Frontend (Vite)...
:: /min lance la fenetre reduite dans la barre des taches
start "Frontend - Vite" /min cmd /k "cd frontend & npm run dev"

echo.
echo ===================================================
echo   Services lances en ARRIERE-PLAN (reduits).
echo   - Backend : http://localhost:8000/api/hello
echo   - Frontend: http://localhost:5173
echo.
echo   NOTE: Les fenetres sont reduites dans la barre des taches.
echo         Fermez-les manuellement pour arreter les serveurs.
echo ===================================================
@REM pause

@REM //2do récc .bat de fast api (+ complet)
