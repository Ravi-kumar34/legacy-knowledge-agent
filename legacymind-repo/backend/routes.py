import sys
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

# Note: Hour 12 Integration - Uncomment these lines to connect to Agent Core (Teammate 2)
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'agent_core')))
# from agent import get_agent

router = APIRouter()

# --- THE API CONTRACT ---
class QueryRequest(BaseModel):
    user_query: str

class QueryResponse(BaseModel):
    status: str
    agent_response: str
    tools_used: List[str]
# ------------------------

@router.post("/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    # Hour 1-12: Mock Response implementation (Teammate 1 Silo)
    return QueryResponse(
        status="success",
        agent_response="Rahul fixed this on May 10th by clearing the Redis cache.",
        tools_used=["search_hindsight"]
    )
