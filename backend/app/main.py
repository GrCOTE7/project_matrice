from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import uuid
import logging
from .config import settings

# Configuration du logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Project Matrice - FastAPI Backend",
    description="Services critiques et performants",
    version="1.0.0",
    docs_url="/docs" if settings.is_dev else None,  # Docs uniquement en dev
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ID unique du serveur - change à chaque redémarrage (crucial pour le hot-reload)
server_id = str(uuid.uuid4())
logger.info(f"Serveur démarré avec ID: {server_id}")

# Liste des connexions actives pour le WebSocket
active_connections: list[WebSocket] = []


@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI!", "environment": settings.ENV}


@app.get("/api/health")
def health_check():
    """Endpoint de santé pour monitoring."""
    return {"status": "healthy", "environment": settings.ENV, "server_id": server_id}


@app.websocket("/ws/reload")
async def websocket_reload(websocket: WebSocket):
    """WebSocket pour notifier les clients du redémarrage du serveur"""
    await websocket.accept()
    active_connections.append(websocket)
    try:
        # Envoyer l'ID actuel dès la connexion
        await websocket.send_json({"type": "connected", "server_id": server_id})

        # Maintenir la connexion avec un heartbeat (5s)
        while True:
            await asyncio.sleep(5)
            await websocket.send_json({"type": "heartbeat", "server_id": server_id})
    except (WebSocketDisconnect, Exception):
        if websocket in active_connections:
            active_connections.remove(websocket)
