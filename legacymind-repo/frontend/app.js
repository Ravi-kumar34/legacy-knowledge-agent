// LegacyMind AI - Enterprise Frontend Controller
// Toggle this variable to true to enable live backend integration
const isIntegrated = true;

// Application States
let isQueryRunning = false;
let activeRole = 'employee'; // employee | admin
let isContributorVerified = false; // Tracks inline verification status
let currentMainView = 'search'; // search | add
let totalMemories = 12482;

// Local Submissions Queue
let pendingSubmissions = [];

// Primary Mock Database for Hindsight Queries
const mockDatabase = {
    'investigate payment-service': {
        sources: [
            '✓ Incident #483',
            '✓ Expert Note by Rahul',
            '✓ Historical Resolution Record',
            '✓ Architecture Decision Record (ADR #14)'
        ],
        confidence: '94%',
        timelineText: `Jan 2024 -> Latency warning detected
Feb 2024 -> Queue latency spike
Mar 2024 -> Connection pool exhaustion
Apr 2024 -> Technical debt fix deferred
Jun 2024 -> Major outage incident`,
        timelineNodes: [
            { date: 'JAN 2024', text: 'Latency warning detected', type: 'warning' },
            { date: 'MAR 2024', text: 'Connection pool exhaustion', type: 'error' },
            { date: 'APR 2024', text: 'Technical debt fix deferred by leadership', type: 'warning' },
            { date: 'JUN 2024', text: 'Major outage incident on checkout service', type: 'error' }
        ],
        answer: `The payment-service outages stem from a deferred remediation plan in April 2024. The circuit-breaker threshold was set too low under peak load, causing cascade failures when database connections timed out. 

Expert Owner: Rahul (Lead Platform)
Remediation Recommendation: Optimize connection pool limits and bump circuit breaker cooldown window to 15s.`
    },
    'recall incident-483': {
        sources: [
            '✓ Incident #483',
            '✓ Expert Note by Rahul',
            '✓ Historical Post-Mortem Report'
        ],
        confidence: '98%',
        timelineText: `Oct 2023 -> Incident #483 occurred
Oct 2023 -> RCA session published
Nov 2023 -> Threshold alerting scripts deployed`,
        timelineNodes: [
            { date: 'OCT 2023', text: 'Incident #483: checkout outage lasting 45 minutes', type: 'error' },
            { date: 'OCT 2023', text: 'RCA Published: Circuit breaker threshold mismatch detailed', type: 'success' },
            { date: 'NOV 2023', text: 'Action Item: Automated threshold alerting scripts deployed', type: 'success' }
        ],
        answer: `Incident #483 occurred due to circuit breaker misconfiguration. During peak traffic, checkout connection limit was hit, triggering a false-positive trip on the payment gateway circuit breaker.

Action Taken: Resolved by Rahul by clearing the Redis cache to drop zombie sessions and bumping connection pooling max size to 150.`
    },
    'why was kafka rejected': {
        sources: [
            '✓ Architecture Decision Record (ADR #27)',
            '✓ Expert consultation notes by Priya'
        ],
        confidence: '92%',
        timelineText: `Dec 2023 -> Proposal to introduce Kafka
Jan 2024 -> Concern raised regarding ZooKeeper overhead
Feb 2024 -> Kafka rejected; RabbitMQ selected`,
        timelineNodes: [
            { date: 'DEC 2023', text: 'Proposal: Introduce Kafka for transaction logging', type: 'success' },
            { date: 'JAN 2024', text: 'Evaluation: Priya raised ZooKeeper overhead concerns', type: 'warning' },
            { date: 'FEB 2024', text: 'Decision: Kafka rejected; RabbitMQ selected', type: 'success' }
        ],
        answer: `Kafka was formally rejected in favor of RabbitMQ / Redis Streams for async processing.

Core Rejection Factors:
1. Operational Complexity: DevOps team lacked dedicated Kafka engineers to monitor cluster states.
2. Budget Constraints: Projected cluster sizing costs exceeded the allocation limit.
3. Latency Requirements: High throughput of Kafka was not required; sub-millisecond queuing latency of RabbitMQ was preferred.`
    },
    'show expert payment-service': {
        sources: [
            '✓ Git blame logs for payment-service/',
            '✓ Commit metadata index',
            '✓ Resolution reports for payment-service'
        ],
        confidence: '96%',
        timelineText: `Jun 2023 -> Initial codebase commit by Rahul
Oct 2023 -> Outage RCA-483 resolved by Rahul
May 2024 -> Database pooling refactoring by Priya`,
        timelineNodes: [
            { date: 'JUN 2023', text: 'Codebase initialized by Rahul', type: 'success' },
            { date: 'OCT 2023', text: 'Incident 483 resolved by Rahul', type: 'error' },
            { date: 'MAY 2024', text: 'Connection pool configuration committed by Priya', type: 'success' }
        ],
        answer: `Subject Matter Experts for payment-service:

Chief SME: Rahul (Lead SRE / Platform Engineer)
* Profile: Initial codebase architect, author of RCA-483.
* Contact: rahul@enterprise.com

Secondary SME: Priya (Lead Developer)
* Profile: Configured connection pooling and RabbitMQ integrations.
* Contact: priya@enterprise.com`
    }
};

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
    updateConnectionStatus();

    // Hook enter keys
    const queryInput = document.getElementById("query-input");
    if (queryInput) {
        queryInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendQuery();
            }
        });
    }

    const empPass = document.getElementById("emp-password");
    if (empPass) {
        empPass.addEventListener("keydown", (e) => {
            if (e.key === "Enter") attemptLogin('employee');
        });
    }

    const adminPass = document.getElementById("admin-password");
    if (adminPass) {
        adminPass.addEventListener("keydown", (e) => {
            if (e.key === "Enter") attemptLogin('admin');
        });
    }

    // Initialize stats on login view
    const loginStats = document.getElementById("login-memories-stat");
    if (loginStats) loginStats.textContent = totalMemories.toLocaleString();
});

