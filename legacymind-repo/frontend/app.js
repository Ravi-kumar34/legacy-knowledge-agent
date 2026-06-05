// Frontend Silo (Hour 1-12)
// Toggle this variable to true during the Hour 12 "Wire-Up" Sync
const isIntegrated = false; 

async function sendQuery() {
    const input = document.getElementById("query-input");
    const query = input.value.trim();
    if (!query) return;

    addMessage(query, "user");
    input.value = "";
    
    // Show loading spinner
    const loadingId = addMessage("Analyzing Hindsight Database...", "loading");

    if (!isIntegrated) {
        // Teammate 3 Silo Work: Hardcoded mock response based on API Contract
        setTimeout(() => {
            removeMessage(loadingId);
            const mockResponse = {
                "status": "success",
                "agent_response": "🧠 **Legacy Memory Retrieved:**\n* **Date:** May 10th\n* **Original Owner:** Rahul\n* **Historical Context:** We encountered a Database Error 405 because the connection limit was reached.\n* **Actionable Takeaway:** Fixed it by clearing the Redis cache to drop zombie sessions.",
                "tools_used": ["search_hindsight"]
            };
            addMessage(mockResponse.agent_response, "agent");
        }, 1000);
    } else {
        // Hour 12: Integrated API Call to Teammate 1's Backend
        try {
            document.getElementById("conn-status").textContent = "Integrated (Live Backend)";
            document.getElementById("conn-status").style.color = "#03dac6";

            const response = await fetch("http://localhost:8000/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_query: query })
            });
            const data = await response.json();
            
            removeMessage(loadingId);
            
            if (data.status === "success") {
                addMessage(data.agent_response, "agent");
            } else {
                addMessage("Error: Agent returned a failure status.", "agent");
            }
        } catch (err) {
            removeMessage(loadingId);
            addMessage("Network Error: Could not reach backend. Is FastAPI running on port 8000?", "agent");
        }
    }
}

function addMessage(text, className) {
    const chatBox = document.getElementById("chat-box");
    const div = document.createElement("div");
    const id = "msg-" + Date.now();
    div.id = id;
    div.className = "message " + className;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
