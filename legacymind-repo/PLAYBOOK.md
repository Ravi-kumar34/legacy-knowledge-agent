# LegacyMind AI: Team Playbook
**24-Hour Hackathon: Remote Collaboration & Git Protocol**

To survive a 24-hour hackathon working remotely, we must avoid "integration hell." This document outlines our strict contract-driven development strategy to ensure nobody is blocked and our Git merges are flawless.

## 1. The "API Contract" (Do this in Hour 1)
Before anyone writes a single line of code, we must agree on exactly how data will look when it moves between our three pieces. This is our "Contract."

**Frontend sends this to Backend:**
```json
{
  "user_query": "How do I fix Database Error 405?"
}
```

**Backend (after consulting Agent) sends this back to Frontend:**
```json
{
  "status": "success",
  "agent_response": "Rahul fixed this on May 10th by clearing the Redis cache.",
  "tools_used": ["search_hindsight"]
}
```

## 2. Working in "Silos" with Mock Data
Once we agree on the JSON contract above, we disconnect and work in parallel:

*   **Teammate 3 (Frontend):** You don't need the backend to be finished. Hardcode the exact "success" JSON response into your UI. Build the entire chat interface, the loading spinners, and the styling using fake data.
*   **Teammate 1 (Backend):** You don't need the Antigravity Agent to be finished. Write a FastAPI route that receives the user_query and instantly returns a fake, hardcoded agent_response.
*   **Teammate 2 (Agent):** You don't need the FastAPI server or the UI. Write your Antigravity Python code to run in the terminal. Pass a text string in, and print the response out.

## 3. Folder Structure (Avoiding Git Merge Conflicts)
Merge conflicts happen when two people edit the same file. To avoid this, our GitHub repository will have strictly separated folders. **Nobody is allowed to touch a folder they do not own.**

```
/legacymind-repo
│
├── /backend (Teammate 1 ONLY)
│   ├── main.py
│   └── routes.py
│
├── /agent_core (Teammate 2 ONLY)
│   ├── agent.py
│   ├── hindsight_tools.py
│   └── skills/
│
└── /frontend (Teammate 3 ONLY)
    ├── index.html
    ├── styles.css
    └── app.js
```

## 4. The Integration Schedule
Do not wait until Hour 23 to connect the parts. We will have two major "Integration Syncs" on Discord/Meet:

*   **Hour 12 (The Wire-Up):** Everyone stops coding features. Teammate 1 imports Teammate 2's Agent function into the FastAPI route. Teammate 3 points their frontend to Teammate 1's local server instead of using mock data. **Goal: Make a real message travel from the UI, to the server, to the Agent, to Hindsight, and back to the UI.**
*   **Hour 18 (The Polish):** The system should be fully connected. We spend the remaining time fixing bugs, styling the UI, and recording our demo video.

🎙️ **Remote Work Comms Rule (Discord/Meet)**
Since we are fully remote, stay in the voice channel but stay muted while coding. If you need to change the API Contract (e.g., adding a new field to the JSON), you MUST unmute and get verbal confirmation from the other two teammates before committing the change.