// Update connection status label
function updateConnectionStatus() {
    const connStatus = document.getElementById("conn-status");
    if (!connStatus) return;

    if (isIntegrated) {
        connStatus.textContent = "ONLINE (INTEGRATED)";
        connStatus.parentNode.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
        connStatus.parentNode.style.borderColor = "rgba(16, 185, 129, 0.2)";
        connStatus.style.color = "var(--accent-green)";
    } else {
        connStatus.textContent = "ONLINE (DEMO MODE)";
        connStatus.parentNode.style.backgroundColor = "rgba(56, 189, 248, 0.08)";
        connStatus.parentNode.style.borderColor = "rgba(56, 189, 248, 0.2)";
        connStatus.style.color = "var(--accent-blue-light)";
        const dot = connStatus.parentNode.querySelector(".status-dot");
        if (dot) {
            dot.style.backgroundColor = "var(--accent-blue-light)";
            dot.style.boxShadow = "0 0 6px var(--accent-blue-light)";
        }
    }
}

// Show/Hide Administrative Access pop-up dialog
function showAdminModal(show) {
    const empCard = document.getElementById("employee-login-card");
    const adminModal = document.getElementById("admin-login-modal");

    // Clear passwords & errors
    document.getElementById("admin-password").value = "";
    const adminError = document.getElementById("admin-auth-error-msg");
    if (adminError) adminError.style.display = "none";

    if (show) {
        empCard.style.display = "none";
        adminModal.style.display = "block";
        document.getElementById("admin-id").focus();
    } else {
        adminModal.style.display = "none";
        empCard.style.display = "block";
        document.getElementById("emp-email").focus();
    }
}

