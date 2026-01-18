from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
import uuid

app = FastAPI()

# ID unique du serveur - change à chaque redémarrage (crucial pour le hot-reload)
server_id = str(uuid.uuid4())

# Liste des connexions actives pour le WebSocket
active_connections: list[WebSocket] = []


@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI!"}


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
