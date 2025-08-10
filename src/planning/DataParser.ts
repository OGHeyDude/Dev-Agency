/**
 * Sprint Data Parser
 * 
 * Extracts and parses historical sprint data from PROJECT_PLAN.md files
 * to enable predictive analysis and pattern recognition.
 */

import * as fs from 'fs';
import { SprintData, TicketData, SprintPhase, HistoricalAnalysis } from './types';

export class DataParser {
  /**
   * Parse PROJECT_PLAN.md content and extract sprint data
   */
  public parseProjectPlan(content: string): HistoricalAnalysis {
    const lines = content.split('\n');
    const sprints: SprintData[] = [];
    
    // Extract current and completed sprints
    const currentSprint = this.extractCurrentSprint(lines);
    if (currentSprint) {
      sprints.push(currentSprint);
    }
    
    const completedSprints = this.extractCompletedSprints(lines);
    sprints.push(...completedSprints);
    
    // Extract all tickets for additional analysis
    const allTickets = this.extractAllTickets(lines);
    
    // Calculate overall metrics
    const overallMetrics = this.calculateOverallMetrics(sprints, allTickets);
    
    return {
      totalSprintsAnalyzed: sprints.length,
      dateRange: this.calculateDateRange(sprints),
      overallMetrics,
      sprintData: sprints
    };
  }

  /**
   * Extract current sprint data from PROJECT_PLAN.md
   */
  private extractCurrentSprint(lines: string[]): SprintData | null {
    let currentSprintSection = false;
    let sprintData: Partial<SprintData> = {};
    let tickets: TicketData[] = [];
    let phases: SprintPhase[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect current sprint section
      if (line.includes('## **2. Current Sprint**')) {
        currentSprintSection = true;
        continue;
      }
      
      // End of current sprint section
      if (currentSprintSection && line.startsWith('### **Previous Sprints')) {
        break;
      }
      
      if (!currentSprintSection) continue;
      
      // Extract sprint dates and goal
      if (line.includes('* **Sprint Dates:**')) {
        const dateMatch = line.match(/(\d{2}-\d{2}-\d{4})\s*–\s*(\d{2}-\d{2}-\d{4})/);
        if (dateMatch) {
          sprintData.dates = {
            start: dateMatch[1],
            end: dateMatch[2]
          };
        }
      }
      
      if (line.includes('* **Sprint Goal:**')) {
        sprintData.name = line.replace('* **Sprint Goal:**', '').trim();
      }
      
      // Extract phase data and tickets
      if (line.includes('#### Phase')) {
        const phase = this.extractPhaseData(lines, i);
        if (phase) {
          phases.push(phase);
          tickets.push(...phase.tickets.map(ticketId => 
            this.findTicketById(lines, ticketId)
          ).filter(Boolean) as TicketData[]);
        }
      }
    }
    
    if (!sprintData.dates) return null;
    
    const totalPoints = tickets.reduce((sum, ticket) => sum + ticket.points, 0);
    const completedPoints = tickets
      .filter(ticket => ticket.status === 'DONE')
      .reduce((sum, ticket) => sum + ticket.points, 0);
    
    return {
      sprintNumber: this.extractSprintNumber(sprintData.name || 'Current'),
      name: sprintData.name || 'Current Sprint',
      dates: sprintData.dates,
      totalPoints,
      completedPoints,
      completionRate: totalPoints > 0 ? completedPoints / totalPoints : 0,
      status: 'IN_PROGRESS',
      tickets,
      phases
    };
  }

  /**
   * Extract completed sprints data
   */
  private extractCompletedSprints(lines: string[]): SprintData[] {
    const sprints: SprintData[] = [];
    let inCompletedSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('### **Previous Sprints (Completed)**')) {
        inCompletedSection = true;
        continue;
      }
      
      if (inCompletedSection && line.startsWith('## **')) {
        break;
      }
      
      if (!inCompletedSection) continue;
      
