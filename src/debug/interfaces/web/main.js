/**
 * Debug Visualizer - Main JavaScript Application
 */

class DebugVisualizerApp {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.currentTrace = null;
        this.traces = new Map();
        
        this.init();
    }

    init() {
        this.initializeUI();
        this.setupEventListeners();
        this.initializeComponents();
        
        // Auto-connect on load
        this.connect();
    }

    initializeUI() {
        // Update connection status
        this.updateConnectionStatus('disconnected');
        
        // Initialize tab system
        this.initializeTabs();
        
        // Initialize modals
        this.initializeModals();
    }

    initializeTabs() {
        const tabLinks = document.querySelectorAll('[data-tab]');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const tabName = link.dataset.tab;
                
                // Update active link
                tabLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Update active panel
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                });
                document.getElementById(`${tabName}-panel`).classList.add('active');
                
                // Load tab-specific data
                this.loadTabData(tabName);
            });
        });
    }

    initializeModals() {
        // Add breakpoint modal
        const modal = document.getElementById('add-breakpoint-modal');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-breakpoint');
        
        closeBtn.addEventListener('click', () => this.hideModal(modal));
        cancelBtn.addEventListener('click', () => this.hideModal(modal));
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal(modal);
            }
        });
    }

    showModal(modal) {
        modal.classList.add('show');
    }

    hideModal(modal) {
        modal.classList.remove('show');
    }

    setupEventListeners() {
        // Connection controls
        document.getElementById('connect-btn').addEventListener('click', () => {
            if (this.isConnected) {
                this.disconnect();
            } else {
                this.connect();
            }
        });

        // Refresh buttons
        document.getElementById('refresh-traces').addEventListener('click', () => {
            this.loadTraces();
        });

        // Breakpoint controls
        document.getElementById('add-breakpoint').addEventListener('click', () => {
            this.showAddBreakpointModal();
        });

        document.getElementById('save-breakpoint').addEventListener('click', () => {
            this.saveBreakpoint();
        });

        // Step execution controls
        document.getElementById('step-over')?.addEventListener('click', () => {
            this.stepExecution('step-over');
        });

        document.getElementById('step-into')?.addEventListener('click', () => {
            this.stepExecution('step-into');
        });

        document.getElementById('continue')?.addEventListener('click', () => {
            this.stepExecution('continue');
        });

        // Filter controls
        document.getElementById('agent-filter').addEventListener('change', () => {
            this.filterTraces();
        });

        document.getElementById('status-filter').addEventListener('change', () => {
            this.filterTraces();
        });
    }

    initializeComponents() {
        // Initialize visualization components
        this.flowDiagram = new FlowDiagramComponent();
        this.performanceAnalyzer = new PerformanceAnalyzerComponent();
        this.tokenVisualizer = new TokenVisualizerComponent();
        this.decisionTree = new DecisionTreeComponent();
        this.breakpointManager = new BreakpointManagerComponent();
    }

    // WebSocket Connection Management
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        this.updateConnectionStatus('connecting');
        
        const wsUrl = `ws://${window.location.hostname}:${window.location.port || 8081}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            this.isConnected = true;
            this.updateConnectionStatus('connected');
            this.loadInitialData();
        };

        this.ws.onclose = () => {
            this.isConnected = false;
            this.updateConnectionStatus('disconnected');
            
            // Attempt reconnection after 5 seconds
            setTimeout(() => {
                if (!this.isConnected) {
                    this.connect();
                }
            }, 5000);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionStatus('disconnected');
        };

        this.ws.onmessage = (event) => {
            this.handleWebSocketMessage(JSON.parse(event.data));
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.isConnected = false;
        this.updateConnectionStatus('disconnected');
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        const button = document.getElementById('connect-btn');

        indicator.className = `status-indicator ${status}`;
        text.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        
        if (status === 'connected') {
            button.textContent = 'Disconnect';
            button.className = 'btn btn-danger';
        } else {
            button.textContent = 'Connect';
            button.className = 'btn btn-primary';
        }
    }

    // WebSocket Message Handling
    handleWebSocketMessage(message) {
        console.log('Received message:', message);

        switch (message.type) {
            case 'connection:welcome':
                this.handleWelcomeMessage(message.data);
                break;
            case 'trace:started':
                this.handleTraceStarted(message.data);
                break;
            case 'trace:completed':
                this.handleTraceCompleted(message.data);
                break;
            case 'trace:step-added':
                this.handleStepAdded(message.data);
                break;
            case 'breakpoint:hit':
                this.handleBreakpointHit(message.data);
                break;
            case 'performance:bottleneck-detected':
                this.handleBottleneckDetected(message.data);
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    }

    handleWelcomeMessage(data) {
        console.log('Connected to debug server:', data);
        this.loadInitialData();
    }

    handleTraceStarted(trace) {
        this.traces.set(trace.executionId, trace);
        this.updateTracesList();
        this.updateStats();
    }

    handleTraceCompleted(trace) {
        this.traces.set(trace.executionId, trace);
        this.updateTracesList();
        this.updateStats();
        
        // If this is the currently selected trace, update details
        if (this.currentTrace && this.currentTrace.executionId === trace.executionId) {
            this.showTraceDetails(trace);
        }
    }

    handleStepAdded(data) {
        const trace = this.traces.get(data.executionId);
        if (trace) {
            trace.steps = trace.steps || [];
            trace.steps.push(data.step);
            
            // Update flow diagram if visible
            if (this.flowDiagram && this.currentTrace?.executionId === data.executionId) {
                this.flowDiagram.updateTrace(trace);
            }
        }
    }

    handleBreakpointHit(data) {
        console.log('Breakpoint hit:', data);
        
        // Show step execution controls
        const stepExecution = document.getElementById('step-execution');
        stepExecution.style.display = 'block';
        
        // Update variables view
        this.updateVariablesView(data.variables || {});
        
        // Switch to breakpoints tab if not already there
        document.querySelector('[data-tab="breakpoints"]').click();
    }

    handleBottleneckDetected(data) {
        console.warn('Performance bottleneck detected:', data);
        
        // Show notification or update performance tab
        this.showNotification('Performance bottleneck detected', 'warning');
    }

    // Data Loading
    async loadInitialData() {
        try {
            await this.loadTraces();
            await this.loadBreakpoints();
            this.updateStats();
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    async loadTraces() {
        try {
            const response = await fetch('/debug/traces');
            const data = await response.json();
            
            this.traces.clear();
            data.traces.forEach(trace => {
                this.traces.set(trace.executionId, trace);
            });
            
            this.updateTracesList();
            this.populateTraceSelects();
        } catch (error) {
            console.error('Failed to load traces:', error);
        }
    }

    async loadBreakpoints() {
        try {
            const response = await fetch('/debug/breakpoints');
            const data = await response.json();
            
            this.breakpointManager.updateBreakpoints(data.breakpoints);
        } catch (error) {
            console.error('Failed to load breakpoints:', error);
        }
    }

    // UI Updates
    updateTracesList() {
        const container = document.getElementById('traces-list');
        const traces = Array.from(this.traces.values());
        
        container.innerHTML = '';
        
        traces.forEach(trace => {
            const item = this.createTraceListItem(trace);
            container.appendChild(item);
        });
    }

    createTraceListItem(trace) {
        const item = document.createElement('div');
        item.className = 'trace-item';
        item.dataset.executionId = trace.executionId;
        
        const statusClass = trace.status || 'unknown';
        const duration = trace.duration ? `${trace.duration}ms` : 'Running...';
        
        item.innerHTML = `
            <div class="trace-header">
                <div class="trace-title">${trace.agentName}</div>
                <div class="trace-status ${statusClass}">${statusClass}</div>
            </div>
            <div class="trace-meta">
                <div>Duration: ${duration}</div>
                <div>Steps: ${trace.steps ? trace.steps.length : 0}</div>
                <div>Started: ${new Date(trace.startTime).toLocaleTimeString()}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.selectTrace(trace);
        });
        
        return item;
    }

    selectTrace(trace) {
        // Update selected item
        document.querySelectorAll('.trace-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-execution-id="${trace.executionId}"]`)?.classList.add('selected');
        
        this.currentTrace = trace;
        this.showTraceDetails(trace);
    }

    showTraceDetails(trace) {
        const container = document.getElementById('trace-details');
        
        container.innerHTML = `
            <h3>Execution Details</h3>
            <div class="trace-detail-section">
                <h4>Basic Information</h4>
                <p><strong>Agent:</strong> ${trace.agentName}</p>
                <p><strong>Status:</strong> ${trace.status}</p>
                <p><strong>Duration:</strong> ${trace.duration || 'Running...'}ms</p>
                <p><strong>Started:</strong> ${new Date(trace.startTime).toLocaleString()}</p>
                ${trace.endTime ? `<p><strong>Ended:</strong> ${new Date(trace.endTime).toLocaleString()}</p>` : ''}
            </div>
            
            <div class="trace-detail-section">
                <h4>Performance Metrics</h4>
                <p><strong>Memory Usage:</strong> ${trace.performance?.memoryUsage?.peak || 0} MB</p>
                <p><strong>Token Usage:</strong> ${trace.tokenUsage?.totalTokens || 0} tokens</p>
                <p><strong>Steps:</strong> ${trace.steps ? trace.steps.length : 0}</p>
            </div>
            
            ${trace.error ? `
                <div class="trace-detail-section">
                    <h4>Error Information</h4>
                    <p class="text-error">${trace.error.message}</p>
                </div>
            ` : ''}
            
            <div class="trace-actions">
                <button class="btn btn-primary" onclick="app.analyzeTracePerformance('${trace.executionId}')">
                    Analyze Performance
                </button>
                <button class="btn btn-secondary" onclick="app.showFlowDiagram('${trace.executionId}')">
                    View Flow
                </button>
            </div>
        `;
    }

    populateTraceSelects() {
        const selects = [
            'flow-trace-select',
            'perf-trace-select',
            'token-trace-select',
            'decision-trace-select'
        ];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            select.innerHTML = '<option value="">Select a trace</option>';
            
            this.traces.forEach(trace => {
                const option = document.createElement('option');
                option.value = trace.executionId;
                option.textContent = `${trace.agentName} - ${new Date(trace.startTime).toLocaleTimeString()}`;
                select.appendChild(option);
            });
        });
    }

    updateStats() {
        const activeTraces = Array.from(this.traces.values()).filter(t => t.status === 'running').length;
        const totalBreakpoints = this.breakpointManager?.getBreakpointCount() || 0;
        
        document.getElementById('active-traces').textContent = activeTraces;
        document.getElementById('active-breakpoints').textContent = totalBreakpoints;
        document.getElementById('detected-bottlenecks').textContent = '0'; // TODO: implement
    }

    // Tab-specific data loading
    loadTabData(tabName) {
        switch (tabName) {
            case 'traces':
                this.loadTraces();
                break;
            case 'flow':
                // Flow diagram will be loaded when trace is selected
                break;
            case 'performance':
                // Performance data will be loaded when analysis is requested
                break;
            case 'tokens':
                // Token visualization will be loaded when trace is selected
                break;
            case 'decisions':
                // Decision tree will be loaded when trace is selected
                break;
            case 'breakpoints':
                this.loadBreakpoints();
                break;
        }
    }

    // Utility methods
    filterTraces() {
        const agentFilter = document.getElementById('agent-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        
        const traceItems = document.querySelectorAll('.trace-item');
        
        traceItems.forEach(item => {
            const executionId = item.dataset.executionId;
            const trace = this.traces.get(executionId);
            
            let show = true;
            
            if (agentFilter && trace.agentName !== agentFilter) {
                show = false;
            }
            
            if (statusFilter && trace.status !== statusFilter) {
                show = false;
            }
            
            item.style.display = show ? 'block' : 'none';
        });
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        console.log(`[${type.toUpperCase()}] ${message}`);
        // TODO: Implement proper notification system
    }

    // Breakpoint management
    showAddBreakpointModal() {
        const modal = document.getElementById('add-breakpoint-modal');
        
        // Populate agent select
        const agentSelect = document.getElementById('breakpoint-agent');
        agentSelect.innerHTML = '<option value="">Any Agent</option>';
        
        const uniqueAgents = new Set();
        this.traces.forEach(trace => uniqueAgents.add(trace.agentName));
        
        uniqueAgents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent;
            option.textContent = agent;
            agentSelect.appendChild(option);
        });
        
        this.showModal(modal);
    }

    async saveBreakpoint() {
        const form = document.getElementById('breakpoint-form');
        const formData = new FormData(form);
        
        const breakpointData = {
            name: formData.get('name'),
            agentName: formData.get('agentName') || undefined,
            stepName: formData.get('stepName') || undefined,
            condition: formData.get('condition') || undefined,
            description: formData.get('description') || undefined
        };
        
        try {
            const response = await fetch('/debug/breakpoints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(breakpointData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.hideModal(document.getElementById('add-breakpoint-modal'));
                form.reset();
                this.loadBreakpoints();
                this.showNotification('Breakpoint added successfully', 'success');
            } else {
                throw new Error('Failed to create breakpoint');
            }
        } catch (error) {
            console.error('Error saving breakpoint:', error);
            this.showNotification('Failed to create breakpoint', 'error');
        }
    }

    // Analysis methods
    async analyzeTracePerformance(executionId) {
        try {
            const response = await fetch(`/debug/performance/${executionId}`);
            const analysis = await response.json();
            
            // Switch to performance tab and show results
            document.querySelector('[data-tab="performance"]').click();
            this.performanceAnalyzer.showAnalysis(analysis);
        } catch (error) {
            console.error('Failed to analyze performance:', error);
            this.showNotification('Failed to analyze performance', 'error');
        }
    }

    showFlowDiagram(executionId) {
        const trace = this.traces.get(executionId);
        if (trace) {
            document.querySelector('[data-tab="flow"]').click();
            this.flowDiagram.renderTrace(trace);
        }
    }

    // Step execution
    stepExecution(command) {
        if (!this.currentTrace) return;
        
        const message = {
            type: 'execution:step',
            data: {
                command,
                executionId: this.currentTrace.executionId
            }
        };
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    updateVariablesView(variables) {
        const container = document.getElementById('variables-list');
        container.innerHTML = '';
        
        Object.entries(variables).forEach(([name, value]) => {
            const item = document.createElement('div');
            item.className = 'variable-item';
            item.innerHTML = `
                <span class="variable-name">${name}</span>
                <span class="variable-value">${JSON.stringify(value)}</span>
            `;
            container.appendChild(item);
        });
    }
}

