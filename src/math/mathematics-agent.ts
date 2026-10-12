/**
 * JARVIS Phase 7 - Mathematics Agent
 * Agent implementation providing mathematical problem solving, Socratic pedagogy,
 * diagnostic assessment, and BLEPT LET review.
 */

import {
  IAgent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionResult,
} from '../agents/agent.interface.js';
import { PermissionLevel, ResourceType } from '../security/types.js';
import { MathematicsEngine } from './mathematics-engine.js';
import { MathDomain } from './math.interface.js';

export interface MathematicsAgentInput {
  action:
    | 'solve'
    | 'worked_example'
    | 'assess'
    | 'diagnose'
    | 'teach_prerequisite'
    | 'check_answer'
    | 'user_mastery'
    | 'let_competencies'
    | 'let_mock_exam'
    | 'let_evaluate';
  domain?: MathDomain;
  topic?: string;
  expression?: string;
  linear?: { a: number; b: number; c: number; variable?: string };
  quadratic?: { a: number; b: number; c: number };
  system2x2?: { eq1: { a: number; b: number; c: number }; eq2: { a: number; b: number; c: number } };
  derivative?: { terms: any[]; evaluateAt?: number };
  integral?: { terms: any[]; bounds?: { lower: number; upper: number } };
  geometry?: any;
  statistics?: any;
  setLogic?: any;
  submissions?: { problemId: string; studentAnswer: string }[];
  prerequisiteTopic?: string;
  studentAnswer?: string | number;
  expectedAnswer?: string | number;
  letCompetencyCode?: string;
  letCount?: number;
  letAnswers?: Record<string, string>;
}

export class MathematicsAgent implements IAgent {
  public readonly definition: AgentDefinition = {
    id: 'mathematics-agent',
    name: 'Mathematics Agent',
    description:
      'Solves mathematics across algebra, calculus, geometry, statistics, and guides Socratic learning and LET review',
    version: '1.0.0',
    capabilities: [
      'teach_math',
      'solve_math',
      'assess_math',
      'let_review',
      'worked_examples',
      'pedagogical_remediation',
    ],
    requiredPermissions: [
      { resource: ResourceType.FILES, action: 'read', level: PermissionLevel.READ },
    ],
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'solve',
            'worked_example',
            'assess',
            'diagnose',
            'teach_prerequisite',
            'check_answer',
            'user_mastery',
            'let_competencies',
            'let_mock_exam',
            'let_evaluate',
          ],
        },
        domain: { type: 'string' },
        topic: { type: 'string' },
        expression: { type: 'string' },
      },
      required: ['action'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
    status: 'enabled',
  };

  constructor(private readonly mathEngine: MathematicsEngine) {}

  public async execute(
    rawInput: unknown,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const start = Date.now();
    const input = rawInput as MathematicsAgentInput;

    try {
      if (!input?.action) {
        throw new Error('Action is required for MathematicsAgent execution.');
      }

      let data: any;

      switch (input.action) {
        case 'solve': {
          if (!input.domain) throw new Error('Domain required for solve action.');
          data = this.mathEngine.solve({
            domain: input.domain,
            expression: input.expression,
            linear: input.linear,
            quadratic: input.quadratic,
            system2x2: input.system2x2,
            derivative: input.derivative,
            integral: input.integral,
            geometry: input.geometry,
            statistics: input.statistics,
            setLogic: input.setLogic,
          });
          break;
        }

        case 'worked_example': {
          if (!input.domain) throw new Error('Domain required for worked_example.');
          data = this.mathEngine.getWorkedExample(input.domain, input.topic);
          break;
        }

        case 'assess': {
          if (!input.domain) throw new Error('Domain required for assess.');
          data = this.mathEngine.generateAssessment(context.userId, input.domain);
          break;
        }

        case 'diagnose': {
          if (!input.domain || !input.submissions) {
            throw new Error('Domain and submissions required for diagnose.');
          }
          data = this.mathEngine.diagnoseAssessment(
            context.userId,
            input.domain,
            input.submissions
          );
          break;
        }

        case 'teach_prerequisite': {
          if (!input.prerequisiteTopic) {
            throw new Error('prerequisiteTopic required for teach_prerequisite.');
          }
          data = this.mathEngine.teachPrerequisite(input.prerequisiteTopic);
          break;
        }

        case 'check_answer': {
          if (!input.domain || input.studentAnswer === undefined || input.expectedAnswer === undefined) {
            throw new Error('domain, studentAnswer, and expectedAnswer required for check_answer.');
          }
          data = this.mathEngine.checkPracticeAnswer(
            context.userId,
            input.domain,
            input.studentAnswer,
            input.expectedAnswer,
            input.topic
          );
          break;
        }

        case 'user_mastery': {
          if (!input.domain) throw new Error('Domain required for user_mastery.');
          data = this.mathEngine.getUserMastery(context.userId, input.domain);
          break;
        }

        case 'let_competencies': {
          data = this.mathEngine.getLetCompetencies();
          break;
        }

        case 'let_mock_exam': {
          data = this.mathEngine.generateLetMockExam({
            competencyCode: input.letCompetencyCode,
            count: input.letCount,
          });
          break;
        }

        case 'let_evaluate': {
          if (!input.letAnswers) throw new Error('letAnswers required for let_evaluate.');
          data = this.mathEngine.evaluateLetExam(input.letAnswers);
          break;
        }

        default:
          throw new Error(`Unsupported action "${(input as any).action}" for MathematicsAgent.`);
      }

      return {
        success: true,
        agentId: this.definition.id,
        data,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        success: false,
        agentId: this.definition.id,
        error: err.message,
        executionTimeMs: Date.now() - start,
      };
    }
  }
}
