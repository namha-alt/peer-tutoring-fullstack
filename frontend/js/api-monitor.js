// Live API Requests Monitor HUD & Inspector
document.addEventListener('DOMContentLoaded', () => {
  // Inject Monitor HTML into document
  const dock = document.createElement('div');
  dock.className = 'api-monitor-dock dock-collapsed';
  dock.id = 'api-monitor-dock';

  dock.innerHTML = `
    <div class="api-monitor-header" id="api-monitor-toggle">
      <div class="api-monitor-title">
        <span>⚡ Live API Monitor (MongoDB Connected)</span>
        <span class="api-status-badge"><span class="pulse-dot"></span> LIVE REST TRAFFIC</span>
      </div>
      <div class="api-monitor-actions">
        <button class="api-monitor-btn" id="api-clear-btn" title="Clear Logs" onclick="event.stopPropagation()">Clear</button>
        <button class="api-monitor-btn" id="api-toggle-arrow">▲ Expand</button>
      </div>
    </div>
    <div class="api-monitor-body" id="api-monitor-body">
      <div style="color: #64748B; font-size: 0.75rem; text-align: center; padding: 8px;">
        Listening for live API requests to Node.js & MongoDB backend...
      </div>
    </div>
  `;

  // Inject Inspector Modal HTML
  const modal = document.createElement('div');
  modal.className = 'api-inspect-modal';
  modal.id = 'api-inspect-modal';
  modal.innerHTML = `
    <div class="api-inspect-card">
      <div class="api-inspect-header">
        <h4 id="inspect-title">⚡ API Request Details</h4>
        <button class="api-inspect-close" id="close-inspect-modal">&times;</button>
      </div>
      <div class="api-inspect-body">
        <div>
          <div class="api-inspect-section-title">Endpoint & Status</div>
          <div style="display: flex; gap: 8px; align-items: center; font-size: 0.9rem; font-weight: 600;">
            <span id="inspect-method" class="api-log-method method-GET">GET</span>
            <span id="inspect-url" style="color: #F8FAFC;">/api/health</span>
            <span id="inspect-status" class="status-success" style="margin-left: auto;">200 OK</span>
            <span id="inspect-duration" style="color: #94A3B8; font-size: 0.8rem;">12ms</span>
          </div>
        </div>

        <div>
          <div class="api-inspect-section-title">
            <span>Request Payload (Body)</span>
            <span style="font-size: 0.7rem; color: #64748B;">Client -> Express</span>
          </div>
          <pre class="json-code-box" id="inspect-req-body">None</pre>
        </div>

        <div>
          <div class="api-inspect-section-title">
            <span>Response Data (MongoDB Result)</span>
            <span style="font-size: 0.7rem; color: #10B981;">MongoDB -> Express -> Client</span>
          </div>
          <pre class="json-code-box" id="inspect-res-body">{}</pre>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(dock);
  document.body.appendChild(modal);

  const toggleHeader = document.getElementById('api-monitor-toggle');
  const toggleArrow = document.getElementById('api-toggle-arrow');
  const monitorBody = document.getElementById('api-monitor-body');
  const clearBtn = document.getElementById('api-clear-btn');
  const inspectModal = document.getElementById('api-inspect-modal');
  const closeInspectBtn = document.getElementById('close-inspect-modal');

  let isCollapsed = true;

  toggleHeader.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      dock.classList.add('dock-collapsed');
      toggleArrow.textContent = '▲ Expand';
    } else {
      dock.classList.remove('dock-collapsed');
      toggleArrow.textContent = '▼ Collapse';
    }
  });

  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    monitorBody.innerHTML = `
      <div style="color: #64748B; font-size: 0.75rem; text-align: center; padding: 8px;">
        Logs cleared. Waiting for new API requests...
      </div>
    `;
  });

  closeInspectBtn.addEventListener('click', () => {
    inspectModal.classList.remove('active');
  });

  inspectModal.addEventListener('click', (e) => {
    if (e.target === inspectModal) inspectModal.classList.remove('active');
  });

  function renderLogEntry(entry) {
    // Remove placeholder message if present
    if (monitorBody.children.length === 1 && monitorBody.children[0].tagName === 'DIV' && !monitorBody.children[0].classList.contains('api-log-entry')) {
      monitorBody.innerHTML = '';
    }

    const logEl = document.createElement('div');
    const statusCategory = entry.status >= 200 && entry.status < 300 ? 'status-2xx' : (entry.status >= 400 && entry.status < 500 ? 'status-4xx' : 'status-5xx');
    const statusColorClass = entry.status >= 200 && entry.status < 300 ? 'status-success' : (entry.status >= 400 && entry.status < 500 ? 'status-warn' : 'status-err');

    logEl.className = `api-log-entry ${statusCategory}`;
    logEl.innerHTML = `
      <span class="api-log-time">${entry.timeFormatted || new Date().toLocaleTimeString()}</span>
      <span class="api-log-method method-${entry.method}">${entry.method}</span>
      <span class="api-log-url" title="${entry.endpoint}">${entry.endpoint}</span>
      <span class="api-log-status ${statusColorClass}">${entry.status || 'ERR'}</span>
      <span class="api-log-duration">${entry.durationMs}ms</span>
      <span class="api-log-inspect-btn">Inspect ↗</span>
    `;

    logEl.addEventListener('click', () => {
      document.getElementById('inspect-method').textContent = entry.method;
      document.getElementById('inspect-method').className = `api-log-method method-${entry.method}`;
      document.getElementById('inspect-url').textContent = entry.endpoint;
      document.getElementById('inspect-status').textContent = entry.status;
      document.getElementById('inspect-status').className = statusColorClass;
      document.getElementById('inspect-duration').textContent = `${entry.durationMs}ms`;

      document.getElementById('inspect-req-body').textContent = entry.requestBody
        ? JSON.stringify(entry.requestBody, null, 2)
        : 'None (GET/No Payload)';

      document.getElementById('inspect-res-body').textContent = entry.responseBody
        ? JSON.stringify(entry.responseBody, null, 2)
        : '{}';

      inspectModal.classList.add('active');
    });

    monitorBody.insertBefore(logEl, monitorBody.firstChild);

    // Keep max 40 entries in UI
    while (monitorBody.children.length > 40) {
      monitorBody.removeChild(monitorBody.lastChild);
    }
  }

  // Listen to requests made by api.js
  window.addEventListener('api:request-logged', (e) => {
    if (e.detail) {
      renderLogEntry(e.detail);
    }
  });

  // Fetch initial traffic logs from server
  fetch('/api/system/traffic')
    .then(r => r.json())
    .then(data => {
      if (data.logs && data.logs.length > 0) {
        // Reverse so newest appears on top
        data.logs.slice().reverse().forEach(log => {
          renderLogEntry({
            id: log.id,
            timeFormatted: log.timeFormatted,
            method: log.method,
            endpoint: log.url,
            status: log.statusCode,
            durationMs: log.durationMs,
            requestBody: log.requestBody,
            responseBody: log.responseBody
          });
        });
      }
    })
    .catch(() => {});
});