// Perform client-side auth validation
function attemptLogin(role) {
    if (role === 'employee') {
        const email = document.getElementById("emp-email").value.trim();
        const pass = document.getElementById("emp-password").value;
        const errorBlock = document.getElementById("auth-error-msg");

        if (!email || !pass) {
            showAuthError("Email and Password are required.");
            return;
        }

        activeRole = 'employee';
        isContributorVerified = false; // Reset verification

        document.getElementById("session-role-badge").textContent = "EMPLOYEE";
        document.getElementById("auth-overlay").style.display = "none";
        document.getElementById("app-content").style.display = "flex";

        if (errorBlock) errorBlock.style.display = "none";
        switchMainView('search');

    } else if (role === 'admin') {
        const adminId = document.getElementById("admin-id").value.trim();
        const pass = document.getElementById("admin-password").value;
        const errorBlock = document.getElementById("admin-auth-error-msg");

        if (!adminId || !pass) {
            showAdminAuthError("Admin ID and Password are required.");
            return;
        }

        activeRole = 'admin';
        document.getElementById("auth-overlay").style.display = "none";
        document.getElementById("admin-dashboard").style.display = "flex";

        if (errorBlock) errorBlock.style.display = "none";
        updateAdminCounters();
        renderAdminQueue();
    }
}

function showAuthError(msg) {
    const errorBlock = document.getElementById("auth-error-msg");
    const errorText = document.getElementById("error-text");
    if (errorBlock && errorText) {
        errorText.textContent = msg;
        errorBlock.style.display = "flex";
    }
}

function showAdminAuthError(msg) {
    const errorBlock = document.getElementById("admin-auth-error-msg");
    const errorText = document.getElementById("admin-error-text");
    if (errorBlock && errorText) {
        errorText.textContent = msg;
        errorBlock.style.display = "flex";
    }
}

// Logout session
function logout() {
    activeRole = 'employee';
    isContributorVerified = false;

    document.getElementById("app-content").style.display = "none";
    document.getElementById("admin-dashboard").style.display = "none";

    // Reset passwords
    document.getElementById("emp-password").value = "";
    document.getElementById("admin-password").value = "";

    showAdminModal(false); // Return to default employee card
    document.getElementById("auth-overlay").style.display = "flex";
}

// Navigation switcher (Search vs Add Memory)
function switchMainView(view) {
    currentMainView = view;

    const btnSearch = document.getElementById("btn-nav-search");
    const btnAdd = document.getElementById("btn-nav-add");
    if (btnSearch && btnAdd) {
        btnSearch.classList.toggle("active", view === 'search');
        btnAdd.classList.toggle("active", view === 'add');
    }

    const searchView = document.getElementById("terminal-search-view");
    const ingestView = document.getElementById("terminal-ingest-view");
    const examplesPanel = document.getElementById("examples-nav-panel");

    if (view === 'search') {
        if (searchView) searchView.style.display = "flex";
        if (ingestView) ingestView.style.display = "none";
        if (examplesPanel) examplesPanel.style.display = "block";

        setTimeout(() => {
            const queryInput = document.getElementById("query-input");
            if (queryInput) queryInput.focus();
        }, 100);
    } else {
        if (searchView) searchView.style.display = "none";
        if (ingestView) ingestView.style.display = "flex";
        if (examplesPanel) examplesPanel.style.display = "none";

        setupIngestPortalState();
    }
}

// Set up Ingestion Portal inner view depending on session credentials
function setupIngestPortalState() {
    const authGate = document.getElementById("ingest-auth-gate");
    const submitForm = document.getElementById("ingest-submit-form");
    const feedbackLogs = document.getElementById("ingest-feedback-logs");

    // Clear Ingestion fields
    document.getElementById("ingest-emp-id").value = "EMP-Rahul";
    document.getElementById("ingest-password").value = "rahulsecrethash";
    document.getElementById("ingest-title").value = "Redis Cache Failure Resolution";
    document.getElementById("ingest-entry").value = "";
    document.getElementById("ingest-root-cause").value = "";
    document.getElementById("ingest-action").value = "";
    document.getElementById("ingest-auth-error").style.display = "none";

    if (isContributorVerified) {
        authGate.style.display = "none";
        submitForm.style.display = "block";
        feedbackLogs.style.display = "none";
    } else {
        authGate.style.display = "block";
        submitForm.style.display = "none";
        feedbackLogs.style.display = "none";
    }
}