      // Parse sprint completion data
      if (line.includes('* **Sprint')) {
        const sprintMatch = line.match(/\* \*\*Sprint (\d+):\*\* (\d{2}-\d{2}-\d{4}).*\((\d+)\/(\d+) points completed - (\d+)%\)/);
        if (sprintMatch) {
          const [, sprintNum, date, completed, total, percentage] = sprintMatch;
          
          sprints.push({
            sprintNumber: parseInt(sprintNum),
            name: `Sprint ${sprintNum}`,
            dates: {
              start: date,
              end: date // Approximation
            },
            totalPoints: parseInt(total),
            completedPoints: parseInt(completed),
            completionRate: parseInt(percentage) / 100,
            status: 'COMPLETED',
            tickets: this.extractSprintTickets(lines, i, parseInt(sprintNum))
          });
        }
      }
    }
    
    return sprints;
  }

  /**
   * Extract all tickets from the backlog
   */
  private extractAllTickets(lines: string[]): TicketData[] {
    const tickets: TicketData[] = [];
    let inBacklogSection = false;
    
    for (const line of lines) {
      if (line.includes('## **4. Backlog (All Tickets)**')) {
        inBacklogSection = true;
        continue;
      }
      
      if (inBacklogSection && line.startsWith('## **')) {
        break;
      }
      
      if (!inBacklogSection) continue;
      
      // Parse ticket table rows
      const ticketMatch = line.match(/\| ([\w-]+) \| (.+?) \| (.+?) \| .+? \| (\d+) \| `(.+?)` \|/);
      if (ticketMatch) {
        const [, id, title, epic, points, status] = ticketMatch;
        
        tickets.push({
          id,
          title: title.replace(/~~(.+?)~~/, '$1'), // Handle strikethrough
          epic,
          points: parseInt(points),
          status: status as TicketData['status'],
          ticketType: this.classifyTicketType(id),
          blockers: [],
          dependencies: []
        });
      }
    }
    
    return tickets;
  }

  /**
   * Extract phase data from current sprint
   */
  private extractPhaseData(lines: string[], startIndex: number): SprintPhase | null {
    const phaseLine = lines[startIndex];
    const phaseMatch = phaseLine.match(/#### Phase (\d+): (.+?) \(Week (\d+).*\)/);
    
    if (!phaseMatch) return null;
    
    const [, , phaseName, week] = phaseMatch;
    const tickets: string[] = [];
    let totalPoints = 0;
    
    // Look for ticket table in next lines
    for (let i = startIndex + 1; i < lines.length && !lines[i].startsWith('####'); i++) {
      const ticketMatch = lines[i].match(/\| ([\w-]+) \| .+? \| (\d+) \| `(.+?)` \|/);
      if (ticketMatch) {
        const [, ticketId, points] = ticketMatch;
        tickets.push(ticketId);
        totalPoints += parseInt(points);
      }
      
      if (lines[i].includes('Total')) {
        const totalMatch = lines[i].match(/\*\*(\d+)\*\*/);
        if (totalMatch) {
          totalPoints = parseInt(totalMatch[1]);
        }
        break;
      }
    }
    
    return {
      name: phaseName,
      tickets,
      totalPoints,
      week: parseInt(week)
    };
  }

  /**
   * Find ticket details by ID in the content
   */
  private findTicketById(lines: string[], ticketId: string): TicketData | null {
    for (const line of lines) {
      const ticketMatch = line.match(new RegExp(`\\| ${ticketId} \\| (.+?) \\| (.+?) \\| .+? \\| (\\d+) \\| \`(.+?)\` \\|`));
      if (ticketMatch) {
        const [, title, epic, points, status] = ticketMatch;
        
        return {
          id: ticketId,
          title: title.replace(/~~(.+?)~~/, '$1'),
          epic,
          points: parseInt(points),
          status: status as TicketData['status'],
          ticketType: this.classifyTicketType(ticketId),
          blockers: [],
          dependencies: []
        };
      }
    }
    
    return null;
  }

  /**
   * Extract sprint tickets for completed sprints
   */
  private extractSprintTickets(lines: string[], sprintLineIndex: number, _sprintNumber: number): TicketData[] {
    const tickets: TicketData[] = [];
    
    // Look for tickets mentioned in the sprint description
    for (let i = sprintLineIndex; i < sprintLineIndex + 10 && i < lines.length; i++) {
      const line = lines[i];
      const ticketMatches = line.match(/([A-Z]+-\d+)/g);
      
      if (ticketMatches) {
        for (const ticketId of ticketMatches) {
          const ticket = this.findTicketById(lines, ticketId);
          if (ticket && !tickets.find(t => t.id === ticketId)) {
            // Mark as done for completed sprints
            ticket.status = 'DONE';
            tickets.push(ticket);
          }
        }
      }
    }
    
    return tickets;
  }

  /**
   * Classify ticket type based on ID pattern
   */
  private classifyTicketType(ticketId: string): TicketData['ticketType'] {
    if (ticketId.startsWith('AGENT-')) return 'AGENT';
    if (ticketId.startsWith('SECURITY-')) return 'SECURITY';
    if (ticketId.startsWith('BUILD-')) return 'BUILD';
    if (ticketId.startsWith('PERF-')) return 'PERF';
    return 'OTHER';
  }

  /**
   * Extract sprint number from sprint name
   */
  private extractSprintNumber(name: string): number {
    const match = name.match(/Sprint (\d+)/i);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Calculate overall metrics from sprint data
   */
  private calculateOverallMetrics(sprints: SprintData[], allTickets: TicketData[]) {
    const completedSprints = sprints.filter(s => s.status === 'COMPLETED');
    
    const averageCompletionRate = completedSprints.length > 0 
      ? completedSprints.reduce((sum, sprint) => sum + sprint.completionRate, 0) / completedSprints.length
      : 0;
    
    const averageVelocity = completedSprints.length > 0
      ? completedSprints.reduce((sum, sprint) => sum + sprint.completedPoints, 0) / completedSprints.length
      : 0;
    
    // Find most successful epic
    const epicSuccess = new Map<string, { total: number; completed: number }>();
    for (const ticket of allTickets) {
      if (!epicSuccess.has(ticket.epic)) {
        epicSuccess.set(ticket.epic, { total: 0, completed: 0 });
      }
      const epic = epicSuccess.get(ticket.epic)!;
      epic.total++;
      if (ticket.status === 'DONE') {
        epic.completed++;
      }
    }
    
    let mostSuccessfulEpic = 'Unknown';
    let highestSuccessRate = 0;
    for (const [epic, stats] of epicSuccess.entries()) {
      const rate = stats.total > 0 ? stats.completed / stats.total : 0;
      if (rate > highestSuccessRate) {
        highestSuccessRate = rate;
        mostSuccessfulEpic = epic;
      }
    }
    
    // Find most problematic ticket type
    const typeProblems = new Map<string, number>();
    for (const ticket of allTickets) {
      if (ticket.status !== 'DONE' && ticket.status !== 'CANCELLED') {
        typeProblems.set(ticket.ticketType, (typeProblems.get(ticket.ticketType) || 0) + 1);
      }
    }
    
    const mostProblematicTicketType = Array.from(typeProblems.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    
    return {
      averageCompletionRate,
      averageVelocity,
      mostSuccessfulEpic,
      mostProblematicTicketType
    };
  }

  /**
   * Calculate date range from sprints
   */
  private calculateDateRange(sprints: SprintData[]) {
    const dates = sprints.flatMap(s => [s.dates.start, s.dates.end]);
    dates.sort();
    
    return {
      earliest: dates[0] || '',
      latest: dates[dates.length - 1] || ''
    };
  }

  /**
   * Load and parse PROJECT_PLAN.md from filesystem
   */
  public async parseFromFile(filePath: string): Promise<HistoricalAnalysis> {
    const content = fs.readFileSync(filePath, 'utf-8');
    return this.parseProjectPlan(content);
  }
}