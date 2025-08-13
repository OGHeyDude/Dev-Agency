/**
 * Dependency Fix Strategy - Fixes dependency-related issues
 */

import { FixStrategy } from '../../types';
import { StrategyContext } from '../FixGenerator';

export class DependencyFixStrategy {
  public async generateStrategies(context: StrategyContext): Promise<FixStrategy[]> {
    const strategies: FixStrategy[] = [];
    const { issue } = context;
    
    // Handle security vulnerabilities
    if (issue.context.vulnerability) {
      strategies.push(this.createSecurityFixStrategy(context));
    }
    
    // Handle outdated packages
    if (issue.context.current && issue.context.latest) {
      strategies.push(this.createUpdateStrategy(context));
    }
    
    // Handle peer dependency issues
    if (issue.context.peerDependency) {
      strategies.push(this.createPeerDependencyFixStrategy(context));
    }
    
    return strategies.filter(s => s !== null) as FixStrategy[];
  }
  
  private createSecurityFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    const packageName = issue.context.packageName;
    const vulnerability = issue.context.vulnerability;
    
    return {
      id: 'fix_security_vulnerability',
      name: 'Fix Security Vulnerability',
      description: `Fix security vulnerability in ${packageName}`,
      issueTypes: ['dependency'],
      steps: [
        {
          id: 'check_fix_available',
          type: 'command',
          description: 'Check if automated fix is available',
          action: {
            type: 'npm_audit',
            target: 'fix',
            parameters: {
              packageName,
              vulnerabilityId: vulnerability.id,
              dryRun: true
            }
          },
          optional: false
        },
        {
          id: 'apply_security_fix',
          type: 'command',
          description: 'Apply automated security fix',
          action: {
            type: 'npm_audit',
            target: 'fix',
            parameters: {
              packageName,
              force: false,
              production: true
            }
          },
          rollbackAction: {
            type: 'npm_install',
            target: `${packageName}@${issue.context.current}`,
            parameters: {
              exact: true
            }
          },
          optional: false
        },
        {
          id: 'verify_fix',
          type: 'test_run',
          description: 'Verify fix doesn\'t break functionality',
          action: {
            type: 'run_tests',
            target: 'security',
            parameters: {
              testPattern: '**/*.test.*',
              timeout: 120000
            }
          },
          optional: false
        }
      ],
      riskLevel: 'medium',
      confidence: issue.context.fixAvailable ? 0.9 : 0.6,
      estimatedTime: 180,
      prerequisites: ['package_json_writable', 'npm_available'],
      rollbackSteps: [
        {
          id: 'rollback_security_fix',
          type: 'command',
          description: 'Rollback to previous version',
          action: {
            type: 'npm_install',
            target: `${packageName}@${issue.context.current}`,
            parameters: {
              exact: true,
              save: true
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Security vulnerability resolved',
        'Package functionality maintained',
        'Tests pass',
        'No new vulnerabilities introduced'
      ],
      tags: ['security', 'vulnerability', 'npm']
    };
  }
  
  private createUpdateStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    const packageName = issue.context.packageName;
    const currentVersion = issue.context.current;
    const latestVersion = issue.context.latest;
    
    // Determine update risk based on version difference
    const riskLevel = this.assessUpdateRisk(currentVersion, latestVersion);
    
    return {
      id: 'update_package',
      name: 'Update Package',
      description: `Update ${packageName} from ${currentVersion} to ${latestVersion}`,
      issueTypes: ['dependency'],
      steps: [
        {
          id: 'check_breaking_changes',
          type: 'command',
          description: 'Check for breaking changes',
          action: {
            type: 'check_changelog',
            target: packageName,
            parameters: {
              fromVersion: currentVersion,
              toVersion: latestVersion
            }
          },
          optional: false
        },
        {
          id: 'update_package_version',
          type: 'command',
          description: `Update ${packageName} to ${latestVersion}`,
          action: {
            type: 'npm_install',
            target: `${packageName}@${latestVersion}`,
            parameters: {
              save: true,
              exact: false
            }
          },
          rollbackAction: {
            type: 'npm_install',
            target: `${packageName}@${currentVersion}`,
            parameters: {
              save: true,
              exact: true
            }
          },
          optional: false
        },
        {
          id: 'update_type_definitions',
          type: 'command',
          description: 'Update TypeScript definitions if needed',
          action: {
            type: 'npm_install',
            target: `@types/${packageName}@latest`,
            parameters: {
              saveDev: true
            }
          },
          optional: true
        },
        {
          id: 'run_compatibility_tests',
          type: 'test_run',
          description: 'Run tests to check compatibility',
          action: {
            type: 'run_tests',
            target: 'all',
            parameters: {
              testPattern: '**/*.test.*',
              timeout: 180000
            }
          },
          optional: false
        }
      ],
      riskLevel,
      confidence: riskLevel === 'low' ? 0.8 : 0.5,
      estimatedTime: 240,
      prerequisites: ['package_json_writable', 'npm_available'],
      rollbackSteps: [
        {
          id: 'rollback_package_update',
          type: 'command',
          description: 'Rollback to previous version',
          action: {
            type: 'npm_install',
            target: `${packageName}@${currentVersion}`,
            parameters: {
              save: true,
              exact: true
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Package updated successfully',
        'All tests pass',
        'No breaking changes detected',
        'Application functionality preserved'
      ],
      tags: ['dependency', 'update', 'maintenance']
    };
  }
  
  private createPeerDependencyFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    const packageName = issue.context.packageName;
    const requiredPeer = issue.context.requiredPeer;
    
    return {
      id: 'fix_peer_dependency',
      name: 'Fix Peer Dependency',
      description: `Install missing peer dependency for ${packageName}`,
      issueTypes: ['dependency'],
      steps: [
        {
          id: 'analyze_peer_requirements',
          type: 'command',
          description: 'Analyze peer dependency requirements',
          action: {
            type: 'analyze_peer_deps',
            target: packageName,
            parameters: {
              checkCompatibility: true
            }
          },
          optional: false
        },
        {
          id: 'install_peer_dependency',
          type: 'command',
          description: `Install peer dependency ${requiredPeer}`,
          action: {
            type: 'npm_install',
            target: requiredPeer,
            parameters: {
              save: true,
              peerDep: true
            }
          },
          rollbackAction: {
            type: 'npm_uninstall',
            target: requiredPeer,
            parameters: {}
          },
          optional: false
        }
      ],
      riskLevel: 'medium',
      confidence: 0.7,
      estimatedTime: 90,
      prerequisites: ['package_json_writable'],
      rollbackSteps: [
        {
          id: 'remove_peer_dependency',
          type: 'command',
          description: 'Remove installed peer dependency',
          action: {
            type: 'npm_uninstall',
            target: requiredPeer,
            parameters: {}
          },
          optional: false
        }
      ],
      successCriteria: [
        'Peer dependency installed',
        'No peer dependency warnings',
        'Package functions correctly'
      ],
      tags: ['dependency', 'peer', 'compatibility']
    };
  }
  
  private assessUpdateRisk(currentVersion: string, latestVersion: string): 'low' | 'medium' | 'high' {
    const currentParts = currentVersion.split('.').map(Number);
    const latestParts = latestVersion.split('.').map(Number);
    
    // Major version change = high risk
    if (latestParts[0] > currentParts[0]) {
      return 'high';
    }
    
    // Minor version change = medium risk
    if (latestParts[1] > currentParts[1]) {
      return 'medium';
    }
    
    // Patch version change = low risk
    return 'low';
  }
}