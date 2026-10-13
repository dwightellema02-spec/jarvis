import { ResourcePermission } from '../security/types.js';
import { ITool, ToolDefinition } from '../tools/tool.interface.js';

export type SkillStatus =
  | 'draft'
  | 'generated'
  | 'testing'
  | 'tested'
  | 'awaiting_approval'
  | 'installed'
  | 'rejected'
  | 'disabled';

export type SkillType =
  | 'api_adapter'
  | 'data_transformer'
  | 'automation_script'
  | 'custom_solver'
  | 'workflow';

export interface SkillTestCase {
  name: string;
  input: Record<string, unknown>;
  expectedSuccess: boolean;
  expectedOutputSubstring?: string;
}

export interface GeneratedToolDraft {
  id: string; // e.g. 'custom.weather_forecast'
  name: string;
  description: string;
  type: SkillType;
  version: string;
  requiredPermissions: ResourcePermission[];
  parametersSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  implementationCode: string;
  testCases: SkillTestCase[];
  status: SkillStatus;
  createdAt: string;
  updatedAt: string;
  installedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  runtimeToolRef?: ITool;
}

export interface SkillTestResult {
  testCaseName: string;
  passed: boolean;
  executionTimeMs: number;
  actualOutput?: unknown;
  error?: string;
}

export interface SkillValidationReport {
  skillId: string;
  syntaxValid: boolean;
  securityCleared: boolean;
  threatsFound: string[];
  testsPassed: number;
  testsTotal: number;
  testResults: SkillTestResult[];
  overallStatus: 'passed' | 'failed' | 'requires_review';
}

export interface SkillCreationRequest {
  id?: string;
  name: string;
  description: string;
  type: SkillType;
  promptOrSpec: string;
  requiredPermissions?: ResourcePermission[];
  parametersSchema?: Record<string, unknown>;
  testCases?: SkillTestCase[];
}
