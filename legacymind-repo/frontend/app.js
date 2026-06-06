// LegacyMind AI - Custom Premium Frontend Controller
// Toggle this variable to true during the Hour 12 "Wire-Up" Sync
const isIntegrated = true;

// Application State
let activeMode = 'hindsight';
let isQueryRunning = false;

// Custom Mock Data for Hackathon Demo
const mockDatabase = {
    'investigate payment-service': {
        report: `=== ORGANIZATIONAL MEMORY REPORT ===

[Query]: investigate payment-service
[Status]: MEMORY_RESOLVED
[System]: payment-service
[Incident Ref]: Outage #483

Historical Root Cause:
The payment-service outages stem from a deferred remediation plan in April 2024. The circuit-breaker threshold was set too low under peak load, causing cascade failures when database connections timed out.

Related Decisions & Events:
* Jan 2024: Initial latency alert warnings.
* Mar 2024: Service degradation incident resolved by cache clearing.
* Apr 2024: Technical debt registered; fix deferred by engineering leadership.

Expert Owner: Rahul (Lead Platform)
Remediation: Optimize connection pool limits and bump circuit breaker cooldown window to 15s.

Confidence: 94%`,
        statusLogs: [
            '⏳ Querying Legacy Knowledge Database...',
            '✅ Found incident history for "payment-service"',
            '✅ Found Architecture Decision Record (ADR #14)',
            '🧠 Building causal graph with 4 incident nodes...',
            '✅ Analysis synthesized'
        ],
        thinkingLogs: [
            '> Evaluating dependency trees for microservice: payment-service',
            '> Found related incident: INC-483 (October 2023)',
            '> Matching commit: "Update connection pools" by team-payment',
            '> Tracking: Circuit breaker threshold postponed in April triage',
            '> Confidence level: 94%'
        ],
        timeline: [
            { date: 'JAN 2024', text: 'Warning Signal: High response latency on checkout calls', type: 'warning' },
            { date: 'MAR 2024', text: 'Service Degradation: Database connection pooling limit exhausted', type: 'error' },
            { date: 'APR 2024', text: 'Deferred Remediation: Postponed circuit-breaker threshold optimization', type: 'warning' },
            { date: 'JUN 2024', text: 'Major Outage: Cascade failure triggered by payment-service timeouts', type: 'error' }
        ]
    },
    'recall incident-483': {
        report: `=== ORGANIZATIONAL MEMORY REPORT ===

[Query]: recall incident-483
[Status]: POST_MORTEM_LOADED
[Author]: Rahul (Lead SRE)
[Date]: October 2023

Incident Summary:
Payment checkout outage lasting 45 minutes on checkout gateway.

Root Cause:
Circuit breaker misconfiguration. During peak traffic, checkout connection limit was hit, triggering a false-positive trip on the payment gateway circuit breaker.

Action Taken:
Resolved by Rahul by clearing the Redis cache to drop zombie sessions and bumping connection pooling max size to 150.

Confidence: 98%`,
        statusLogs: [
            '⏳ Querying Legacy Knowledge Database...',
            '✅ Located Incident ID #483 (Oct 2023)',
            '✅ Found post-mortem report (Author: Rahul)',
            '🧠 Recalling original RCA session logs...',
            '✅ Response ready'
        ],
        thinkingLogs: [
            '> Locating event node: INCIDENT_483',
            '> Cross-referencing root cause: Circuit breaker misconfiguration',
            '> Indexing authors: Rahul (Lead Platform)',
            '> Confidence level: 98%'
        ],
        timeline: [
            { date: 'OCT 2023', text: 'Incident #483: Checkout outage lasting 45 minutes', type: 'error' },
            { date: 'OCT 2023', text: 'RCA Published: Circuit breaker threshold mismatch details saved', type: 'success' },
            { date: 'NOV 2023', text: 'Action Item: Automated threshold alerting scripts deployed', type: 'success' }
        ]
    },
    'why was kafka rejected': {
        report: `=== ORGANIZATIONAL MEMORY REPORT ===

[Query]: why was kafka rejected
[Status]: ARCHITECTURE_DECISION_FOUND
[Document]: ADR #27 (Message Broking)
[Lead Architect]: Priya

Decision Context:
Kafka was formally rejected in favor of RabbitMQ / Redis Streams for async processing.

Core Rejection Factors:
1. Operational Complexity: DevOps team lacked dedicated Kafka engineers to monitor cluster states.
2. Budget Constraints: Projected cluster sizing costs exceeded the allocation limit.
3. Latency Requirements: High throughput of Kafka was not required; sub-millisecond queuing latency of RabbitMQ was preferred.

Alternative Selected: RabbitMQ
Confidence: 92%`,
        statusLogs: [
            '⏳ Querying Decision DNA Database...',
            '✅ ADR #27 (Message Broking) retrieved',
            '✅ Found expert consultation notes (Lead: Priya)',
            '🧠 Synthesizing decision trade-offs...',
            '✅ Explanation compiled'
        ],
        thinkingLogs: [
            '> Parsing ADR records for "Kafka" and "Queue"',
            '> Found rejection matrix: Maintenance overhead and operational complexity',
            '> Selected alternative: RabbitMQ / Redis Streams',
            '> Confidence level: 92%'
        ],
        timeline: [
            { date: 'DEC 2023', text: 'Proposal: Introducing Kafka for transactional log streaming', type: 'success' },
            { date: 'JAN 2024', text: 'Evaluation: Priya raised concerns regarding ZooKeeper/KRaft overhead', type: 'warning' },
            { date: 'FEB 2024', text: 'Decision: Kafka rejected; RabbitMQ selected for simpler operations', type: 'success' }
        ]
    },
    'show expert payment-service': {
        report: `=== ORGANIZATIONAL MEMORY REPORT ===

[Query]: show expert payment-service
[Status]: REGISTRY_ACCESSED
[Scope]: payment-service

Chief Subject Matter Expert:
Rahul (Lead SRE / Platform Engineer)
* Profile: Initial codebase architect, author of RCA-483.
* Contact: rahul@enterprise.com

Secondary Expert:
Priya (Lead Developer)
* Profile: Configured connection pooling and RabbitMQ integrations.
* Contact: priya@enterprise.com

Confidence: 96%`,
        statusLogs: [
            '⏳ Querying Git Provenance & Incident Logs...',
            '✅ Git blame logs parsed for payment-service/',
            '✅ Most active incident authors found',
            '🧠 Identifying chief institutional expert...',
            '✅ Expert profiles ready'
        ],
        thinkingLogs: [
            '> Fetching owner graph for payment-service',
            '> Correlating commits with incident resolution logs',
            '> Top contributor: Rahul (18 commits, 4 RCA tickets)',
            '> Secondary contributor: Priya (10 commits)',
            '> Confidence level: 96%'
        ],
        timeline: [
            { date: 'JUN 2023', text: 'First Commit: Codebase initialized by Rahul', type: 'success' },
            { date: 'OCT 2023', text: 'Incident 483: Resolved by Rahul', type: 'error' },
            { date: 'MAY 2024', text: 'Major refactor: DB connection pooling written by Priya', type: 'success' }
        ]
    }
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    updateConnectionStatus();

    // Hook enter key on input
    const input = document.getElementById("query-input");
    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendQuery();
            }
        });
    }
});

