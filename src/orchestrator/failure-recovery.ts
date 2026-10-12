import { TaskStep, TaskStatus } from './types.js';

export interface RecoveryDiagnosis {
  stepId: string;
  status: TaskStatus;
  rootCause: string;
  recommendation: string;
  canRetry: boolean;
  suggestedWorkaround?: string;
}

export class FailureRecoveryManager {
  public diagnose(step: TaskStep): RecoveryDiagnosis {
    switch (step.status) {
      case 'BLOCKED_BY_LIMITATION':
        return {
          stepId: step.id,
          status: step.status,
          rootCause: step.limitation?.reason || 'Subsystem not implemented in current phase',
          recommendation: `This capability is targeted for Phase ${step.limitation?.targetPhase || 'future'}.`,
          canRetry: false,
          suggestedWorkaround: step.limitation?.workaround || 'Use conversational planning or analytical reasoning instead.',
        };

      case 'BLOCKED_BY_RISK':
        return {
          stepId: step.id,
          status: step.status,
          rootCause: `Action represents ${step.riskLevel} risk and requires explicit administrative confirmation or elevation`,
          recommendation: 'Request human authorization or provide multi-factor approval before retrying.',
          canRetry: false,
          suggestedWorkaround: 'Review risk requirements or execute within a non-destructive sandboxed directory.',
        };

      case 'BLOCKED_BY_PERMISSION':
        return {
          stepId: step.id,
          status: step.status,
          rootCause: `Permission denied: Requires ${step.requiredPermissionLevel} on ${step.resource}`,
          recommendation: `Grant ${step.requiredPermissionLevel} permission on ${step.resource} through the PermissionManager.`,
          canRetry: true,
          suggestedWorkaround: 'Check active grants via /api/permissions and request necessary authorization.',
        };

      case 'FAILED':
      default:
        return {
          stepId: step.id,
          status: step.status,
          rootCause: step.error || 'Execution failure or verification check did not pass.',
          recommendation: 'Inspect step parameters, filesystem permissions, and verification evidence.',
          canRetry: true,
          suggestedWorkaround: 'Review detailed logs in Audit Logger.',
        };
    }
  }
}