// Ingestion gate credentials verification (Inline authorization)
function authenticateIngest() {
    const empId = document.getElementById("ingest-emp-id").value.trim();
    const pass = document.getElementById("ingest-password").value;
    const errorBlock = document.getElementById("ingest-auth-error");

    if (empId === "EMP-Rahul" && pass === "rahulsecrethash") {
        // Mark as verified contributor for this session
        isContributorVerified = true;
        document.getElementById("session-role-badge").textContent = "CONTRIBUTOR (VERIFIED)";

        document.getElementById("ingest-auth-gate").style.display = "none";
        document.getElementById("ingest-submit-form").style.display = "block";
        if (errorBlock) errorBlock.style.display = "none";
    } else {
        if (errorBlock) errorBlock.style.display = "block";
    }
}

// Form Submission workflow
async function submitToMemoryEngine() {
    const title = document.getElementById("ingest-title").value.trim();
    const entry = document.getElementById("ingest-entry").value.trim();
    const root = document.getElementById("ingest-root-cause").value.trim();
    const action = document.getElementById("ingest-action").value.trim();

    if (!title || !entry || !root || !action) {
        alert("All fields (Title, Entry, Root Cause, Recommendation) are required.");
        return;
    }

    // Hide form, show logs
    document.getElementById("ingest-submit-form").style.display = "none";
    const feedbackBox = document.getElementById("ingest-feedback-logs");
    feedbackBox.style.display = "block";

    const listContainer = document.getElementById("feedback-checklist-container");
    listContainer.innerHTML = "";
    document.getElementById("feedback-success-actions").style.display = "none";

    const feedbackLines = [
        '[✓] Identity Verified',
        '[✓] Contributor Permissions Confirmed',
        '[✓] Compiling Payload & Requesting Transform...',
        '[✓] Memory Successfully Indexed in Hindsight'
    ];

    let currentLog = 0;

    // Animate first 3 steps
    for (let i = 0; i < 3; i++) {
        const line = document.createElement("div");
        line.className = "feedback-line";
        line.textContent = feedbackLines[i];
        listContainer.appendChild(line);

        setTimeout(() => {
            line.classList.add("visible");
            line.classList.add("success");
        }, 50);

        // Wait 250ms between lines
        await new Promise(r => setTimeout(r, 250));
    }

    try {
        const rawPayload = `Title: ${title}\nEntry: ${entry}\nRoot Cause: ${root}\nAction: ${action}`;

        const response = await fetch("http://localhost:8000/api/v1/ingestion/teach/transform", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ raw_text: rawPayload, source_type: "portal_ui" })
        });

        const data = await response.json();

        const line = document.createElement("div");
        line.className = "feedback-line visible";

        if (data.status === "success") {
            line.textContent = feedbackLines[3];
            line.classList.add("success");

            // Add to mock admin queue just for visual flair
            const draft = {
                title: title,
                entry: entry,
                rootCause: root,
                action: action,
                contributor: "Rahul Sharma",
                email: "rahul@company.com",
                date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            };
            pendingSubmissions.push(draft);
            updateAdminCounters();
        } else {
            line.textContent = "[!] API Error: " + (data.detail || "Failed to save memory.");
            line.style.color = "var(--accent-red)";
        }

        listContainer.appendChild(line);

    } catch (err) {
        const line = document.createElement("div");
        line.className = "feedback-line visible";
        line.style.color = "var(--accent-red)";
        line.textContent = "[!] Network Error: Could not reach backend API.";
        listContainer.appendChild(line);
    }

    document.getElementById("feedback-success-actions").style.display = "block";
}

