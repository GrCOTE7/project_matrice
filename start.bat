@echo off
chcp 65001 >nul
echo ===================================================
echo   Project Matrice - Démarrage Local (Windows)
echo ===================================================

echo.
echo [0/3] Nettoyage des services existants...
call stop.bat

:: Vérification des ports
.venv\Scripts\python.exe tests/check_ports.py
if errorlevel 1 goto ports_in_use
goto ports_free

:ports_in_use
echo.
echo ===================================================
echo.
echo   ⚠️  ATTENTION : Des services semblent déjà actifs
echo.
echo   Que souhaitez-vous faire ?
echo   1. Arrêter les services existants et redémarrer
echo   2. Annuler (laisser les services actuels)
echo.
echo ===================================================
echo.
choice /C 12 /N /M "Votre choix (1 ou 2) : "

if errorlevel 2 (
    echo.
    echo Opération annulée. Services actuels conservés.
    pause
    exit /b 0
)

if errorlevel 1 (
    echo.
    echo [*] Arrêt des services existants...
    call stop.bat
    timeout /t 2 /nobreak >nul
    goto start_services
)

:ports_free
call .venv\Scripts\activate
goto start_services

:start_services

echo.
echo [1/3] Lancement du Backend (FastAPI)...
:: /min lance la fenetre reduite dans la barre des taches
start "Backend - FastAPI" /min cmd /c "call .venv\Scripts\activate & cd backend & uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo [2/3] Lancement du Backend (Django)...
:: /min lance la fenetre reduite dans la barre des taches
start "Backend - Django" /min cmd /c "call .venv\Scripts\activate & cd backend\django & python manage.py runserver 0.0.0.0:8001"

echo.
echo [3/3] Lancement du Frontend (Vite)...
:: /min lance la fenetre reduite dans la barre des taches
start "Frontend - Vite" /min cmd /c "cd frontend & npm run dev"

echo.
echo ===================================================
echo   Services lances en ARRIERE-PLAN (reduits).
echo   - Backend FastAPI: http://localhost:8000/api/hello
echo   - Backend Django: http://localhost:8001/admin/
echo   - Frontend: http://localhost:5173
echo ===================================================

echo.
echo [4/4] Attente du demarrage des services (7")...
timeout /t 7 /nobreak >nul

echo.
echo [*] Execution des Health Checks...
call .venv\Scripts\activate
python tests/test_health.py

if errorlevel 1 (
    echo.
    echo ===================================================
    echo.
    echo   *** ALERTE: CERTAINS SERVICES NE REPONDENT PAS ***
    echo.
    echo   Verifiez les fenetres reduites dans la barre
    echo   des taches pour voir les erreurs eventuelles.
    echo.
    echo ===================================================
    pause
) else (
    echo.
    echo ===================================================
    echo   Tous les services sont operationnels!
    echo   NOTE: Les fenetres sont reduites dans la barre des taches.
    echo         Fermez-les manuellement pour arreter les serveurs.
    echo ===================================================
)
@REM pause
