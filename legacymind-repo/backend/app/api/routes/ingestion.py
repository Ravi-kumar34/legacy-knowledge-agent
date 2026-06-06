import json
import os
import asyncio
from fastapi import APIRouter, HTTPException
from groq import AsyncGroq
from hindsight_client import Hindsight
from pydantic import BaseModel

router = APIRouter()

groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
hindsight_client = Hindsight(
    base_url=os.getenv("HINDSIGHT_ENDPOINT", "https://api.hindsight.vectorize.io"),
    api_key=os.getenv("HINDSIGHT_API_KEY"),
)

MOCK_DB_PATH = "mock_vector_db.json"
BANK_ID = "legacymind"


class RawDataPayload(BaseModel):
    raw_text: str
    source_type: str


def _retain_sync(content: str) -> None:
    """Blocking SDK call — must be run in a thread, not the event loop."""
    hindsight_client.retain(bank_id=BANK_ID, content=content)


def _mock_store(content: str, source: str) -> None:
    data = []
    if os.path.exists(MOCK_DB_PATH):
        with open(MOCK_DB_PATH) as f:
            data = json.load(f)
    data.append({"content": content, "source": source})
    with open(MOCK_DB_PATH, "w") as f:
        json.dump(data, f)


async def store_in_hindsight(content: str, source: str) -> dict:
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, _retain_sync, content)
        return {"status": "success"}
    except Exception as e:
        print(f"Hindsight retain failed: {e}. Falling back to local mock.")
        _mock_store(content, source)
        return {"status": "success", "mock_storage": True}


@router.post("/teach/transform")
async def manual_ingestion_pipeline(payload: RawDataPayload):
    try:
        chat_completion = await groq_client.chat.completions.create(
            messages=[{"role": "user", "content": f"Summarize: {payload.raw_text}"}],
            model="llama-3.1-8b-instant",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq summarization failed: {e}")

    cleaned_text = chat_completion.choices[0].message.content.strip()
    await store_in_hindsight(content=cleaned_text, source=payload.source_type)
    return {"status": "success", "transformed_text": cleaned_text}