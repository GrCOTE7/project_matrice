@echo off
REM Démarre les services Docker (dev) avec build
docker compose -f docker-compose.dev.yml up --build -d
