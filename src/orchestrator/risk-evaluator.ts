import { ResourceType, PermissionAction, PermissionLevel } from '../security/types.js';
import { RiskLevel, RISK_HIERARCHY } from './types.js';

export interface RiskAssessmentRequest {
  resource: ResourceType;
  action: PermissionAction;
  target?: string;
  parameters?: Record<string, unknown>;
}

export interface RiskAssessmentResult {
  riskLevel: RiskLevel;
  reasons: string[];
  requiresConfirmation: boolean;
  prohibitedWithoutElevation: boolean;
  minimumPermissionLevel: PermissionLevel;
}

export class RiskEvaluator {
  /**
   * Evaluates the risk profile of an intended action against resources and parameters.
   */
  public evaluate(request: RiskAssessmentRequest): RiskAssessmentResult {
    const reasons: string[] = [];
    let riskLevel = RiskLevel.LOW;

    const action = String(request.action).toLowerCase();
    const target = String(request.target || '').toLowerCase();

    // 1. Critical Risk Triggers
    if (request.resource === ResourceType.FINANCIAL_SERVICES) {
      if (['transfer', 'execute', 'write', 'modify', 'admin'].includes(action)) {
        riskLevel = RiskLevel.CRITICAL;
        reasons.push('Financial transactions and asset transfers are classified as CRITICAL risk');
      }
    }

    if (
      target.includes('/etc/shadow') ||
      target.includes('sam_dump') ||
      target.includes('bypass_auth') ||
      target.includes('steal_credentials') ||
      target.includes('dump_passwords')
    ) {
      riskLevel = RiskLevel.CRITICAL;
      reasons.push('Credential access, shadow file reading, or authentication bypass attempt detected');
    }

    if (request.resource === ResourceType.EXTERNAL_ACCOUNTS && ['admin', 'delete'].includes(action)) {
      riskLevel = RiskLevel.CRITICAL;
      reasons.push('Administrative account modification or deletion represents CRITICAL risk');
    }

    // 2. High Risk Triggers
    if (riskLevel !== RiskLevel.CRITICAL) {
      if (request.resource === ResourceType.APPLICATIONS && action === 'execute') {
        riskLevel = RiskLevel.HIGH;
        reasons.push('Command-line / shell execution on host environment is HIGH risk');
      } else if (action === 'delete') {
        riskLevel = RiskLevel.HIGH;
        reasons.push(`Destructive deletion on ${request.resource} is HIGH risk`);
      } else if (request.resource === ResourceType.CAMERA || request.resource === ResourceType.MICROPHONE) {
        riskLevel = RiskLevel.HIGH;
        reasons.push('Accessing physical audiovisual hardware streams is HIGH risk');
      } else if (request.resource === ResourceType.DEVICES && ['execute', 'admin'].includes(action)) {
        riskLevel = RiskLevel.HIGH;
        reasons.push('Remote device command dispatch is HIGH risk');
      }
    }

    // 3. Medium Risk Triggers
    if (riskLevel === RiskLevel.LOW) {
      if (['write', 'modify'].includes(action)) {
        riskLevel = RiskLevel.MEDIUM;
        reasons.push(`State modification / write on ${request.resource} is MEDIUM risk`);
      } else if (request.resource === ResourceType.WEBSITES && ['execute', 'suggest'].includes(action)) {
        riskLevel = RiskLevel.MEDIUM;
        reasons.push('Interactive browser form submission is MEDIUM risk');
      }
    }

    // 4. Low Risk (Default)
    if (riskLevel === RiskLevel.LOW) {
      reasons.push(`Read-only / informational operation on ${request.resource}`);
    }

    // Determine requirements
    const requiresConfirmation = RISK_HIERARCHY[riskLevel] >= RISK_HIERARCHY[RiskLevel.HIGH];
    const prohibitedWithoutElevation = riskLevel === RiskLevel.CRITICAL;

    // Minimum permission mapping
    let minimumPermissionLevel = PermissionLevel.READ;
    if (riskLevel === RiskLevel.MEDIUM) {
      minimumPermissionLevel = PermissionLevel.WRITE;
    } else if (riskLevel === RiskLevel.HIGH) {
      minimumPermissionLevel = PermissionLevel.EXECUTE;
    } else if (riskLevel === RiskLevel.CRITICAL) {
      minimumPermissionLevel = PermissionLevel.ADMIN;
    }

    return {
      riskLevel,
      reasons,
      requiresConfirmation,
      prohibitedWithoutElevation,
      minimumPermissionLevel,
    };
  }

  /**
   * Computes the aggregate risk level across multiple steps.
   */
  public computeOverallRisk(steps: { riskLevel: RiskLevel }[]): RiskLevel {
    if (steps.length === 0) return RiskLevel.LOW;

    let highest = RiskLevel.LOW;
    for (const step of steps) {
      if (RISK_HIERARCHY[step.riskLevel] > RISK_HIERARCHY[highest]) {
        highest = step.riskLevel;
      }
    }
    return highest;
  }
}
