/**
 * Compilation Fix Strategy - Fixes TypeScript and JavaScript compilation errors
 */

import { FixStrategy, AutoFixIssue } from '../../types';
import { StrategyContext } from '../FixGenerator';

export class CompilationFixStrategy {
  public async generateStrategies(context: StrategyContext): Promise<FixStrategy[]> {
    const strategies: FixStrategy[] = [];
    const { issue, analysis } = context;
    
    // Handle specific TypeScript errors
    if (issue.context.errorCode) {
      const errorCode = issue.context.errorCode;
      
      if (errorCode.startsWith('TS2304')) {
        // Cannot find name
        strategies.push(this.createMissingImportStrategy(context));
      } else if (errorCode.startsWith('TS2307')) {
        // Cannot find module
        strategies.push(this.createMissingModuleStrategy(context));
      } else if (errorCode.startsWith('TS2322')) {
        // Type assignment error
        strategies.push(this.createTypeFixStrategy(context));
      } else if (errorCode.startsWith('TS2339')) {
        // Property does not exist
        strategies.push(this.createPropertyFixStrategy(context));
      }
    }
    
    // Generic compilation strategies
    strategies.push(this.createCleanBuildStrategy(context));
    
    return strategies.filter(s => s !== null) as FixStrategy[];
  }
  
  private createMissingImportStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    const missingName = this.extractMissingName(issue.description);
    
