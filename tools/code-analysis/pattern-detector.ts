/**
 * Pattern Detector for Code Intelligence
 * Identifies design patterns and anti-patterns in code
 */

export interface Pattern {
  name: string;
  type: 'design-pattern' | 'anti-pattern';
  confidence: number; // 0-1
  location: FileLocation;
  details: string;
  recommendation?: string;
}

export interface FileLocation {
  file: string;
  line: number;
  column?: number;
  endLine?: number;
}

export class PatternDetector {
  private patterns: Map<string, PatternMatcher> = new Map();

  constructor() {
    this.initializePatterns();
  }

  /**
   * Initialize pattern matchers
   */
  private initializePatterns(): void {
    // Design Patterns
    this.patterns.set('singleton', {
      name: 'Singleton',
      type: 'design-pattern',
      detect: this.detectSingleton.bind(this)
    });

    this.patterns.set('factory', {
      name: 'Factory',
      type: 'design-pattern',
      detect: this.detectFactory.bind(this)
    });

    this.patterns.set('observer', {
      name: 'Observer',
      type: 'design-pattern',
      detect: this.detectObserver.bind(this)
    });

    this.patterns.set('strategy', {
      name: 'Strategy',
      type: 'design-pattern',
      detect: this.detectStrategy.bind(this)
    });

    // Anti-Patterns
    this.patterns.set('god-object', {
      name: 'God Object',
      type: 'anti-pattern',
      detect: this.detectGodObject.bind(this)
    });

    this.patterns.set('spaghetti-code', {
      name: 'Spaghetti Code',
      type: 'anti-pattern',
      detect: this.detectSpaghettiCode.bind(this)
    });

    this.patterns.set('copy-paste', {
      name: 'Copy-Paste Programming',
      type: 'anti-pattern',
      detect: this.detectCopyPaste.bind(this)
    });

    this.patterns.set('magic-numbers', {
      name: 'Magic Numbers',
      type: 'anti-pattern',
      detect: this.detectMagicNumbers.bind(this)
    });
  }

