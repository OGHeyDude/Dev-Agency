// VS Code Extension Webview JavaScript

(function() {
    'use strict';

    // Get the VS Code API
    const vscode = acquireVsCodeApi();

    // State management
    let state = {
        debugStatus: null,
        executions: [],
        isLoading: false
    };

    // Initialize the webview
    function initialize() {
        setupEventListeners();
        requestInitialData();
        setupPeriodicRefresh();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', handleRefresh);
        }

        // Action buttons
        const invokeAgentBtn = document.getElementById('invoke-agent-btn');
        if (invokeAgentBtn) {
            invokeAgentBtn.addEventListener('click', handleInvokeAgent);
        }

        const openDebuggerBtn = document.getElementById('open-debugger-btn');
        if (openDebuggerBtn) {
            openDebuggerBtn.addEventListener('click', handleOpenDebugger);
        }

        const showTracesBtn = document.getElementById('show-traces-btn');
        if (showTracesBtn) {
            showTracesBtn.addEventListener('click', handleShowTraces);
        }

        // Listen for messages from the extension
        window.addEventListener('message', handleMessage);
    }

    // Request initial data
    function requestInitialData() {
        setLoading(true);
        vscode.postMessage({ command: 'get-debug-status' });
        vscode.postMessage({ command: 'get-executions' });
    }

    // Setup periodic refresh
    function setupPeriodicRefresh() {
        setInterval(() => {
            if (!state.isLoading) {
                vscode.postMessage({ command: 'get-executions' });
            }
        }, 3000); // Refresh every 3 seconds
    }

    // Handle messages from the extension
    function handleMessage(event) {
        const message = event.data;
        
        switch (message.command) {
            case 'debug-status':
                updateDebugStatus(message.data);
                break;
            case 'executions-data':
                updateExecutions(message.data);
                break;
            case 'execution-started':
                handleExecutionStarted(message.execution);
                break;
            case 'execution-completed':
                handleExecutionCompleted(message.execution);
                break;
            case 'execution-progress':
                handleExecutionProgress(message.execution);
                break;
            case 'agent-invocation-result':
                handleAgentResult(message.data);
                break;
            case 'agent-invocation-error':
                handleAgentError(message.data);
                break;
            case 'execution-cancelled':
                handleExecutionCancelled(message.data);
                break;
            case 'reveal-data':
                handleRevealData(message.data);
                break;
            default:
                console.log('Unknown message command:', message.command);
        }
    }

    // Update debug status display
    function updateDebugStatus(data) {
        state.debugStatus = data;
        
        // Update status counters
        updateElement('active-count', data.agents.active || 0);
        updateElement('queued-count', data.agents.queued || 0);
        updateElement('debug-status', data.debug.visualizerStatus || 'stopped');

        // Update debug info
        updateDebugInfo(data.debug);
        
        setLoading(false);
    }

    // Update executions display
    function updateExecutions(data) {
        state.executions = data.recent || [];
        
        // Update execution list
        updateExecutionsList(state.executions);
        
        setLoading(false);
    }

    // Update executions list HTML
    function updateExecutionsList(executions) {
        const container = document.getElementById('executions-container');
        if (!container) return;

        if (executions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="icon">🤖</span>
                    <p>No recent executions</p>
                    <p>Click "Invoke Agent" to get started</p>
                </div>
            `;
            return;
        }

        const executionsList = executions.map(execution => createExecutionItem(execution)).join('');
        container.innerHTML = `<div class="executions-list">${executionsList}</div>`;

        // Add click handlers for execution items
        container.querySelectorAll('.execution-item').forEach((item, index) => {
            item.addEventListener('click', () => handleExecutionClick(executions[index]));
        });
    }

    // Create execution item HTML
    function createExecutionItem(execution) {
        const statusClass = execution.status.toLowerCase();
        const startTime = new Date(execution.startTime).toLocaleTimeString();
        const duration = execution.endTime ? 
            new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime() : 
            null;

        let progressBar = '';
        if (execution.status === 'running' && execution.progress !== undefined) {
            progressBar = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${execution.progress}%"></div>
                </div>
            `;
        }

        return `
            <div class="execution-item ${statusClass}" data-execution-id="${execution.id}">
                <div class="execution-header">
                    <div class="execution-title">
                        <span class="icon">${getStatusIcon(execution.status)}</span>
                        ${execution.agentName}
                    </div>
                    <div class="execution-status ${statusClass}">${execution.status}</div>
                </div>
                <div class="execution-details">
                    <div>Task: ${execution.task.substring(0, 80)}${execution.task.length > 80 ? '...' : ''}</div>
                    <div>Started: ${startTime}${duration ? ` • Duration: ${duration}ms` : ''}</div>
                </div>
                ${progressBar}
            </div>
        `;
    }

    // Get status icon
    function getStatusIcon(status) {
        const icons = {
            queued: '⏳',
            running: '🔄',
            completed: '✅',
            failed: '❌',
            cancelled: '🚫'
        };
        return icons[status] || '❓';
    }

    // Update debug info display
    function updateDebugInfo(debugData) {
        const container = document.getElementById('debug-info-container');
        if (!container) return;

        const debugInfo = `
            <div class="debug-info">
                <div class="debug-metric">
                    <span class="debug-metric-label">Active Sessions:</span>
                    <span class="debug-metric-value">${debugData.activeSessions || 0}</span>
                </div>
                <div class="debug-metric">
                    <span class="debug-metric-label">Breakpoints:</span>
                    <span class="debug-metric-value">${debugData.totalBreakpoints || 0}</span>
                </div>
                <div class="debug-metric">
                    <span class="debug-metric-label">Visualizer:</span>
                    <span class="debug-metric-value">${debugData.visualizerStatus || 'stopped'}</span>
                </div>
            </div>
        `;
        
        container.innerHTML = debugInfo;
    }

    // Event handlers
    function handleRefresh() {
        setLoading(true);
        vscode.postMessage({ command: 'refresh-data' });
    }

    function handleInvokeAgent() {
        vscode.postMessage({ command: 'invoke-agent', agentName: 'coder', task: 'Quick analysis' });
    }

    function handleOpenDebugger() {
        vscode.postMessage({ command: 'open-debug-visualizer' });
    }

    function handleShowTraces() {
        vscode.postMessage({ command: 'show-trace-details', traceId: 'latest' });
    }

    function handleExecutionClick(execution) {
        // Show execution details or cancel if running
        if (execution.status === 'running' || execution.status === 'queued') {
            const confirmCancel = confirm(`Cancel execution of ${execution.agentName}?`);
            if (confirmCancel) {
                vscode.postMessage({ 
                    command: 'cancel-execution', 
                    executionId: execution.id 
                });
            }
        } else {
            // Show details for completed executions
            vscode.postMessage({
                command: 'show-execution-details',
                executionId: execution.id
            });
        }
    }

    // Handle real-time updates
    function handleExecutionStarted(execution) {
        // Add new execution to the top of the list
        state.executions.unshift(execution);
        updateExecutionsList(state.executions);
        showNotification(`Started: ${execution.agentName}`, 'info');
    }

    function handleExecutionCompleted(execution) {
        // Update execution in the list
        updateExecutionInList(execution);
        showNotification(`Completed: ${execution.agentName}`, 'success');
    }

    function handleExecutionProgress(execution) {
        // Update progress for the execution
        updateExecutionInList(execution);
    }

    function handleExecutionCancelled(data) {
        // Update execution status
        const execution = state.executions.find(e => e.id === data.executionId);
        if (execution) {
            execution.status = 'cancelled';
            updateExecutionsList(state.executions);
        }
        showNotification('Execution cancelled', 'info');
    }

    function handleAgentResult(data) {
        showNotification(`${data.agentName} completed successfully`, 'success');
    }

    function handleAgentError(data) {
        showNotification(`${data.agentName} failed: ${data.error}`, 'error');
    }

    function handleRevealData(data) {
        // Handle specific data reveals (e.g., focusing on specific execution)
        if (data.executionId) {
            const element = document.querySelector(`[data-execution-id="${data.executionId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                element.style.backgroundColor = 'var(--vscode-list-focusBackground)';
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 2000);
            }
        }
    }

    // Utility functions
    function updateExecutionInList(execution) {
        const index = state.executions.findIndex(e => e.id === execution.id);
        if (index !== -1) {
            state.executions[index] = execution;
            updateExecutionsList(state.executions);
        }
    }

    function updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    function setLoading(loading) {
        state.isLoading = loading;
        
        // Update refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('.icon');
            if (loading) {
                refreshBtn.disabled = true;
                if (icon) icon.classList.add('spinning');
            } else {
                refreshBtn.disabled = false;
                if (icon) icon.classList.remove('spinning');
            }
        }
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = type === 'error' ? 'error-message' : 'success-message';
        notification.textContent = message;
        
        // Insert at top of container
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(notification, container.firstChild);
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }

    // Theme handling
    function applyTheme() {
        const body = document.body;
        const theme = body.className || 'vscode-dark';
        
        // Apply theme-specific styles
        if (theme.includes('high-contrast')) {
            body.classList.add('vscode-high-contrast');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Apply theme
    applyTheme();

    // Save and restore state
    function saveState() {
        vscode.setState({ executions: state.executions });
    }

    function restoreState() {
        const previousState = vscode.getState();
        if (previousState) {
            state.executions = previousState.executions || [];
        }
    }

    // Restore state on load
    restoreState();

    // Save state periodically
    setInterval(saveState, 10000); // Every 10 seconds

})();