// Update connection status visual based on integration configuration
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
            dot.style.boxShadow = "0 0 8px var(--accent-blue-light)";
        }
    }
}

// Select running mode (Goldfish, Basic RAG, Hindsight)
function selectMode(mode) {
    activeMode = mode;
    
    // Toggle active classes
    document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`mode-${mode}`);
    if (activeBtn) activeBtn.classList.add("active");

    // Dynamic explanation and incident count stats
    const explanationText = document.getElementById("mode-explanation-text");
    const incidentCount = document.getElementById("incident-count");
    
    if (mode === 'goldfish') {
        explanationText.textContent = "Zero-shot memory configuration. The agent operates with no historical incident context or decision logs.";
        if (incidentCount) incidentCount.textContent = "0";
    } else if (mode === 'rag') {
        explanationText.textContent = "Retrieves raw matching text blocks using vector similarity search. Lacks relational metadata or causal dependency mapping.";
        if (incidentCount) incidentCount.textContent = "12";
    } else {
        explanationText.textContent = "Deep Hindsight Engine active. Reconstructs multi-month causal chains and links historical decisions to current incidents.";
        if (incidentCount) incidentCount.textContent = "483";
    }
}

// Execute query preset
function runExample(commandText) {
    const input = document.getElementById("query-input");
    if (input) {
        input.value = commandText;
        sendQuery();
    }
}