// Component stubs - these would be implemented as separate files
class FlowDiagramComponent {
    renderTrace(trace) {
        console.log('Rendering flow diagram for trace:', trace);
        // TODO: Implement D3.js/Cytoscape.js flow visualization
    }
    
    updateTrace(trace) {
        console.log('Updating flow diagram:', trace);
        // TODO: Update existing visualization
    }
}

class PerformanceAnalyzerComponent {
    showAnalysis(analysis) {
        console.log('Showing performance analysis:', analysis);
        
        // Update performance scores
        document.getElementById('performance-score').textContent = 
            Math.round(analysis.performanceScore);
        document.getElementById('efficiency-score').textContent = 
            Math.round(analysis.efficiencyScore);
        document.getElementById('reliability-score').textContent = 
            Math.round(analysis.reliabilityScore);
            
        // Show bottlenecks
        this.showBottlenecks(analysis.bottlenecks);
        
        // Show optimizations
        this.showOptimizations(analysis.optimizations);
    }
    
    showBottlenecks(bottlenecks) {
        const container = document.getElementById('bottlenecks-list');
        container.innerHTML = '';
        
        bottlenecks.forEach(bottleneck => {
            const item = document.createElement('div');
            item.className = `bottleneck-item ${bottleneck.severity}`;
            item.innerHTML = `
                <h4>${bottleneck.type} Bottleneck</h4>
                <p>${bottleneck.description}</p>
                <div class="bottleneck-suggestions">
                    ${bottleneck.suggestions.map(s => `<li>${s}</li>`).join('')}
                </div>
            `;
            container.appendChild(item);
        });
    }
    
    showOptimizations(optimizations) {
        const container = document.getElementById('optimizations-list');
        container.innerHTML = '';
        
        optimizations.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'optimization-item';
            item.innerHTML = `
                <h4>${opt.description}</h4>
                <p>Priority: ${opt.priority}</p>
                <p>Estimated improvement: ${opt.estimatedImprovement.durationReduction}ms</p>
                <p>Effort: ${opt.implementation.effort}</p>
            `;
            container.appendChild(item);
        });
    }
}

class TokenVisualizerComponent {
    // TODO: Implement token usage visualization
}

class DecisionTreeComponent {
    // TODO: Implement decision tree visualization
}

class BreakpointManagerComponent {
    updateBreakpoints(breakpoints) {
        console.log('Updating breakpoints:', breakpoints);
        // TODO: Implement breakpoint list management
    }
    
    getBreakpointCount() {
        return 0; // TODO: Return actual count
    }
}

// Initialize the application
const app = new DebugVisualizerApp();