import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.services.database import get_db
# Placeholder for Vinay's AI logic
from app.services.agent_service import generate_ai_response 

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id: str,
    # In production, pass the JWT token here to authenticate the WebSocket
    token: str = Query(None) 
):
    await manager.connect(websocket)
    try:
        # 1. Send a welcome message to confirm connection
        await manager.send_personal_message(
            json.dumps({"type": "system", "content": "Connected to LegacyMind AI."}), 
            websocket
        )
        
        while True:
            # 2. Receive the prompt from Sameer's frontend
            data = await websocket.receive_text()
            message_payload = json.loads(data)
            user_prompt = message_payload.get("prompt")
            
            # 3. Pass the prompt to Vinay's Agent logic
            # (Assuming Vinay's function returns an async generator yielding tokens)
            async for token in generate_ai_response(user_prompt, client_id):
                # 4. Stream the chunks back to the React UI in real-time
                await manager.send_personal_message(
                    json.dumps({"type": "stream", "content": token}), 
                    websocket
                )
            
            # 5. Signal that the AI has finished generating
            await manager.send_personal_message(
                json.dumps({"type": "done"}), 
                websocket
            )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)