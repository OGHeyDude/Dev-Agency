/**
 * Context Manager for VS Code Extension
 * Handles workspace context analysis and context-aware operations
 * 
 * @file ContextManager.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { ExtensionLogger } from '../utils/ExtensionLogger';

export interface WorkspaceContext {
  workspaceName?: string;
  workspacePath?: string;
  projectType?: string;
  languages: string[];
  frameworks: string[];
  packageManagers: string[];
  hasTests: boolean;
  hasDocumentation: boolean;
  gitRepository?: GitInfo;
  structure: FileStructure;
}

export interface FileContext {
  file?: string;
  language?: string;
  selection?: vscode.Selection;
  surroundingCode?: string;
  imports?: string[];
  exports?: string[];
  functions?: FunctionInfo[];
  classes?: ClassInfo[];
}

export interface GitInfo {
  isGitRepo: boolean;
  currentBranch?: string;
  hasUncommittedChanges?: boolean;
  remoteUrl?: string;
}

export interface FileStructure {
  totalFiles: number;
  directories: string[];
  filesByExtension: Record<string, number>;
  largestFiles: Array<{ path: string; size: number }>;
}

export interface FunctionInfo {
  name: string;
  startLine: number;
  endLine: number;
  parameters: string[];
  returnType?: string;
}

export interface ClassInfo {
  name: string;
  startLine: number;
  endLine: number;
  methods: string[];
  properties: string[];
}

export class ContextManager {
  private workspaceContext: WorkspaceContext | null = null;
  private fileWatcher?: vscode.FileSystemWatcher;
  private contextCache = new Map<string, any>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    private configManager: ConfigurationManager,
    private logger: ExtensionLogger
  ) {}

  /**
   * Initialize the context manager
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing ContextManager...');

      // Analyze workspace context
      await this.analyzeWorkspaceContext();

      // Setup file system watchers
      this.setupFileWatchers();

      // Setup event listeners
      this.setupEventListeners();

      this.logger.info('ContextManager initialized');

    } catch (error) {
      this.logger.error('Failed to initialize ContextManager:', error);
      throw error;
    }
  }

  /**
   * Analyze workspace context
   */
  private async analyzeWorkspaceContext(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this.logger.debug('No workspace folder available');
      return;
    }

    try {
      const workspacePath = workspaceFolder.uri.fsPath;
      const workspaceName = workspaceFolder.name;

      this.logger.debug(`Analyzing workspace: ${workspaceName} at ${workspacePath}`);

      const context: WorkspaceContext = {
        workspaceName,
        workspacePath,
        projectType: await this.detectProjectType(workspacePath),
        languages: await this.detectLanguages(workspacePath),
        frameworks: await this.detectFrameworks(workspacePath),
        packageManagers: await this.detectPackageManagers(workspacePath),
        hasTests: await this.hasTestFiles(workspacePath),
        hasDocumentation: await this.hasDocumentationFiles(workspacePath),
        gitRepository: await this.analyzeGitRepository(workspacePath),
        structure: await this.analyzeFileStructure(workspacePath)
      };

      this.workspaceContext = context;
      this.logger.info(`Workspace context analyzed: ${context.projectType} project with ${context.languages.join(', ')}`);

    } catch (error) {
      this.logger.error('Failed to analyze workspace context:', error);
    }
  }

  /**
   * Detect project type
   */
  private async detectProjectType(workspacePath: string): Promise<string> {
    const packageJsonPath = path.join(workspacePath, 'package.json');
    const cargoTomlPath = path.join(workspacePath, 'Cargo.toml');
    const requirementsPath = path.join(workspacePath, 'requirements.txt');
    const pyprojectPath = path.join(workspacePath, 'pyproject.toml');
    const goModPath = path.join(workspacePath, 'go.mod');
    const pomXmlPath = path.join(workspacePath, 'pom.xml');
    const csprojPath = path.join(workspacePath, '*.csproj');

    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
        return 'React Application';
      }
      if (packageJson.dependencies?.vue || packageJson.devDependencies?.vue) {
        return 'Vue.js Application';
      }
      if (packageJson.dependencies?.angular || packageJson.devDependencies?.angular) {
        return 'Angular Application';
      }
      if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
        return 'Next.js Application';
      }
      if (packageJson.dependencies?.express) {
        return 'Node.js/Express Application';
      }
      return 'Node.js Project';
    }

    if (await fs.pathExists(cargoTomlPath)) {
      return 'Rust Project';
    }

    if (await fs.pathExists(requirementsPath) || await fs.pathExists(pyprojectPath)) {
      return 'Python Project';
    }

    if (await fs.pathExists(goModPath)) {
      return 'Go Project';
    }

    if (await fs.pathExists(pomXmlPath)) {
      return 'Java/Maven Project';
    }

    // Check for C# project files
    try {
      const csprojFiles = await vscode.workspace.findFiles('*.csproj', null, 1);
      if (csprojFiles.length > 0) {
        return 'C# Project';
      }
    } catch (error) {
      // Ignore error
    }

    return 'Generic Project';
  }

  /**
   * Detect programming languages
   */
  private async detectLanguages(workspacePath: string): Promise<string[]> {
    const languages = new Set<string>();

    try {
      const files = await vscode.workspace.findFiles('**/*.{ts,js,py,rs,go,java,cs,cpp,c,php,rb,swift,kt}', null, 1000);
      
      files.forEach(file => {
        const ext = path.extname(file.fsPath);
        switch (ext) {
          case '.ts': languages.add('TypeScript'); break;
          case '.js': languages.add('JavaScript'); break;
          case '.py': languages.add('Python'); break;
          case '.rs': languages.add('Rust'); break;
          case '.go': languages.add('Go'); break;
          case '.java': languages.add('Java'); break;
          case '.cs': languages.add('C#'); break;
          case '.cpp': case '.c': languages.add('C/C++'); break;
          case '.php': languages.add('PHP'); break;
          case '.rb': languages.add('Ruby'); break;
          case '.swift': languages.add('Swift'); break;
          case '.kt': languages.add('Kotlin'); break;
        }
      });
    } catch (error) {
      this.logger.warn('Failed to detect languages:', error);
    }

    return Array.from(languages);
  }

  /**
   * Detect frameworks and libraries
   */
  private async detectFrameworks(workspacePath: string): Promise<string[]> {
    const frameworks = new Set<string>();

    // Check package.json for Node.js frameworks
    const packageJsonPath = path.join(workspacePath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        Object.keys(dependencies).forEach(dep => {
          if (['react', '@types/react'].includes(dep)) frameworks.add('React');
          if (['vue', '@vue/core'].includes(dep)) frameworks.add('Vue.js');
          if (dep.startsWith('@angular/')) frameworks.add('Angular');
          if (['next', 'next-app'].includes(dep)) frameworks.add('Next.js');
          if (['express', 'fastify', 'koa'].includes(dep)) frameworks.add('Node.js Backend');
          if (['jest', '@jest/core', 'vitest'].includes(dep)) frameworks.add('Testing Framework');
          if (['webpack', 'vite', 'rollup'].includes(dep)) frameworks.add('Build Tool');
        });
      } catch (error) {
        this.logger.warn('Failed to parse package.json:', error);
      }
    }

    // Check for other framework indicators
    try {
      const configFiles = await vscode.workspace.findFiles('{tailwind.config.*,nuxt.config.*,gatsby-config.*,svelte.config.*}', null, 10);
      configFiles.forEach(file => {
        const filename = path.basename(file.fsPath);
        if (filename.startsWith('tailwind.config')) frameworks.add('Tailwind CSS');
        if (filename.startsWith('nuxt.config')) frameworks.add('Nuxt.js');
        if (filename.startsWith('gatsby-config')) frameworks.add('Gatsby');
        if (filename.startsWith('svelte.config')) frameworks.add('Svelte');
      });
    } catch (error) {
      this.logger.warn('Failed to detect framework config files:', error);
    }

    return Array.from(frameworks);
  }

  /**
   * Detect package managers
   */
  private async detectPackageManagers(workspacePath: string): Promise<string[]> {
    const packageManagers: string[] = [];

    if (await fs.pathExists(path.join(workspacePath, 'package-lock.json'))) {
      packageManagers.push('npm');
    }
    if (await fs.pathExists(path.join(workspacePath, 'yarn.lock'))) {
      packageManagers.push('yarn');
    }
    if (await fs.pathExists(path.join(workspacePath, 'pnpm-lock.yaml'))) {
      packageManagers.push('pnpm');
    }
    if (await fs.pathExists(path.join(workspacePath, 'requirements.txt'))) {
      packageManagers.push('pip');
    }
    if (await fs.pathExists(path.join(workspacePath, 'Pipfile'))) {
      packageManagers.push('pipenv');
    }
    if (await fs.pathExists(path.join(workspacePath, 'Cargo.toml'))) {
      packageManagers.push('cargo');
    }
    if (await fs.pathExists(path.join(workspacePath, 'go.mod'))) {
      packageManagers.push('go mod');
    }

    return packageManagers;
  }

  /**
   * Check for test files
   */
  private async hasTestFiles(workspacePath: string): Promise<boolean> {
    try {
      const testFiles = await vscode.workspace.findFiles('{**/*.test.*,**/*.spec.*,**/test/**/*,**/tests/**/*,**/__tests__/**/*}', null, 1);
      return testFiles.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check for documentation files
   */
  private async hasDocumentationFiles(workspacePath: string): Promise<boolean> {
    try {
      const docFiles = await vscode.workspace.findFiles('{README.*,CHANGELOG.*,docs/**/*,documentation/**/*,*.md}', null, 5);
      return docFiles.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Analyze Git repository
   */
  private async analyzeGitRepository(workspacePath: string): Promise<GitInfo> {
    const gitInfo: GitInfo = { isGitRepo: false };

    try {
      const gitPath = path.join(workspacePath, '.git');
      if (await fs.pathExists(gitPath)) {
        gitInfo.isGitRepo = true;
        
        // Could use git commands here to get more info
        // For now, just mark as git repo
      }
    } catch (error) {
      this.logger.debug('Failed to analyze git repository:', error);
    }

    return gitInfo;
  }

  /**
   * Analyze file structure
   */
  private async analyzeFileStructure(workspacePath: string): Promise<FileStructure> {
    const structure: FileStructure = {
      totalFiles: 0,
      directories: [],
      filesByExtension: {},
      largestFiles: []
    };

    try {
      const files = await vscode.workspace.findFiles('**/*', '{**/node_modules/**,**/.git/**}', 10000);
      
      structure.totalFiles = files.length;
      const directories = new Set<string>();
      const fileSizes: Array<{ path: string; size: number }> = [];

      for (const file of files) {
        const filePath = file.fsPath;
        const ext = path.extname(filePath);
        const dir = path.dirname(path.relative(workspacePath, filePath));
        
        directories.add(dir);
        
        if (ext) {
          structure.filesByExtension[ext] = (structure.filesByExtension[ext] || 0) + 1;
        }

        // Get file size (up to first 100 files to avoid performance issues)
        if (fileSizes.length < 100) {
          try {
            const stat = await fs.stat(filePath);
            fileSizes.push({ path: path.relative(workspacePath, filePath), size: stat.size });
          } catch (error) {
            // Ignore file access errors
          }
        }
      }

      structure.directories = Array.from(directories).slice(0, 50); // Limit directories
      structure.largestFiles = fileSizes
        .sort((a, b) => b.size - a.size)
        .slice(0, 10);

    } catch (error) {
      this.logger.warn('Failed to analyze file structure:', error);
    }

    return structure;
  }

  /**
   * Setup file system watchers
   */
  private setupFileWatchers(): void {
    // Watch for workspace file changes
    this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*', false, false, false);
    
    this.fileWatcher.onDidCreate(() => {
      this.invalidateWorkspaceCache();
    });

    this.fileWatcher.onDidDelete(() => {
      this.invalidateWorkspaceCache();
    });

    // Debounce workspace context refresh
    let refreshTimeout: NodeJS.Timeout;
    const refreshWorkspaceContext = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        this.analyzeWorkspaceContext();
      }, 2000);
    };

    this.fileWatcher.onDidCreate(refreshWorkspaceContext);
    this.fileWatcher.onDidDelete(refreshWorkspaceContext);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for workspace changes
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      this.analyzeWorkspaceContext();
    });

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('dev-agency')) {
        this.invalidateContextCache();
      }
    });
  }

  /**
   * Get current context for agent invocation
   */
  getCurrentContext(): FileContext {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      return {};
    }

    const document = activeEditor.document;
    const selection = activeEditor.selection;

    return {
      file: document.fileName,
      language: document.languageId,
      selection: selection.isEmpty ? undefined : selection,
      surroundingCode: this.getSurroundingCode(document, selection),
      imports: this.extractImports(document),
      exports: this.extractExports(document),
      functions: this.extractFunctions(document),
      classes: this.extractClasses(document)
    };
  }

  /**
   * Get surrounding code context
   */
  private getSurroundingCode(document: vscode.TextDocument, selection: vscode.Selection): string {
    const startLine = Math.max(0, selection.start.line - 10);
    const endLine = Math.min(document.lineCount - 1, selection.end.line + 10);
    
    const startPos = new vscode.Position(startLine, 0);
    const endPos = new vscode.Position(endLine, document.lineAt(endLine).text.length);
    
    return document.getText(new vscode.Range(startPos, endPos));
  }

  /**
   * Extract imports from document
   */
  private extractImports(document: vscode.TextDocument): string[] {
    const imports: string[] = [];
    const text = document.getText();
    
    // JavaScript/TypeScript imports
    const importRegex = /^import\s+.*from\s+['"]([^'"]+)['"]/gm;
    let match;
    while ((match = importRegex.exec(text)) !== null) {
      imports.push(match[1]);
    }

    // Python imports
    const pythonImportRegex = /^(?:from\s+(\w+(?:\.\w+)*)\s+)?import\s+([^#\n]+)/gm;
    while ((match = pythonImportRegex.exec(text)) !== null) {
      if (match[1]) {
        imports.push(match[1]);
      }
      imports.push(match[2].split(',')[0].trim());
    }

    return imports.filter(imp => imp.length > 0).slice(0, 20); // Limit to 20 imports
  }

  /**
   * Extract exports from document
   */
  private extractExports(document: vscode.TextDocument): string[] {
    const exports: string[] = [];
    const text = document.getText();
    
    // JavaScript/TypeScript exports
    const exportRegex = /^export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/gm;
    let match;
    while ((match = exportRegex.exec(text)) !== null) {
      exports.push(match[1]);
    }

    return exports.slice(0, 10); // Limit to 10 exports
  }

  /**
   * Extract function information
   */
  private extractFunctions(document: vscode.TextDocument): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const text = document.getText();
    
    // Simple function extraction (could be made more sophisticated)
    const functionRegex = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/gm;
    let match;
    while ((match = functionRegex.exec(text)) !== null) {
      const startPos = document.positionAt(match.index);
      const parameters = match[2].split(',').map(p => p.trim()).filter(p => p.length > 0);
      
      functions.push({
        name: match[1],
        startLine: startPos.line,
        endLine: startPos.line, // Could be calculated more accurately
        parameters,
        returnType: undefined // Could be extracted for TypeScript
      });
    }

    return functions.slice(0, 10); // Limit to 10 functions
  }

  /**
   * Extract class information
   */
  private extractClasses(document: vscode.TextDocument): ClassInfo[] {
    const classes: ClassInfo[] = [];
    const text = document.getText();
    
    // Simple class extraction
    const classRegex = /^(?:export\s+)?class\s+(\w+)/gm;
    let match;
    while ((match = classRegex.exec(text)) !== null) {
      const startPos = document.positionAt(match.index);
      
      classes.push({
        name: match[1],
        startLine: startPos.line,
        endLine: startPos.line, // Could be calculated more accurately
        methods: [], // Could be extracted
        properties: [] // Could be extracted
      });
    }

    return classes.slice(0, 5); // Limit to 5 classes
  }

  /**
   * Document change handler
   */
  onDocumentChanged(event: vscode.TextDocumentChangeEvent): void {
    // Invalidate context cache for the changed document
    const cacheKey = event.document.uri.toString();
    this.contextCache.delete(cacheKey);
  }

  /**
   * Document saved handler
   */
  onDocumentSaved(document: vscode.TextDocument): void {
    // Could trigger reanalysis of context
    this.logger.debug(`Document saved: ${document.fileName}`);
  }

  /**
   * Active editor change handler
   */
  onActiveEditorChanged(editor: vscode.TextEditor | undefined): void {
    if (editor) {
      this.logger.debug(`Active editor changed: ${editor.document.fileName}`);
    }
  }

  /**
   * Get workspace context
   */
  getWorkspaceContext(): WorkspaceContext | null {
    return this.workspaceContext;
  }

  /**
   * Get context for specific file
   */
  async getFileContext(filePath: string): Promise<FileContext> {
    const cacheKey = `file-${filePath}`;
    const cached = this.contextCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.context;
    }

    try {
      const document = await vscode.workspace.openTextDocument(filePath);
      const context: FileContext = {
        file: filePath,
        language: document.languageId,
        imports: this.extractImports(document),
        exports: this.extractExports(document),
        functions: this.extractFunctions(document),
        classes: this.extractClasses(document)
      };

      // Cache the result
      this.contextCache.set(cacheKey, {
        context,
        timestamp: Date.now()
      });

      return context;

    } catch (error) {
      this.logger.warn(`Failed to get context for ${filePath}:`, error);
      return { file: filePath };
    }
  }

  /**
   * Invalidate workspace cache
   */
  private invalidateWorkspaceCache(): void {
    // Clear workspace-related cache entries
    for (const key of this.contextCache.keys()) {
      if (key.startsWith('workspace-')) {
        this.contextCache.delete(key);
      }
    }
  }

  /**
   * Invalidate all context cache
   */
  private invalidateContextCache(): void {
    this.contextCache.clear();
  }

  /**
   * Get context summary for display
   */
  getContextSummary(): string {
    const workspace = this.workspaceContext;
    if (!workspace) {
      return 'No workspace context available';
    }

    let summary = `Project: ${workspace.projectType}\n`;
    summary += `Languages: ${workspace.languages.join(', ')}\n`;
    summary += `Frameworks: ${workspace.frameworks.join(', ') || 'None detected'}\n`;
    summary += `Files: ${workspace.structure.totalFiles}\n`;
    summary += `Has Tests: ${workspace.hasTests ? 'Yes' : 'No'}\n`;
    summary += `Has Documentation: ${workspace.hasDocumentation ? 'Yes' : 'No'}\n`;

    const current = this.getCurrentContext();
    if (current.file) {
      summary += `\nCurrent File: ${path.basename(current.file)}\n`;
      summary += `Language: ${current.language || 'Unknown'}\n`;
      if (current.functions && current.functions.length > 0) {
        summary += `Functions: ${current.functions.length}\n`;
      }
      if (current.classes && current.classes.length > 0) {
        summary += `Classes: ${current.classes.length}\n`;
      }
    }

    return summary;
  }

  /**
   * Dispose of the context manager
   */
  dispose(): void {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
    
    this.contextCache.clear();
    this.logger.debug('ContextManager disposed');
  }
}