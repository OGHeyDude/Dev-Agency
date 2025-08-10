/**
 * Tests for AGENT-032: Advanced Code Intelligence Agent
 * Validates pattern detection, anti-pattern identification, and recommendations
 */

import { PatternDetector, Pattern } from '../pattern-detector';

describe('AGENT-032: Advanced Code Intelligence Agent', () => {
  let detector: PatternDetector;

  beforeEach(() => {
    detector = new PatternDetector();
  });

  describe('Acceptance Criteria: Identify design patterns', () => {
    test('should detect Singleton pattern', () => {
      const code = `
        class DatabaseConnection {
          private static instance: DatabaseConnection;
          private constructor() {}
          
          public static getInstance(): DatabaseConnection {
            if (!this.instance) {
              this.instance = new DatabaseConnection();
            }
            return this.instance;
          }
        }
      `;

      const patterns = detector.analyze(code, 'test.ts');
      const singleton = patterns.find(p => p.name === 'Singleton');

      expect(singleton).toBeDefined();
      expect(singleton?.type).toBe('design-pattern');
      expect(singleton?.confidence).toBeGreaterThan(0.7);
    });

    test('should detect Factory pattern', () => {
      const code = `
        class AnimalFactory {
          createAnimal(type: string): Animal {
            switch(type) {
              case 'dog': return new Dog();
              case 'cat': return new Cat();
              default: throw new Error('Unknown animal');
            }
          }
        }
      `;

      const patterns = detector.analyze(code, 'factory.ts');
      const factory = patterns.find(p => p.name === 'Factory');

      expect(factory).toBeDefined();
      expect(factory?.type).toBe('design-pattern');
    });

    test('should detect Observer pattern', () => {
      const code = `
        class EventEmitter {
          private listeners: Map<string, Function[]> = new Map();
          
          subscribe(event: string, callback: Function) {
            if (!this.listeners.has(event)) {
              this.listeners.set(event, []);
            }
            this.listeners.get(event)!.push(callback);
          }
          
          unsubscribe(event: string, callback: Function) {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
              const index = callbacks.indexOf(callback);
              if (index > -1) callbacks.splice(index, 1);
            }
          }
          
          emit(event: string, data: any) {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
              callbacks.forEach(cb => cb(data));
            }
          }
        }
      `;

      const patterns = detector.analyze(code, 'observer.ts');
      const observer = patterns.find(p => p.name === 'Observer');

      expect(observer).toBeDefined();
      expect(observer?.type).toBe('design-pattern');
    });
  });

  describe('Acceptance Criteria: Detect anti-patterns', () => {
    test('should detect God Object anti-pattern', () => {
      const code = `
        class UserManager {
          ${Array(25).fill(0).map((_, i) => `
          public method${i}() { return ${i}; }
          private property${i}: string = '';
          `).join('')}
        }
      `;

      const patterns = detector.analyze(code, 'god-object.ts');
      const godObject = patterns.find(p => p.name === 'God Object');

      expect(godObject).toBeDefined();
      expect(godObject?.type).toBe('anti-pattern');
      expect(godObject?.recommendation).toContain('breaking this class');
    });

    test('should detect Spaghetti Code anti-pattern', () => {
      const code = `
        function complexFunction() {
          if (condition1) {
            if (condition2) {
              if (condition3) {
                if (condition4) {
                  if (condition5) {
                    if (condition6) {
                      // Deeply nested code
                      doSomething();
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const patterns = detector.analyze(code, 'spaghetti.ts');
      const spaghetti = patterns.find(p => p.name === 'Spaghetti Code');

      expect(spaghetti).toBeDefined();
      expect(spaghetti?.type).toBe('anti-pattern');
      expect(spaghetti?.details).toContain('nesting depth');
    });

    test('should detect Copy-Paste Programming', () => {
      const code = `
        function processUser() {
          const name = user.name;
          const email = user.email;
          const age = user.age;
          validate(name, email, age);
          save(name, email, age);
        }
        
        function processAdmin() {
          const name = admin.name;
          const email = admin.email;
          const age = admin.age;
          validate(name, email, age);
          save(name, email, age);
        }
      `;

      const patterns = detector.analyze(code, 'copy-paste.ts');
      const copyPaste = patterns.find(p => p.name === 'Copy-Paste Programming');

      expect(copyPaste).toBeDefined();
      expect(copyPaste?.type).toBe('anti-pattern');
      expect(copyPaste?.recommendation).toContain('Extract duplicated code');
    });

    test('should detect Magic Numbers', () => {
      const code = `
        function calculatePrice(quantity: number) {
          const basePrice = 29.99;
          const tax = basePrice * 0.08;
          const discount = quantity > 10 ? basePrice * 0.15 : 0;
          const shipping = quantity < 5 ? 12.50 : 7.50;
          return (basePrice - discount + tax) * quantity + shipping;
        }
      `;

      const patterns = detector.analyze(code, 'magic-numbers.ts');
      const magicNumbers = patterns.find(p => p.name === 'Magic Numbers');

      expect(magicNumbers).toBeDefined();
      expect(magicNumbers?.type).toBe('anti-pattern');
      expect(magicNumbers?.recommendation).toContain('named constants');
    });
  });

  describe('Acceptance Criteria: Provide statistics', () => {
    test('should calculate pattern statistics', () => {
      const code = `
        // Mix of patterns and anti-patterns
        class Singleton {
          private static instance: Singleton;
          private constructor() {}
          static getInstance() { return this.instance; }
        }
        
        function badFunction() {
          const x = 42;
          const y = 100;
          return x * 2.5 + y * 0.33;
        }
      `;

      const patterns = detector.analyze(code, 'mixed.ts');
      const stats = detector.getStatistics(patterns);

      expect(stats).toHaveProperty('designPatterns');
      expect(stats).toHaveProperty('antiPatterns');
      expect(stats).toHaveProperty('avgConfidence');
      expect(stats).toHaveProperty('topIssues');
      expect(stats.designPatterns).toBeGreaterThanOrEqual(0);
      expect(stats.antiPatterns).toBeGreaterThanOrEqual(0);
    });

    test('should identify top issues', () => {
      const code = `
        class BigClass {
          ${Array(30).fill(0).map((_, i) => `method${i}() {}`).join('\n')}
        }
      `;

      const patterns = detector.analyze(code, 'issues.ts');
      const stats = detector.getStatistics(patterns);

      expect(stats.topIssues).toBeDefined();
      expect(stats.topIssues.length).toBeGreaterThan(0);
      expect(stats.topIssues[0].type).toBe('anti-pattern');
    });
  });

  describe('Acceptance Criteria: Pattern confidence scoring', () => {
    test('should assign confidence scores to patterns', () => {
      const code = `
        class TextbookSingleton {
          private static instance: TextbookSingleton;
          private constructor() {
            // Private constructor prevents instantiation
          }
          
          public static getInstance(): TextbookSingleton {
            if (!TextbookSingleton.instance) {
              TextbookSingleton.instance = new TextbookSingleton();
            }
            return TextbookSingleton.instance;
          }
        }
      `;

      const patterns = detector.analyze(code, 'confident.ts');
      
      patterns.forEach(pattern => {
        expect(pattern.confidence).toBeGreaterThan(0);
        expect(pattern.confidence).toBeLessThanOrEqual(1);
      });

      // High-quality singleton should have high confidence
      const singleton = patterns.find(p => p.name === 'Singleton');
      expect(singleton?.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty code', () => {
      const patterns = detector.analyze('', 'empty.ts');
      expect(patterns).toEqual([]);
    });

    test('should handle code without patterns', () => {
      const code = `
        // Simple code without patterns
        function add(a: number, b: number): number {
          return a + b;
        }
      `;

      const patterns = detector.analyze(code, 'simple.ts');
      expect(patterns.filter(p => p.type === 'design-pattern')).toHaveLength(0);
    });

    test('should handle malformed code gracefully', () => {
      const code = `
        class {
          constructor( {
            this.broken = 
        }
      `;

      expect(() => detector.analyze(code, 'malformed.ts')).not.toThrow();
    });

    test('should provide file location in patterns', () => {
      const code = `
        class Factory {
          createProduct() { return new Product(); }
        }
      `;

      const patterns = detector.analyze(code, 'located.ts');
      
      patterns.forEach(pattern => {
        expect(pattern.location).toHaveProperty('file');
        expect(pattern.location).toHaveProperty('line');
        expect(pattern.location.file).toBe('located.ts');
      });
    });
  });

  describe('Pattern Recommendations', () => {
    test('should provide recommendations for anti-patterns', () => {
      const code = `
        class DoEverything {
          ${Array(25).fill(0).map((_, i) => `doTask${i}() {}`).join('\n')}
        }
      `;

      const patterns = detector.analyze(code, 'recommendations.ts');
      const antiPatterns = patterns.filter(p => p.type === 'anti-pattern');

      antiPatterns.forEach(pattern => {
        expect(pattern.recommendation).toBeDefined();
        expect(pattern.recommendation!.length).toBeGreaterThan(0);
      });
    });

    test('should not provide recommendations for design patterns', () => {
      const code = `
        class SimpleFactory {
          createItem(type: string) {
            return new Item(type);
          }
        }
      `;

      const patterns = detector.analyze(code, 'good-pattern.ts');
      const designPatterns = patterns.filter(p => p.type === 'design-pattern');

      designPatterns.forEach(pattern => {
        expect(pattern.recommendation).toBeUndefined();
      });
    });
  });
});