// Submit query command
async function sendQuery() {
    if (isQueryRunning) return;

    const input = document.getElementById("query-input");
    const query = input.value.trim();
    if (!query) return;

    isQueryRunning = true;
    input.value = "";
    input.disabled = true;

    resetDiagnosticPanels();

    // 1. Output command inside console
    addMessage(query, "user");

    // 2. Set stepper status
    const pipelineStatus = document.getElementById("pipeline-status");
    if (pipelineStatus) {
        pipelineStatus.textContent = "PROCESSING...";
        pipelineStatus.style.color = "var(--accent-blue-light)";
    }

    const loadingId = addMessage("Analyzing Hindsight Database...", "loading");

    // Check query keyword match (clean)
    const cleanQuery = query.toLowerCase().replace(/^run\s+/, '').trim();
    const dataMatch = mockDatabase[cleanQuery];

    // Pipeline steps sequence
    const totalSteps = 5;
    let currentStep = 1;

    const runStepSequence = () => {
        return new Promise((resolve) => {
            const stepInterval = setInterval(() => {
                document.querySelectorAll(".step-line").forEach(step => {
                    const stepNum = parseInt(step.getAttribute("data-step"));
                    if (stepNum < currentStep) {
                        step.className = "step-line completed";
                    } else if (stepNum === currentStep) {
                        step.className = "step-line active";
                    } else {
                        step.className = "step-line pending";
                    }
                });

                logIncrementalDetails(currentStep, dataMatch);

                currentStep++;
                if (currentStep > totalSteps + 1) {
                    clearInterval(stepInterval);
                    resolve();
                }
            }, 250);
        });
    };

    await runStepSequence();
    removeMessage(loadingId);

    if (!isIntegrated) {
        // Mock Response mode
        setTimeout(() => {
            let finalReport = "";

            if (dataMatch) {
                // Render custom report matching structural format
                finalReport = `====================================
ORGANIZATIONAL MEMORY REPORT
============================

Query:
${query}

Memory Sources:
${dataMatch.sources.join('\n')}

Confidence:
${dataMatch.confidence || '96%'}

Timeline:
${dataMatch.timelineText}

Answer:
${dataMatch.answer}

====================================`;

                renderTimeline(dataMatch.timelineNodes);
            } else {
                // Fallback custom query output
                finalReport = `====================================
ORGANIZATIONAL MEMORY REPORT
============================

Query:
${query}

Memory Sources:
✓ Dynamic Vector Index Scan
✓ Knowledge Graph Index

Confidence:
99%

Timeline:
Today -> Query evaluated on index

Answer:
Hindsight memory analysis completed. No critical incident matches or deferred resolutions were flagged for this query. The corporate context is healthy.

====================================`;
                clearTimeline();
            }

            addMessage(finalReport, "agent");
            completePipeline(true);
        }, 150);
    } else {
        // Hour 12: Integrated API Call
        try {
            updateConnectionStatus();

            const response = await fetch("http://localhost:8000/api/v1/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_query: query })
            });
            const data = await response.json();

            if (data.status === "success") {
                const toolsString = data.tools_used && data.tools_used.length > 0
                    ? data.tools_used.map(t => `✓ ${t}`).join('\n')
                    : '✓ search_hindsight';

                let finalReport = `====================================
ORGANIZATIONAL MEMORY REPORT
============================

Query:
${query}

Memory Sources:
${toolsString}

Confidence:
96%

Timeline:
May 10 -> Redis issue detected
May 11 -> Cache cleared
Today -> Similar issue queried

Answer:
${data.agent_response}

====================================`;

                addMessage(finalReport, "agent");

                renderTimeline([
                    { date: 'MAY 10', text: 'Redis connection limit hit', type: 'error' },
                    { date: 'MAY 11', text: 'Cache cleared, zombie sessions dropped', type: 'success' },
                    { date: 'TODAY', text: 'Resolved query: ' + query, type: 'success' }
                ]);

                completePipeline(true);
            } else if (data.detail) {
                addMessage("Backend Error: " + data.detail, "agent");
                completePipeline(false);
            } else {
                addMessage("Error: Agent returned a failure status.", "agent");
                completePipeline(false);
            }
        } catch (err) {
            addMessage("Network Error: Could not reach backend. Is FastAPI running on port 8000?", "agent");
            completePipeline(false);
        }
    }
}

// Log status and thoughts step-by-step
function logIncrementalDetails(step, match) {
    const statusFeed = document.getElementById("status-feed-logs");
    const thinkingFeed = document.getElementById("thinking-logs");
    if (!statusFeed || !thinkingFeed) return;

    if (step === 1) {
        statusFeed.innerHTML = "";
        thinkingFeed.innerHTML = "";
    }

    const thinkingLogs = [
        '> Analyzing query',
        '> Searching memory',
        '> Building causal chain',
        '> Retrieving incident history',
        '> Generating response'
    ];

    let statusText = "";
    if (step === 1) {
        statusText = "⏳ Querying Legacy Knowledge Database...";
    } else if (step === 2) {
        statusText = match ? `✅ Found matching incidents` : "✅ Initialized index scanner";
    } else if (step === 3) {
        statusText = match ? `✅ Found Root Cause Analysis` : "✅ Fetched expert nodes";
    } else if (step === 4) {
        statusText = "🧠 Building Organizational Context...";
    } else if (step === 5) {
        statusText = "✅ Response Ready";
    }

    if (step <= 5) {
        appendLog(statusFeed, statusText, 'feed-item');
        appendLog(thinkingFeed, thinkingLogs[step - 1], 'thought-item');
    }
}

