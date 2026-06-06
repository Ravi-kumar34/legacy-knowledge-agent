import json
import os
import asyncio
from fastapi import APIRouter, HTTPException
from groq import AsyncGroq
from hindsight_client import Hindsight
from pydantic import BaseModel
from typing import List

router = APIRouter()

groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
hindsight_client = Hindsight(
    base_url=os.getenv("HINDSIGHT_ENDPOINT", "https://api.hindsight.vectorize.io"),
    api_key=os.getenv("HINDSIGHT_API_KEY"),
)

MOCK_DB_PATH = "mock_vector_db.json"
BANK_ID = "legacymind"
MAX_CONTEXT_CHARS = 8000


class QueryRequest(BaseModel):
    user_query: str


class QueryResponse(BaseModel):
    status: str
    agent_response: str
    tools_used: List[str]


def _reflect_sync(query: str) -> str:
    """Blocking SDK call — must be run in a thread, not the event loop."""
    return str(hindsight_client.reflect(bank_id=BANK_ID, query=query))


def _mock_fallback() -> str:
    local_context = "Document 1: On May 10th, Rahul resolved Database Error 405.\n"
    if os.path.exists(MOCK_DB_PATH):
        with open(MOCK_DB_PATH) as f:
            for item in json.load(f):
                local_context += f"Document: {item['content']}\n"
    return local_context


async def search_hindsight(query: str) -> str:
    loop = asyncio.get_event_loop()
    try:
        # Offload the blocking SDK call to a thread pool
        return await loop.run_in_executor(None, _reflect_sync, query)
    except Exception as e:
        print(f"Hindsight reflect failed: {e}. Falling back to mock data.")
        return _mock_fallback()


@router.post("", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    context = await search_hindsight(request.user_query)
    system_prompt = f"You are LegacyMind AI. Use this context:\n{context[:MAX_CONTEXT_CHARS]}"

    try:
        chat_completion = await groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.user_query},
            ],
            model="llama-3.1-8b-instant",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq inference failed: {e}")

    return QueryResponse(
        status="success",
        agent_response=chat_completion.choices[0].message.content,
        tools_used=["hindsight_sdk"],
    )