    return {
      id: 'add_missing_import',
      name: 'Add Missing Import',
      description: `Add import statement for missing identifier '${missingName}'`,
      issueTypes: ['compilation'],
      steps: [
        {
          id: 'analyze_missing_import',
          type: 'command',
          description: 'Analyze where the missing import should come from',
          action: {
            type: 'analyze_imports',
            target: issue.location.file,
            parameters: {
              missingName,
              searchPatterns: ['node_modules', 'src', 'lib']
            }
          },
          optional: false
        },
        {
          id: 'add_import_statement',
          type: 'file_edit',
          description: `Add import statement for ${missingName}`,
          action: {
            type: 'add_import',
            target: issue.location.file,
            parameters: {
              importName: missingName,
              estimatedSource: this.guessImportSource(missingName)
            }
          },
          rollbackAction: {
            type: 'remove_import',
            target: issue.location.file,
            parameters: { importName: missingName }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.8,
      estimatedTime: 30,
      prerequisites: ['file_writable'],
      rollbackSteps: [
        {
          id: 'remove_added_import',
          type: 'file_edit',
          description: 'Remove the added import statement',
          action: {
            type: 'remove_import',
            target: issue.location.file,
            parameters: { importName: missingName }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Import statement added to file',
        'TypeScript compilation succeeds',
        'No new compilation errors introduced'
      ],
      tags: ['typescript', 'import', 'missing-identifier']
    };
  }
  
  private createMissingModuleStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    const moduleName = this.extractModuleName(issue.description);
    
    return {
      id: 'install_missing_module',
      name: 'Install Missing Module',
      description: `Install missing module '${moduleName}'`,
      issueTypes: ['compilation'],
      steps: [
        {
          id: 'search_package',
          type: 'command',
          description: `Search for package ${moduleName} in npm registry`,
          action: {
            type: 'npm_search',
            target: moduleName,
            parameters: {
              exact: true,
              includeTypes: true
            }
          },
          optional: false
        },
        {
          id: 'install_package',
          type: 'command',
          description: `Install package ${moduleName}`,
          action: {
            type: 'npm_install',
            target: moduleName,
            parameters: {
              save: true,
              production: true
            }
          },
          rollbackAction: {
            type: 'npm_uninstall',
            target: moduleName,
            parameters: {}
          },
          optional: false
        },
        {
          id: 'install_types',
          type: 'command',
          description: `Install TypeScript definitions for ${moduleName}`,
          action: {
            type: 'npm_install',
            target: `@types/${moduleName}`,
            parameters: {
              saveDev: true
            }
          },
          rollbackAction: {
            type: 'npm_uninstall',
            target: `@types/${moduleName}`,
            parameters: {}
          },
          optional: true
        }
      ],
      riskLevel: 'medium',
      confidence: 0.7,
      estimatedTime: 120, // 2 minutes for package installation
      prerequisites: ['package_json_writable', 'npm_available'],
      rollbackSteps: [
        {
          id: 'uninstall_package',
          type: 'command',
          description: `Uninstall package ${moduleName}`,
          action: {
            type: 'npm_uninstall',
            target: moduleName,
            parameters: {}
          },
          optional: false
        },
        {
          id: 'uninstall_types',
          type: 'command',
          description: `Uninstall TypeScript definitions`,
          action: {
            type: 'npm_uninstall',
            target: `@types/${moduleName}`,
            parameters: {}
          },
          optional: true
        }
      ],
      successCriteria: [
        'Package installed successfully',
        'Module can be imported',
        'TypeScript compilation succeeds'
      ],
      tags: ['dependency', 'npm', 'install']
    };
  }
  
  private createTypeFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'fix_type_error',
      name: 'Fix Type Error',
      description: 'Fix type assignment or casting error',
      issueTypes: ['compilation'],
      steps: [
        {
          id: 'analyze_types',
          type: 'command',
          description: 'Analyze expected vs actual types',
          action: {
            type: 'type_analysis',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              column: issue.location.column
            }
          },
          optional: false
        },
        {
          id: 'suggest_type_fix',
          type: 'file_edit',
          description: 'Apply type assertion or cast',
          action: {
            type: 'type_assertion',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              method: 'as_assertion' // or 'type_guard', 'interface_extension'
            }
          },
          optional: false
        }
      ],
      riskLevel: 'medium',
      confidence: 0.6,
      estimatedTime: 90,
      prerequisites: ['typescript_available'],
      rollbackSteps: [],
      successCriteria: [
        'Type error resolved',
        'No new type errors introduced',
        'Code logic preserved'
      ],
      tags: ['typescript', 'types', 'casting']
    };
  }
  
  private createPropertyFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    const propertyName = this.extractPropertyName(issue.description);
    
    return {
      id: 'fix_missing_property',
      name: 'Fix Missing Property',
      description: `Fix missing property '${propertyName}'`,
      issueTypes: ['compilation'],
      steps: [
        {
          id: 'check_property_typo',
          type: 'command',
          description: 'Check for typos in property name',
          action: {
            type: 'spell_check',
            target: issue.location.file,
            parameters: {
              property: propertyName,
              context: 'typescript'
            }
          },
          optional: false
        },
        {
          id: 'suggest_property_fix',
          type: 'file_edit',
          description: 'Fix property access or add property definition',
          action: {
            type: 'property_fix',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              property: propertyName,
              strategy: 'optional_chaining' // or 'add_property', 'fix_typo'
            }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.7,
      estimatedTime: 60,
      prerequisites: [],
      rollbackSteps: [],
      successCriteria: [
        'Property access works correctly',
        'No compilation errors',
        'Logic preserved'
      ],
      tags: ['typescript', 'property', 'access']
    };
  }
  
  private createCleanBuildStrategy(context: StrategyContext): FixStrategy {
    return {
      id: 'clean_build',
      name: 'Clean Build',
      description: 'Clean and rebuild project to resolve compilation issues',
      issueTypes: ['compilation'],
      steps: [
        {
          id: 'clean_build_cache',
          type: 'command',
          description: 'Clean build cache and artifacts',
          action: {
            type: 'clean_build',
            target: 'project',
            parameters: {
              cleanCache: true,
              cleanNodeModules: false,
              cleanDist: true
            }
          },
          optional: false
        },
        {
          id: 'rebuild_project',
          type: 'command',
          description: 'Rebuild project from scratch',
          action: {
            type: 'build',
            target: 'project',
            parameters: {
              mode: 'development',
              skipCache: true
            }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.5,
      estimatedTime: 180, // 3 minutes
      prerequisites: ['build_script_available'],
      rollbackSteps: [],
      successCriteria: [
        'Build completes successfully',
        'No compilation errors remain'
      ],
      tags: ['build', 'clean', 'cache']
    };
  }
  
  // Helper methods for extracting information from error messages
  
  private extractMissingName(description: string): string {
    const match = description.match(/Cannot find name '([^']+)'/);
    return match ? match[1] : 'unknown';
  }
  
  private extractModuleName(description: string): string {
    const match = description.match(/Cannot find module '([^']+)'/);
    return match ? match[1] : 'unknown';
  }
  
  private extractPropertyName(description: string): string {
    const match = description.match(/Property '([^']+)' does not exist/);
    return match ? match[1] : 'unknown';
  }
  
  private guessImportSource(name: string): string {
    // Common import patterns
    const commonMappings: Record<string, string> = {
      'React': 'react',
      'Component': 'react',
      'useState': 'react',
      'useEffect': 'react',
      'express': 'express',
      'axios': 'axios',
      'lodash': 'lodash',
      '_': 'lodash'
    };
    
    return commonMappings[name] || './';
  }
}