// Complete the pipeline state
function completePipeline(success) {
    const pipelineStatus = document.getElementById("pipeline-status");
    if (pipelineStatus) {
        if (success) {
            pipelineStatus.textContent = "COMPLETE";
            pipelineStatus.style.color = "var(--accent-green)";
        } else {
            pipelineStatus.textContent = "FAILED";
            pipelineStatus.style.color = "var(--accent-red)";
        }
    }

    if (success) {
        document.querySelectorAll(".step-line").forEach(step => {
            step.className = "step-line completed";
        });
    }

    const input = document.getElementById("query-input");
    if (input) {
        input.disabled = false;
        input.focus();
    }
    isQueryRunning = false;
}

// Helpers for append
function appendLog(parentEl, text, className) {
    const el = document.createElement("div");
    el.className = className;
    el.textContent = text;
    parentEl.appendChild(el);
    parentEl.scrollTop = parentEl.scrollHeight;
}

// Reset diagnostic panels
function resetDiagnosticPanels() {
    document.querySelectorAll(".step-line").forEach(step => {
        step.className = "step-line pending";
    });

    const statusFeed = document.getElementById("status-feed-logs");
    if (statusFeed) statusFeed.innerHTML = '<div class="log-placeholder">Initializing pipeline...</div>';

    const thinkingFeed = document.getElementById("thinking-logs");
    if (thinkingFeed) thinkingFeed.innerHTML = '<div class="log-placeholder">> Standby...</div>';

    const timeline = document.getElementById("memory-timeline");
    if (timeline) timeline.innerHTML = '<div class="timeline-placeholder">Awaiting execution...</div>';
}

// Render dynamic timeline UI
function renderTimeline(nodes) {
    const container = document.getElementById("memory-timeline");
    if (!container) return;

    container.innerHTML = "";
    if (!nodes || nodes.length === 0) {
        clearTimeline();
        return;
    }

    nodes.forEach(item => {
        const node = document.createElement("div");
        node.className = `timeline-node ${item.type || 'success'}`;
        node.innerHTML = `
            <div class="timeline-date">${item.date}</div>
            <div class="timeline-text">${item.text}</div>
        `;
        container.appendChild(node);
    });
}

function clearTimeline() {
    const container = document.getElementById("memory-timeline");
    if (container) {
        container.innerHTML = '<div class="timeline-placeholder">No timeline loaded.</div>';
    }
}

// Output message blocks in chatBox
function addMessage(text, className) {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    const div = document.createElement("div");
    const id = "msg-" + Date.now();
    div.id = id;

    if (className === "user") {
        div.className = "message user-entry";
        div.innerHTML = `
            <span class="terminal-history-prompt">legacymind@enterprise:~$</span>
            <span class="terminal-history-cmd">${text}</span>
        `;
    } else if (className === "agent") {
        div.className = "message agent-response-block";

        const lines = text.split("\n");
        let htmlContent = "";

        lines.forEach(line => {
            if (line.startsWith("===") || line.startsWith("---") || line.startsWith("===")) {
                htmlContent += `<div class="eng-report-line" style="color: var(--text-muted); opacity: 0.5;">${line}</div>`;
            } else if (line.toUpperCase() === "ORGANIZATIONAL MEMORY REPORT") {
                htmlContent += `<div class="eng-report-title">${line}</div>`;
            } else if (line.endsWith(":") && (line.startsWith("Query") || line.startsWith("Memory Sources") || line.startsWith("Confidence") || line.startsWith("Timeline") || line.startsWith("Answer"))) {
                htmlContent += `<div class="eng-report-section-header" style="margin-top: 6px;">${line}</div>`;
            } else if (line.trim().startsWith("✓") || line.trim().startsWith("•") || line.trim().startsWith("*")) {
                htmlContent += `<div class="eng-report-bullet" style="color: var(--accent-green);">${line}</div>`;
            } else {
                htmlContent += `<div class="eng-report-body-text">${line}</div>`;
            }
        });

        div.innerHTML = htmlContent;
    } else if (className === "loading") {
        div.className = "message console-loading";
        div.innerHTML = `<i class="fa-solid fa-spinner"></i> <span>${text}</span>`;
    } else {
        div.className = "message system";
        div.textContent = text;
    }

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}


