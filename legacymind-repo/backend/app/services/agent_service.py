import asyncio

async def generate_ai_response(prompt: str, session_id: str):
    """
    MOCK SERVICE: This simulates Vinay's AI Agent streaming a response.
    Vinay will eventually overwrite this file with his google-antigravity SDK logic.
    """
    mock_response = f"I am the LegacyMind AI. You asked about: '{prompt}'. This is a simulated response while the agent layer is being built."
    
    # Simulate streaming token by token
    words = mock_response.split(" ")
    for word in words:
        yield word + " "
        await asyncio.sleep(0.1) # Simulate network/processing delay