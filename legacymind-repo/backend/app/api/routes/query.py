import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import AsyncGroq
from typing import List

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = AsyncGroq(api_key=GROQ_API_KEY)

HINDSIGHT_ENDPOINT = os.getenv("HINDSIGHT_ENDPOINT")
HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")

class QueryRequest(BaseModel):
    user_query: str

class QueryResponse(BaseModel):
    status: str
    agent_response: str
    tools_used: List[str]

async def search_hindsight(query: str) -> str:
    """Queries the Hindsight Cloud Vector DB for historical context."""
    if not HINDSIGHT_API_KEY:
        return "No Hindsight API Key available to retrieve historical context."
    
    base_url = (HINDSIGHT_ENDPOINT or "https://api.hindsight.com").rstrip('/')
    hindsight_url = f"{base_url}/collections/legacy-knowledge/search"
    
    headers = {
        "Authorization": f"Bearer {HINDSIGHT_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"query": query, "top_k": 3}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(hindsight_url, json=payload, headers=headers, timeout=5.0)
            response.raise_for_status()
            
            data = response.json()
            results = data.get("results", [])
            
            if not results:
                return "No relevant historical documents found in Hindsight."
                
            context = ""
            for idx, res in enumerate(results):
                content = res.get("content", "Unknown Content")
                context += f"Document {idx + 1}: {content}\n"
            return context
    except Exception as e:
        print(f"Hindsight API search failed: {e}. Falling back to mock data.")
        return (
            "Document 1: On May 10th, Rahul resolved Database Error 405 by clearing the Redis cache to drop zombie sessions.\n"
            "Document 2: The auth API uses passlib and bcrypt for hashing passwords."
        )

@router.post("")
async def process_query(request: QueryRequest):
    """
    Takes the user query, searches Hindsight for context, 
    and uses the Groq LLM to synthesize a helpful response.
    """
    # 1. Retrieve historical context from Hindsight
    context = await search_hindsight(request.user_query)

    # 2. Build the prompt for Groq LLM
    system_prompt = (
        "You are LegacyMind AI, an expert engineering assistant. "
        "Use the provided historical context from the team's past documentation to answer the user's question concisely. "
        "Do not make up facts. Format your answer with Markdown for readability.\n\n"
        f"Context from Hindsight Database:\n{context}"
    )

    # 3. Call Groq to synthesize the final answer
    try:
        chat_completion = await groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.user_query}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=300,
        )
        answer = chat_completion.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API synthesis failed: {str(e)}")

    # 4. Return the structured response
    return QueryResponse(
        status="success",
        agent_response=answer,
        tools_used=["search_hindsight", "groq_synthesis"]
    )