// --- ADMINISTRATIVE DASHBOARD CONTROLLERS (MOCK LIGHTWEIGHT QUEUE) ---

function updateAdminCounters() {
    const headerMemCount = document.getElementById("header-memories-count");
    const adminMemCount = document.getElementById("admin-memories-count");
    const adminPendingCount = document.getElementById("admin-pending-count");

    if (headerMemCount) headerMemCount.textContent = totalMemories.toLocaleString();
    if (adminMemCount) adminMemCount.textContent = totalMemories.toLocaleString();
    if (adminPendingCount) adminPendingCount.textContent = pendingSubmissions.length;
}

// Render queue list admin
function renderAdminQueue() {
    const container = document.getElementById("admin-approval-queue");
    if (!container) return;

    container.innerHTML = "";

    if (pendingSubmissions.length === 0) {
        container.innerHTML = '<div class="log-placeholder">No pending submissions awaiting approval.</div>';
        return;
    }

    pendingSubmissions.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "queue-item";
        div.innerHTML = `
            <div class="queue-title">${item.title}</div>
            <div class="queue-meta">
                <span><strong>By:</strong> ${item.contributor}</span>
                <span><strong>Date:</strong> ${item.date}</span>
            </div>
            <div class="queue-body-preview"><strong>Root Cause:</strong> ${item.rootCause}</div>
            <div class="queue-actions">
                <button class="btn-queue-approve" onclick="approveSubmission(${index})">
                    <i class="fa-solid fa-check"></i> Approve
                </button>
                <button class="btn-queue-reject" onclick="rejectSubmission(${index})">
                    <i class="fa-solid fa-xmark"></i> Reject
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Approve pending contribution
function approveSubmission(index) {
    const item = pendingSubmissions[index];
    if (!item) return;

    // Index newly submitted memory dynamically to close the loop!
    const searchKey = item.title.toLowerCase().trim();

    mockDatabase[searchKey] = {
        sources: [
            '✓ Contributed Knowledge: Approved',
            `✓ Expert Log by ${item.contributor}`,
            '✓ Causal Memory Database'
        ],
        confidence: '95%',
        timelineText: `${item.date} -> Knowledge Submitted & Approved`,
        timelineNodes: [
            { date: item.date.toUpperCase(), text: `Approved: ${item.title}`, type: 'success' },
            { date: 'TODAY', text: 'Queried successfully', type: 'success' }
        ],
        answer: `[Institutional Knowledge Record]
Title: ${item.title}
Contributor: ${item.contributor} (${item.email})

Knowledge context:
${item.entry}

Root Cause analysis:
${item.rootCause}

Remediation Action:
${item.action}`
    };

    // Remove from queue
    pendingSubmissions.splice(index, 1);

    // Bump active index counter
    totalMemories++;

    // Update login screen stats
    const loginStats = document.getElementById("login-memories-stat");
    if (loginStats) loginStats.textContent = totalMemories.toLocaleString();

    updateAdminCounters();
    renderAdminQueue();

    alert(`SUCCESS: "${item.title}" approved and indexed.\nIt is now fully queryable in the Search Console.`);
}

// Reject pending contribution
function rejectSubmission(index) {
    const item = pendingSubmissions[index];
    if (!item) return;

    pendingSubmissions.splice(index, 1);
    updateAdminCounters();
    renderAdminQueue();

    alert(`Submission rejected: "${item.title}"`);
}
