import asyncio
import os
from google_antigravity import Agent, LocalAgentConfig
from dotenv import load_dotenv
from hindsight_tools import search_hindsight

load_dotenv()

def get_agent() -> Agent:
    api_key = os.getenv("ANTIGRAVITY_API_KEY", "dummy_key")
    
    config = LocalAgentConfig(
        model="gemini-3.1-pro",
        api_key=api_key,
    )
    
    system_prompt = """You are LegacyMind AI, the Chief Company Historian and Institutional Memory Agent. Your primary directive is to eliminate corporate knowledge loss by retrieving undocumented decisions, past incident reports, and historical context from the Hindsight Memory Database.

CRITICAL RULES:
1. THE HINDSIGHT RULE: You MUST use the `search_hindsight` tool before answering any question related to internal architecture, past incidents, infrastructure, or company decisions. 
2. THE HONESTY RULE: If Hindsight returns no relevant data, you MUST say: "No relevant internal memory found." Do not hallucinate company history.
3. THE EXPERTISE RULE: Always credit the original engineer or project manager who made the decision or solved the bug if their name is in the memory.

RESPONSE FORMATTING (The "Wow" Protocol):
🧠 **Legacy Memory Retrieved:**
* **Date:** [Month/Year of the event]
* **Original Owner:** [Name of the engineer/PM]
* **Historical Context:** [Explain exactly what happened or why the decision was made]
* **Actionable Takeaway:** [Explain how this applies to the user's current question or error]
"""

    agent = Agent(
        config=config,
        tools=[search_hindsight],
        system_prompt=system_prompt
    )
    return agent

# Hour 1-12: Terminal Runner for Teammate 2 Silo Work
async def run_terminal():
    agent = get_agent()
    print("🤖 LegacyMind Agent Core initializing...")
    print("Run queries here before Hour 12 integration with Backend.")
    while True:
        query = input("\nUser Query (type 'exit' to quit): ")
        if query.lower() in ['quit', 'exit']:
            break
        try:
            response = await agent.generate(query)
            print(f"\n[Agent Response]\n{response.content}")
        except Exception as e:
            print(f"\n[Error] Unable to run agent. Ensure antigravity SDK is installed.\nDetails: {e}")

if __name__ == "__main__":
    asyncio.run(run_terminal())
