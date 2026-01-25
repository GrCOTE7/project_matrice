@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===================================================
echo   Project Matrice - Démarrage Local (Windows)
echo ===================================================

echo.
echo [0/4] Vérification de l'environnement...
if not exist "%~dp0.venv\Scripts\python.exe" (
    echo.
    echo [ERREUR] Environnement virtuel introuvable.
    echo Lancez d'abord setup.bat pour l'installer.
    exit /b 1
)

"%~dp0.venv\Scripts\python.exe" -c "import jwt" >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERREUR] Dépendances manquantes - PyJWT.
    echo Lancez setup.bat pour installer les requirements.
    exit /b 1
)

echo.
echo [1/4] Nettoyage des services existants...
call stop.bat

:: Vérification des ports
"%~dp0.venv\Scripts\python.exe" "%~dp0tests\check_ports.py"
if errorlevel 1 goto ports_in_use
goto ports_free

:ports_in_use
echo.
echo ===================================================
echo.
echo   ⚠️  ATTENTION : Des services semblent déjà actifs
echo.
echo   Arrêt automatique des services existants puis redémarrage.
echo.
echo ===================================================
echo.
echo [*] Arrêt des services existants...
call stop.bat
timeout /t 2 /nobreak >nul
goto start_services

:ports_free
call .venv\Scripts\activate
goto start_services

:start_services

echo.
echo [2/4] Lancement du Backend (FastAPI)...
:: /min lance la fenetre reduite dans la barre des taches
start "Backend - FastAPI" /min cmd /c "call .venv\Scripts\activate & cd backend & uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo [3/4] Lancement du Backend (Django)...
:: /min lance la fenetre reduite dans la barre des taches
start "Backend - Django" /min cmd /c "call .venv\Scripts\activate & cd backend\django & python manage.py runserver 0.0.0.0:8001"

echo.
echo [4/4] Lancement du Frontend (Vite)...
:: /min lance la fenetre reduite dans la barre des taches
start "Frontend - Vite" /min cmd /c "cd frontend & npm run dev"

echo.
    echo ================================================
    echo   Services lances en ARRIERE-PLAN (reduits).
    echo   - Backend FastAPI: http://localhost:8000/api/hello
    echo   - Backend Django: http://localhost:8001/admin/
    echo   - Frontend: http://localhost:5173
    echo ================================================

echo.
echo [5/5] Attente du demarrage des services (7")...
timeout /t 7 /nobreak >nul

echo.
echo [*] Execution des Health Checks...
call .venv\Scripts\activate
python tests/test_health.py

if errorlevel 1 (
    echo.
    echo ===================================================
    echo.
    echo   *** ALERTE: CERTAINS SERVICES NE RÉPONDENT PAS ***
    echo.
    echo     Vérifiez les fenêtres réduites dans la barre
    echo     des tâches pour voir les erreurs éventuelles.
    echo.
    echo ===================================================
    timeout /t 10 /nobreak >nul
) else (
    echo.
    echo ============================================================
    echo   Tous les SERVICES sont OPÉRATIONNELS!
    echo   NOTE: Les fenêtres sont réduites dans la barre des tâches.
    echo         Fermez-les manuellement pour arrêter les serveurs.
    echo ============================================================
)
@REM pause