  /**
   * Analyze code for patterns
   */
  public analyze(code: string, filePath: string): Pattern[] {
    const detectedPatterns: Pattern[] = [];

    this.patterns.forEach((matcher, key) => {
      const patterns = matcher.detect(code, filePath);
      detectedPatterns.push(...patterns);
    });

    return detectedPatterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Detect Singleton pattern
   */
  private detectSingleton(code: string, filePath: string): Pattern[] {
    const patterns: Pattern[] = [];
    const lines = code.split('\n');

    // Look for private constructor and static instance
    const singletonRegex = /private\s+constructor|static\s+instance|getInstance/gi;
    const privateConstructorRegex = /private\s+constructor/i;
    const staticInstanceRegex = /private\s+static\s+\w+\s*:\s*\w+/i;

    let hasSingleton = false;
    let lineNumber = 0;

    lines.forEach((line, index) => {
      if (singletonRegex.test(line)) {
        if (privateConstructorRegex.test(line) || staticInstanceRegex.test(line)) {
          hasSingleton = true;
          lineNumber = index + 1;
        }
      }
    });

    if (hasSingleton) {
      patterns.push({
        name: 'Singleton',
        type: 'design-pattern',
        confidence: 0.85,
        location: { file: filePath, line: lineNumber },
        details: 'Singleton pattern detected with private constructor and static instance'
      });
    }

    return patterns;
  }

  /**
   * Detect Factory pattern
   */
  private detectFactory(code: string, filePath: string): Pattern[] {
    const patterns: Pattern[] = [];
    const lines = code.split('\n');

    // Look for factory methods
    const factoryRegex = /create\w+|make\w+|build\w+|factory/gi;
    const returnTypeRegex = /:\s*\w+\s*{/;

    lines.forEach((line, index) => {
      if (factoryRegex.test(line) && returnTypeRegex.test(line)) {
        patterns.push({
          name: 'Factory',
          type: 'design-pattern',
          confidence: 0.75,
          location: { file: filePath, line: index + 1 },
          details: 'Factory method pattern detected'
        });
      }
    });

    return patterns;
  }

  /**
   * Detect Observer pattern
   */
  private detectObserver(code: string, filePath: string): Pattern[] {
    const patterns: Pattern[] = [];
    const lines = code.split('\n');

    // Look for observer/subscriber patterns
    const observerRegex = /subscribe|unsubscribe|notify|observer|listener|emit|on\(/gi;
    let observerCount = 0;
    let firstLine = 0;

    lines.forEach((line, index) => {
      if (observerRegex.test(line)) {
        observerCount++;
        if (firstLine === 0) firstLine = index + 1;
      }
    });

    if (observerCount >= 3) {
      patterns.push({
        name: 'Observer',
        type: 'design-pattern',
        confidence: Math.min(0.6 + observerCount * 0.1, 0.95),
        location: { file: filePath, line: firstLine },
        details: 'Observer/Event pattern detected with subscription methods'
      });
    }

    return patterns;
  }

  /**
   * Detect Strategy pattern
   */
  private detectStrategy(code: string, filePath: string): Pattern[] {
    const patterns: Pattern[] = [];
    const lines = code.split('\n');

    // Look for strategy pattern indicators
    const strategyRegex = /strategy|algorithm|policy/gi;
    const interfaceRegex = /interface\s+\w+Strategy|abstract\s+class\s+\w+Strategy/gi;

    let hasStrategy = false;
    let lineNumber = 0;

    lines.forEach((line, index) => {
      if (interfaceRegex.test(line) || (strategyRegex.test(line) && line.includes('class'))) {
        hasStrategy = true;
        lineNumber = index + 1;
      }
    });

    if (hasStrategy) {
      patterns.push({
        name: 'Strategy',
        type: 'design-pattern',
        confidence: 0.7,
        location: { file: filePath, line: lineNumber },
        details: 'Strategy pattern detected with interchangeable algorithms'
      });
    }

    return patterns;
  }

  /**
   * Detect God Object anti-pattern
   */
  private detectGodObject(code: string, filePath: string): Pattern[] {
    const patterns: Pattern[] = [];
    const lines = code.split('\n');

    // Count methods and properties
    const methodRegex = /^\s*(public|private|protected)?\s*\w+\s*\([^)]*\)\s*[:{]/gm;
    const propertyRegex = /^\s*(public|private|protected)?\s*\w+\s*[:=]/gm;

    const methods = code.match(methodRegex) || [];
    const properties = code.match(propertyRegex) || [];

    const totalMembers = methods.length + properties.length;
    const lineCount = lines.length;

    // God Object heuristics
    if (totalMembers > 20 || lineCount > 500) {
      patterns.push({
        name: 'God Object',
        type: 'anti-pattern',
        confidence: Math.min(0.5 + (totalMembers - 20) * 0.02, 0.95),
        location: { file: filePath, line: 1 },
        details: `Class has ${totalMembers} members and ${lineCount} lines - too many responsibilities`,
        recommendation: 'Consider breaking this class into smaller, focused classes'
      });
    }

    return patterns;
  }

  /**
   * Detect Spaghetti Code anti-pattern
   */
  private detectSpaghettiCode(code: string, filePath: string): Pattern[] {
    const patterns: Pattern[] = [];
    const lines = code.split('\n');

    // Calculate complexity indicators
    let nestedDepth = 0;
    let maxDepth = 0;
    let longMethodLines = 0;
    let currentMethodLines = 0;

    lines.forEach((line, index) => {
      // Track nesting depth
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      nestedDepth += openBraces - closeBraces;
      maxDepth = Math.max(maxDepth, nestedDepth);

      // Track method length
      if (line.includes('function') || line.includes('=>')) {
        currentMethodLines = 0;
      } else {
        currentMethodLines++;
        if (currentMethodLines > 50) longMethodLines++;
      }
    });

    if (maxDepth > 5 || longMethodLines > 100) {
      patterns.push({
        name: 'Spaghetti Code',
        type: 'anti-pattern',
        confidence: Math.min(0.5 + maxDepth * 0.1, 0.9),
        location: { file: filePath, line: 1 },
        details: `High complexity with max nesting depth of ${maxDepth}`,
        recommendation: 'Refactor to reduce nesting and extract methods'
      });
    }

    return patterns;
  }

  /**
   * Detect Copy-Paste Programming
   */
  private detectCopyPaste(code: string, filePath: string): Pattern[] {
    const patterns: Pattern[] = [];
    const lines = code.split('\n');

    // Simple duplicate detection
    const codeBlocks = new Map<string, number[]>();
    const blockSize = 5;

    for (let i = 0; i <= lines.length - blockSize; i++) {
      const block = lines.slice(i, i + blockSize)
        .map(l => l.trim())
        .filter(l => l.length > 10)
        .join('');

      if (block.length > 50) {
        if (!codeBlocks.has(block)) {
          codeBlocks.set(block, []);
        }
        codeBlocks.get(block)!.push(i + 1);
      }
    }

    codeBlocks.forEach((locations, block) => {
      if (locations.length > 1) {
        patterns.push({
          name: 'Copy-Paste Programming',
          type: 'anti-pattern',
          confidence: Math.min(0.6 + locations.length * 0.1, 0.95),
          location: { file: filePath, line: locations[0] },
          details: `Duplicate code found at lines: ${locations.join(', ')}`,
          recommendation: 'Extract duplicated code into a reusable function'
        });
      }
    });

    return patterns;
  }

  /**
   * Detect Magic Numbers anti-pattern
   */
  private detectMagicNumbers(code: string, filePath: string): Pattern[] {
    const patterns: Pattern[] = [];
    const lines = code.split('\n');

    // Look for hardcoded numbers (excluding 0, 1, -1)
    const magicNumberRegex = /[^a-zA-Z0-9_]([2-9]\d+|[2-9])(?![a-zA-Z0-9_])/g;
    const magicNumbers: { value: string; line: number }[] = [];

    lines.forEach((line, index) => {
      // Skip comments and strings
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

      const matches = line.matchAll(magicNumberRegex);
      for (const match of matches) {
        magicNumbers.push({
          value: match[1],
          line: index + 1
        });
      }
    });

    if (magicNumbers.length > 3) {
      patterns.push({
        name: 'Magic Numbers',
        type: 'anti-pattern',
        confidence: Math.min(0.5 + magicNumbers.length * 0.05, 0.85),
        location: { file: filePath, line: magicNumbers[0].line },
        details: `Found ${magicNumbers.length} magic numbers: ${magicNumbers.slice(0, 5).map(m => m.value).join(', ')}`,
        recommendation: 'Replace magic numbers with named constants'
      });
    }

    return patterns;
  }

  /**
   * Get pattern statistics
   */
  public getStatistics(patterns: Pattern[]): {
    designPatterns: number;
    antiPatterns: number;
    avgConfidence: number;
    topIssues: Pattern[];
  } {
    const designPatterns = patterns.filter(p => p.type === 'design-pattern').length;
    const antiPatterns = patterns.filter(p => p.type === 'anti-pattern').length;
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / (patterns.length || 1);
    const topIssues = patterns
      .filter(p => p.type === 'anti-pattern')
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    return {
      designPatterns,
      antiPatterns,
      avgConfidence,
      topIssues
    };
  }
}

interface PatternMatcher {
  name: string;
  type: 'design-pattern' | 'anti-pattern';
  detect: (code: string, filePath: string) => Pattern[];
}

export default PatternDetector;