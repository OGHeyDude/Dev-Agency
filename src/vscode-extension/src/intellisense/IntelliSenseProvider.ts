/**
 * IntelliSense Provider for VS Code Extension
 * Provides agent-generated code completions, hover information, and code actions
 * 
 * @file IntelliSenseProvider.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import { AgentManager, CodeSuggestion } from '../core/AgentManager';
import { ContextManager } from '../context/ContextManager';
import { ExtensionLogger } from '../utils/ExtensionLogger';

export class IntelliSenseProvider implements 
  vscode.CompletionItemProvider,
  vscode.HoverProvider,
  vscode.CodeActionProvider {

  private completionCache = new Map<string, { suggestions: vscode.CompletionItem[]; timestamp: number }>();
  private hoverCache = new Map<string, { hover: vscode.Hover; timestamp: number }>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    private agentManager: AgentManager,
    private contextManager: ContextManager,
    private logger: ExtensionLogger
  ) {}

  /**
   * Provide completion items (IntelliSense suggestions)
   */
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[]> {
    
    if (token.isCancellationRequested) return [];

    try {
      // Get context around cursor
      const codeContext = this.getCodeContext(document, position);
      const cacheKey = this.generateCacheKey(document, position, codeContext);
      
      // Check cache first
      const cached = this.completionCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        this.logger.debug('Using cached completion items');
        return cached.suggestions;
      }

      // Determine which agent to use based on context
      const agentName = this.selectAgentForCompletion(document, codeContext);
      if (!agentName) return [];

      // Get agent suggestions
      const suggestions = await this.getAgentSuggestions(agentName, document, position, codeContext);
      
      // Convert to VS Code completion items
      const completionItems = this.convertToCompletionItems(suggestions, document, position);
      
      // Cache results
      this.completionCache.set(cacheKey, {
        suggestions: completionItems,
        timestamp: Date.now()
      });

      // Clean up old cache entries periodically
      this.cleanupCache();

      return completionItems;

    } catch (error) {
      this.logger.error('Error providing completion items:', error);
      return [];
    }
  }

  /**
   * Provide hover information
   */
  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | undefined> {

    if (token.isCancellationRequested) return undefined;

    try {
      const wordRange = document.getWordRangeAtPosition(position);
      if (!wordRange) return undefined;

      const word = document.getText(wordRange);
      const cacheKey = `${document.uri.toString()}-${word}-${position.line}`;

      // Check cache
      const cached = this.hoverCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.hover;
      }

      // Get context for hover
      const codeContext = this.getCodeContext(document, position);
      
      // Use architect agent for analysis
      const agent = await this.agentManager.getAgent('architect');
      if (!agent) return undefined;

      // Get agent analysis
      const analysis = await this.getHoverAnalysis(word, codeContext, document);
      if (!analysis) return undefined;

      // Create hover content
      const hover = new vscode.Hover(
        new vscode.MarkdownString(analysis),
        wordRange
      );

      // Cache result
      this.hoverCache.set(cacheKey, {
        hover,
        timestamp: Date.now()
      });

      return hover;

    } catch (error) {
      this.logger.error('Error providing hover:', error);
      return undefined;
    }
  }

  /**
   * Provide code actions
   */
  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {

    if (token.isCancellationRequested) return [];

    try {
      const actions: vscode.CodeAction[] = [];
      const selectedText = document.getText(range);

      // Add agent-based code actions
      actions.push(...await this.createAgentCodeActions(document, range, selectedText));

      // Add diagnostic-based actions if there are problems
      if (context.diagnostics.length > 0) {
        actions.push(...await this.createDiagnosticActions(document, range, context.diagnostics));
      }

      return actions;

    } catch (error) {
      this.logger.error('Error providing code actions:', error);
      return [];
    }
  }

  /**
   * Get code context around position
   */
  private getCodeContext(document: vscode.TextDocument, position: vscode.Position): string {
    const startLine = Math.max(0, position.line - 10);
    const endLine = Math.min(document.lineCount - 1, position.line + 10);
    
    const startPos = new vscode.Position(startLine, 0);
    const endPos = new vscode.Position(endLine, document.lineAt(endLine).text.length);
    
    return document.getText(new vscode.Range(startPos, endPos));
  }

  /**
   * Generate cache key for completion context
   */
  private generateCacheKey(document: vscode.TextDocument, position: vscode.Position, context: string): string {
    const contextHash = this.simpleHash(context);
    return `${document.uri.toString()}-${position.line}-${position.character}-${contextHash}`;
  }

  /**
   * Simple hash function for context
   */
  private simpleHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * Select appropriate agent for completion
   */
  private selectAgentForCompletion(document: vscode.TextDocument, context: string): string | null {
    const languageId = document.languageId;
    const lowerContext = context.toLowerCase();

    // Check for specific patterns to determine agent
    if (lowerContext.includes('test') || lowerContext.includes('spec')) {
      return 'tester';
    }
    
    if (lowerContext.includes('security') || lowerContext.includes('auth') || lowerContext.includes('password')) {
      return 'security';
    }
    
    if (lowerContext.includes('performance') || lowerContext.includes('optimize')) {
      return 'performance';
    }
    
    if (lowerContext.includes('interface') || lowerContext.includes('architecture') || lowerContext.includes('design')) {
      return 'architect';
    }

    // Default to coder for most programming contexts
    if (['typescript', 'javascript', 'python', 'go', 'rust', 'java', 'csharp'].includes(languageId)) {
      return 'coder';
    }

    if (languageId === 'markdown') {
      return 'documenter';
    }

    return 'coder'; // Default fallback
  }

  /**
   * Get suggestions from agent
   */
  private async getAgentSuggestions(
    agentName: string,
    document: vscode.TextDocument,
    position: vscode.Position,
    context: string
  ): Promise<CodeSuggestion[]> {
    
    const currentLine = document.lineAt(position.line).text;
    const beforeCursor = currentLine.substring(0, position.character);
    const afterCursor = currentLine.substring(position.character);

    const task = this.buildCompletionTask(agentName, beforeCursor, afterCursor, context, document.languageId);
    
    try {
      const result = await this.agentManager.invokeAgent(agentName, {
        task,
        contextPath: document.fileName,
        format: 'json',
        timeout: 10000 // 10 second timeout for completions
      });

      return result.suggestions || [];

    } catch (error) {
      this.logger.warn(`Failed to get suggestions from ${agentName}:`, error);
      return [];
    }
  }

  /**
   * Build completion task for agent
   */
  private buildCompletionTask(
    agentName: string,
    beforeCursor: string,
    afterCursor: string,
    context: string,
    languageId: string
  ): string {
    
    const taskTemplates: Record<string, string> = {
      coder: `Complete the code at the cursor position. Context before cursor: "${beforeCursor}". Context after cursor: "${afterCursor}". Language: ${languageId}. Provide 3-5 relevant completions.`,
      tester: `Suggest test code completions for the current context. Before cursor: "${beforeCursor}". Language: ${languageId}.`,
      security: `Suggest secure code completions and identify potential security issues. Before cursor: "${beforeCursor}". Language: ${languageId}.`,
      performance: `Suggest performance-optimized code completions. Before cursor: "${beforeCursor}". Language: ${languageId}.`,
      architect: `Suggest architectural patterns and structure completions. Before cursor: "${beforeCursor}". Language: ${languageId}.`,
      documenter: `Suggest documentation and comments. Before cursor: "${beforeCursor}". Language: ${languageId}.`
    };

    return taskTemplates[agentName] || taskTemplates.coder;
  }

  /**
   * Convert agent suggestions to VS Code completion items
   */
  private convertToCompletionItems(
    suggestions: CodeSuggestion[],
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] {
    
    return suggestions.map((suggestion, index) => {
      const item = new vscode.CompletionItem(
        suggestion.description || `Agent Suggestion ${index + 1}`,
        this.getCompletionItemKind(suggestion.type, document.languageId)
      );

      item.insertText = suggestion.code;
      item.detail = `Dev-Agency (${Math.round((suggestion.confidence || 0.8) * 100)}% confidence)`;
      item.documentation = new vscode.MarkdownString(
        `**Agent Suggestion**\n\n\`\`\`${document.languageId}\n${suggestion.code}\n\`\`\`\n\n${suggestion.description || ''}`
      );

      // Set sort text to prioritize based on confidence
      item.sortText = String(1 - (suggestion.confidence || 0.8)).padStart(10, '0') + suggestion.id;

      // Add completion item tags if appropriate
      if (suggestion.confidence && suggestion.confidence < 0.6) {
        item.tags = [vscode.CompletionItemTag.Deprecated]; // Low confidence
      }

      // Set range if provided
      if (suggestion.range) {
        item.range = suggestion.range;
      }

      return item;
    });
  }

  /**
   * Get appropriate completion item kind
   */
  private getCompletionItemKind(suggestionType: string, languageId: string): vscode.CompletionItemKind {
    switch (suggestionType) {
      case 'completion':
        return vscode.CompletionItemKind.Text;
      case 'replacement':
        return vscode.CompletionItemKind.Snippet;
      case 'insertion':
        return vscode.CompletionItemKind.Snippet;
      default:
        // Try to infer from language context
        if (['typescript', 'javascript'].includes(languageId)) {
          return vscode.CompletionItemKind.Function;
        }
        return vscode.CompletionItemKind.Text;
    }
  }

  /**
   * Get hover analysis from agent
   */
  private async getHoverAnalysis(word: string, context: string, document: vscode.TextDocument): Promise<string | null> {
    try {
      const task = `Analyze and explain the term "${word}" in this code context. Provide a concise explanation suitable for a hover tooltip.`;
      
      const result = await this.agentManager.invokeAgent('architect', {
        task,
        contextPath: document.fileName,
        format: 'markdown',
        timeout: 5000
      });

      return result.output || null;

    } catch (error) {
      this.logger.debug('Failed to get hover analysis:', error);
      return null;
    }
  }

  /**
   * Create agent-based code actions
   */
  private async createAgentCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    selectedText: string
  ): Promise<vscode.CodeAction[]> {
    
    const actions: vscode.CodeAction[] = [];

    // Add "Explain Code" action
    const explainAction = new vscode.CodeAction(
      '$(lightbulb) Explain Code',
      vscode.CodeActionKind.Empty
    );
    explainAction.command = {
      command: 'dev-agency.explainCode',
      title: 'Explain Code',
      arguments: [document.uri, range, selectedText]
    };
    actions.push(explainAction);

    // Add "Optimize Code" action
    const optimizeAction = new vscode.CodeAction(
      '$(zap) Optimize Code',
      vscode.CodeActionKind.RefactorRewrite
    );
    optimizeAction.command = {
      command: 'dev-agency.optimizeCode',
      title: 'Optimize Code',
      arguments: [document.uri, range, selectedText]
    };
    actions.push(optimizeAction);

    // Add "Security Review" action
    const securityAction = new vscode.CodeAction(
      '$(shield) Security Review',
      vscode.CodeActionKind.Empty
    );
    securityAction.command = {
      command: 'dev-agency.securityReview',
      title: 'Security Review',
      arguments: [document.uri, range, selectedText]
    };
    actions.push(securityAction);

    // Add "Generate Tests" action for functions
    if (this.looksLikeFunction(selectedText)) {
      const testAction = new vscode.CodeAction(
        '$(beaker) Generate Tests',
        vscode.CodeActionKind.Empty
      );
      testAction.command = {
        command: 'dev-agency.generateTests',
        title: 'Generate Tests',
        arguments: [document.uri, range, selectedText]
      };
      actions.push(testAction);
    }

    // Add "Add Documentation" action
    const docAction = new vscode.CodeAction(
      '$(book) Add Documentation',
      vscode.CodeActionKind.Empty
    );
    docAction.command = {
      command: 'dev-agency.addDocumentation',
      title: 'Add Documentation',
      arguments: [document.uri, range, selectedText]
    };
    actions.push(docAction);

    return actions;
  }

  /**
   * Create diagnostic-based code actions
   */
  private async createDiagnosticActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    diagnostics: readonly vscode.Diagnostic[]
  ): Promise<vscode.CodeAction[]> {
    
    const actions: vscode.CodeAction[] = [];

    // Group diagnostics by severity
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);

    if (errors.length > 0) {
      const fixErrorAction = new vscode.CodeAction(
        `$(tools) Fix ${errors.length} Error${errors.length > 1 ? 's' : ''}`,
        vscode.CodeActionKind.QuickFix
      );
      fixErrorAction.command = {
        command: 'dev-agency.fixErrors',
        title: 'Fix Errors',
        arguments: [document.uri, range, errors]
      };
      fixErrorAction.isPreferred = true;
      actions.push(fixErrorAction);
    }

    if (warnings.length > 0) {
      const fixWarningAction = new vscode.CodeAction(
        `$(warning) Fix ${warnings.length} Warning${warnings.length > 1 ? 's' : ''}`,
        vscode.CodeActionKind.QuickFix
      );
      fixWarningAction.command = {
        command: 'dev-agency.fixWarnings',
        title: 'Fix Warnings',
        arguments: [document.uri, range, warnings]
      };
      actions.push(fixWarningAction);
    }

    return actions;
  }

  /**
   * Check if text looks like a function definition
   */
  private looksLikeFunction(text: string): boolean {
    const functionPatterns = [
      /function\s+\w+\s*\(/,
      /\w+\s*\([^)]*\)\s*\{/,
      /def\s+\w+\s*\(/,
      /fn\s+\w+\s*\(/,
      /func\s+\w+\s*\(/
    ];

    return functionPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    
    // Clean completion cache
    for (const [key, value] of this.completionCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.completionCache.delete(key);
      }
    }

    // Clean hover cache
    for (const [key, value] of this.hoverCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.hoverCache.delete(key);
      }
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.completionCache.clear();
    this.hoverCache.clear();
    this.logger.debug('IntelliSense caches cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { completions: number; hovers: number } {
    return {
      completions: this.completionCache.size,
      hovers: this.hoverCache.size
    };
  }
}