// Main Send Query Handler
async function sendQuery() {
    if (isQueryRunning) return;

    const input = document.getElementById("query-input");
    const query = input.value.trim();
    if (!query) return;

    // Set lock
    isQueryRunning = true;
    input.value = "";
    input.disabled = true;

    // Reset diagnostic panels
    resetDiagnosticPanels();

    // 1. Log query execution inside console window
    addMessage(query, "user");

    // 2. Set stepper status
    const pipelineStatus = document.getElementById("pipeline-status");
    if (pipelineStatus) {
        pipelineStatus.textContent = "PROCESSING...";
        pipelineStatus.style.color = "var(--accent-blue-light)";
    }

    // Show inline command loading indicator inside terminal window
    const loadingId = addMessage("Running memory resolution pipeline...", "loading");

    // Get specific simulated data or fallback to generic
    const cleanQuery = query.toLowerCase().replace(/^run\s+/, '');
    const dataMatch = mockDatabase[cleanQuery];

    // Build steps timeline sequence
    const totalSteps = 5;
    let currentStep = 1;

    // Execute state steps sequence
    const runStepSequence = () => {
        return new Promise((resolve) => {
            const stepInterval = setInterval(() => {
                // Deactivate previous step, activate current
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

                // Add feed logs and thinking entries incrementally
                logIncrementalDetails(currentStep, dataMatch, activeMode);

                currentStep++;
                if (currentStep > totalSteps + 1) {
                    clearInterval(stepInterval);
                    resolve();
                }
            }, 300); // 300ms per step
        });
    };

    // Run pipeline sequence
    await runStepSequence();

    // Remove console loading element
    removeMessage(loadingId);

    if (!isIntegrated) {
        // Mock Mode response
        setTimeout(() => {
            let finalResponseText = "";
            
            if (activeMode === 'goldfish') {
                finalResponseText = `=== ORGANIZATIONAL MEMORY REPORT ===
[Query]: ${query}
[Status]: DEGRADED
[Warning]: Mode GOLDFISH is active. Institutional context skipped.

No historical context found. Memory pipeline skipped.
Please consult engineers manually.

Confidence: 5%`;
                clearTimeline();
            } else if (activeMode === 'rag') {
                // RAG mode outputs partial report
                if (dataMatch) {
                    finalResponseText = `=== ORGANIZATIONAL MEMORY REPORT ===
[Query]: ${query}
[Status]: VECTOR_MATCH_ONLY
[Warning]: Mode BASIC RAG is active. Causal links deferred.

Retrieved context:
${dataMatch.report.split('\n\n')[2] || 'No matching database snippets.'}

Confidence: 62%`;
                    renderTimeline([{ date: 'TODAY', text: 'Vector matched incident snippet', type: 'warning' }]);
                } else {
                    finalResponseText = `=== ORGANIZATIONAL MEMORY REPORT ===
[Query]: ${query}
[Status]: NO_MATCH
No similar vector documents found.

Confidence: 10%`;
                    clearTimeline();
                }
            } else {
                // Hindsight Mode (Full memory)
                if (dataMatch) {
                    finalResponseText = dataMatch.report;
                    renderTimeline(dataMatch.timeline);
                } else {
                    finalResponseText = `=== ORGANIZATIONAL MEMORY REPORT ===
[Query]: ${query}
[Status]: SUCCESS
[Hindsight]: Deep scan complete. No critical incidents matched.

Institutional memory is healthy. No deferred fixes found on this component path.

Confidence: 99%`;
                    clearTimeline();
                }
            }

            addMessage(finalResponseText, "agent");
            completePipeline(true);
        }, 200);
    } else {
        // Integrated Live API Call
        try {
            updateConnectionStatus();

            const response = await fetch("http://localhost:8000/api/v1/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_query: query })
            });
            const data = await response.json();
            
            if (data.status === "success") {
                let formattedAgentResponse = `=== ORGANIZATIONAL MEMORY REPORT ===

[Query]: ${query}
[Status]: SUCCESS
[Tools Fired]: ${data.tools_used.join(', ')}

${data.agent_response}

Confidence: 96%`;
                
                addMessage(formattedAgentResponse, "agent");
                
                // Show a generic timeline if they use Hindsight mode
                if (activeMode === 'hindsight') {
                    renderTimeline([
                        { date: 'MAY 10', text: 'Redis cache cleared to drop zombie sessions by Rahul', type: 'success' },
                        { date: 'TODAY', text: 'Query evaluated: ' + query, type: 'success' }
                    ]);
                } else {
                    clearTimeline();
                }

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
function logIncrementalDetails(step, match, mode) {
    const statusFeed = document.getElementById("status-feed-logs");
    const thinkingFeed = document.getElementById("thinking-logs");
    if (!statusFeed || !thinkingFeed) return;

    // Clear placeholders on step 1
    if (step === 1) {
        statusFeed.innerHTML = "";
        thinkingFeed.innerHTML = "";
    }

    if (mode === 'goldfish') {
        if (step === 1) {
            appendLog(statusFeed, '⏳ Querying Legacy Knowledge Database...', 'feed-item');
            appendLog(thinkingFeed, '> Evaluating query input...', 'thought-item');
        } else if (step === 2) {
            appendLog(statusFeed, '⚠️ Warning: Goldfish mode is active. Memory recall is disabled.', 'feed-item');
            appendLog(thinkingFeed, '> Bypassing memory index query...', 'thought-item');
        } else if (step === 3) {
            appendLog(statusFeed, '⚠️ Skipping expert ownership matching.', 'feed-item');
            appendLog(thinkingFeed, '> Warning: 0-shot context activated.', 'thought-item');
        } else if (step === 5) {
            appendLog(statusFeed, '✅ Empty Response Prepared.', 'feed-item');
            appendLog(thinkingFeed, '> Confidence score set to minimum.', 'thought-item');
        }
        return;
    }

    if (mode === 'rag') {
        if (step === 1) {
            appendLog(statusFeed, '⏳ Querying Vector DB...', 'feed-item');
            appendLog(thinkingFeed, '> Parsing user input for embeddings...', 'thought-item');
        } else if (step === 2) {
            appendLog(statusFeed, '✅ Vector search completed.', 'feed-item');
            appendLog(thinkingFeed, '> Running cosine similarity match...', 'thought-item');
        } else if (step === 3) {
            appendLog(statusFeed, '✅ Located related context snippet.', 'feed-item');
            appendLog(thinkingFeed, '> Extracted matching text context chunks.', 'thought-item');
        } else if (step === 5) {
            appendLog(statusFeed, '✅ Basic response synthesized.', 'feed-item');
            appendLog(thinkingFeed, '> Prepared direct context injection.', 'thought-item');
        }
        return;
    }

    // Default Hindsight Mode Incremental Logs
    if (match) {
        // Specific command logs
        const statusLogs = match.statusLogs;
        const thinkingLogs = match.thinkingLogs;

        if (step === 1) {
            appendLog(statusFeed, statusLogs[0] || '⏳ Querying Legacy Knowledge Database...', 'feed-item');
            appendLog(thinkingFeed, thinkingLogs[0] || '> Evaluating query...', 'thought-item');
        } else if (step === 2) {
            appendLog(statusFeed, statusLogs[1] || '✅ Database query completed.', 'feed-item');
            appendLog(thinkingFeed, thinkingLogs[1] || '> Searching incident nodes...', 'thought-item');
        } else if (step === 3) {
            appendLog(statusFeed, statusLogs[2] || '✅ Expert knowledge resolved.', 'feed-item');
            appendLog(thinkingFeed, thinkingLogs[2] || '> Cross-referencing ADR files...', 'thought-item');
        } else if (step === 4) {
            appendLog(statusFeed, statusLogs[3] || '✅ Causal links established.', 'feed-item');
            appendLog(thinkingFeed, thinkingLogs[3] || '> Assembling event graph...', 'thought-item');
        } else if (step === 5) {
            appendLog(statusFeed, statusLogs[4] || '✅ Report compiled.', 'feed-item');
            appendLog(thinkingFeed, thinkingLogs[4] || '> Formatting markdown report...', 'thought-item');
        }
    } else {
        // Fallback logs for custom user queries in Hindsight mode
        if (step === 1) {
            appendLog(statusFeed, '⏳ Querying Legacy Knowledge Database...', 'feed-item');
            appendLog(thinkingFeed, '> Analyzing query parameters...', 'thought-item');
        } else if (step === 2) {
            appendLog(statusFeed, '✅ Done: Incident History Scan', 'feed-item');
            appendLog(thinkingFeed, '> Running token parser on database index...', 'thought-item');
        } else if (step === 3) {
            appendLog(statusFeed, '✅ Done: Expert Ownership Check', 'feed-item');
            appendLog(thinkingFeed, '> No direct Git blame match found.', 'thought-item');
        } else if (step === 4) {
            appendLog(statusFeed, '🧠 Building Organizational Context...', 'feed-item');
            appendLog(thinkingFeed, '> Extrapolating causal connections...', 'thought-item');
        } else if (step === 5) {
            appendLog(statusFeed, '✅ Response Ready', 'feed-item');
            appendLog(thinkingFeed, '> Formatted generic incident logs successfully.', 'thought-item');
        }
    }
}

// Complete the pipeline execution state
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

    // Reset steps styles to green checkmarks on complete success
    if (success && activeMode !== 'goldfish') {
        document.querySelectorAll(".step-line").forEach(step => {
            step.className = "step-line completed";
        });
    }

    // Unlock input
    const input = document.getElementById("query-input");
    if (input) {
        input.disabled = false;
        input.focus();
    }
    isQueryRunning = false;
}

// Helper: Append log line
function appendLog(parentEl, text, className) {
    const el = document.createElement("div");
    el.className = className;
    el.textContent = text;
    parentEl.appendChild(el);
    parentEl.scrollTop = parentEl.scrollHeight;
}

// Helper: Reset diagnostic widgets
function resetDiagnosticPanels() {
    // Pipeline steps
    document.querySelectorAll(".step-line").forEach(step => {
        step.className = "step-line pending";
    });

    // Feeds
    const statusFeed = document.getElementById("status-feed-logs");
    if (statusFeed) statusFeed.innerHTML = '<div class="log-placeholder">Pipeline initializing...</div>';

    const thinkingFeed = document.getElementById("thinking-logs");
    if (thinkingFeed) thinkingFeed.innerHTML = '<div class="log-placeholder">> Standby...</div>';

    // Timeline
    const timeline = document.getElementById("memory-timeline");
    if (timeline) timeline.innerHTML = '<div class="timeline-placeholder">Evaluating causal nodes...</div>';
}

// Render timeline items dynamically
function renderTimeline(timelineData) {
    const container = document.getElementById("memory-timeline");
    if (!container) return;

    container.innerHTML = "";
    
    if (!timelineData || timelineData.length === 0) {
        clearTimeline();
        return;
    }

    timelineData.forEach(item => {
        const node = document.createElement("div");
        node.className = `timeline-node ${item.type || 'success'}`;
        
        node.innerHTML = `
            <div class="timeline-date">${item.date}</div>
            <div class="timeline-text">${item.text}</div>
        `;
        
        container.appendChild(node);
    });
}

// Reset timeline UI
function clearTimeline() {
    const container = document.getElementById("memory-timeline");
    if (container) {
        container.innerHTML = '<div class="timeline-placeholder">No causal timeline loaded for current query context.</div>';
    }
}

// Render message in terminal console body
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
        
        // Wrap output report headers nicely
        const lines = text.split("\n");
        let formattedHtml = "";
        let inReport = false;
        
        lines.forEach(line => {
            if (line.startsWith("===") && line.endsWith("===")) {
                formattedHtml += `<div class="report-header">${line.replace(/===/g, '').trim()}</div>`;
                inReport = true;
            } else if (line.trim().startsWith("*")) {
                formattedHtml += `<div class="report-item" style="padding-left: 12px; margin-bottom: 2px;">• ${line.replace(/^\*\s*/, '')}</div>`;
            } else if (line.trim().startsWith("1.") || line.trim().startsWith("2.") || line.trim().startsWith("3.")) {
                formattedHtml += `<div class="report-item" style="padding-left: 12px; margin-bottom: 2px;">${line}</div>`;
            } else if (line.trim().includes(":") && !line.trim().startsWith("http")) {
                const parts = line.split(":");
                const label = parts[0];
                const content = parts.slice(1).join(":");
                formattedHtml += `<div class="report-item"><strong>${label}:</strong>${content}</div>`;
            } else if (line.trim() !== "") {
                formattedHtml += `<div class="report-item">${line}</div>`;
            } else {
                formattedHtml += `<div style="height: 6px;"></div>`;
            }
        });
        
        div.innerHTML = formattedHtml;
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

// Remove message element
function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
