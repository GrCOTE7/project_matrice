from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import uuid
import logging
import jwt
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


@app.middleware("http")
async def jwt_middleware(request: Request, call_next):
    path = request.url.path

    if not path.startswith("/api") or path.startswith("/api/health"):
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse({"detail": "Missing Bearer token"}, status_code=401)

    token = auth_header.replace("Bearer ", "", 1).strip()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
        )
    except jwt.ExpiredSignatureError:
        return JSONResponse({"detail": "Token expired"}, status_code=401)
    except jwt.InvalidTokenError:
        return JSONResponse({"detail": "Invalid token"}, status_code=401)

    if payload.get("type") != "access":
        return JSONResponse({"detail": "Invalid token type"}, status_code=401)

    request.state.user = payload
    return await call_next(request)

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
def hello(request: Request):
    user = getattr(request.state, "user", {})
    return {
        "message": "Hello from FastAPI!",
        "environment": settings.ENV,
        "user_id": user.get("user_id"),
        "username": user.get("username"),
    }


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
