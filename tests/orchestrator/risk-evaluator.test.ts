import { describe, it, expect } from 'vitest';
import { RiskEvaluator } from '../../src/orchestrator/risk-evaluator.js';
import { RiskLevel } from '../../src/orchestrator/types.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';

describe('Phase 2 Risk Evaluator Tests (Low to High Risk Gating)', () => {
  const evaluator = new RiskEvaluator();

  it('evaluates read-only and conversational actions as LOW risk', () => {
    const result = evaluator.evaluate({
      resource: ResourceType.PROJECTS,
      action: 'read',
      target: 'Tuklas Project',
    });

    expect(result.riskLevel).toBe(RiskLevel.LOW);
    expect(result.requiresConfirmation).toBe(false);
    expect(result.prohibitedWithoutElevation).toBe(false);
    expect(result.minimumPermissionLevel).toBe(PermissionLevel.READ);
  });

  it('evaluates file state writes as MEDIUM risk requiring WRITE permission', () => {
    const result = evaluator.evaluate({
      resource: ResourceType.FILES,
      action: 'write',
      target: 'src/utils/math.ts',
    });

    expect(result.riskLevel).toBe(RiskLevel.MEDIUM);
    expect(result.requiresConfirmation).toBe(false);
    expect(result.minimumPermissionLevel).toBe(PermissionLevel.WRITE);
  });

  it('evaluates command-line execution and file deletions as HIGH risk requiring confirmation', () => {
    const terminalResult = evaluator.evaluate({
      resource: ResourceType.APPLICATIONS,
      action: 'execute',
      target: 'npm test',
    });

    expect(terminalResult.riskLevel).toBe(RiskLevel.HIGH);
    expect(terminalResult.requiresConfirmation).toBe(true);
    expect(terminalResult.minimumPermissionLevel).toBe(PermissionLevel.EXECUTE);

    const deleteResult = evaluator.evaluate({
      resource: ResourceType.FILES,
      action: 'delete',
      target: 'data/records.csv',
    });

    expect(deleteResult.riskLevel).toBe(RiskLevel.HIGH);
    expect(deleteResult.requiresConfirmation).toBe(true);
  });

  it('evaluates camera and microphone streams as HIGH risk', () => {
    const cameraResult = evaluator.evaluate({
      resource: ResourceType.CAMERA,
      action: 'read',
    });

    expect(cameraResult.riskLevel).toBe(RiskLevel.HIGH);
    expect(cameraResult.requiresConfirmation).toBe(true);
  });

  it('evaluates financial transactions and credential theft as CRITICAL risk', () => {
    const financeResult = evaluator.evaluate({
      resource: ResourceType.FINANCIAL_SERVICES,
      action: 'transfer',
      target: 'External account transfer',
    });

    expect(financeResult.riskLevel).toBe(RiskLevel.CRITICAL);
    expect(financeResult.prohibitedWithoutElevation).toBe(true);
    expect(financeResult.minimumPermissionLevel).toBe(PermissionLevel.ADMIN);

    const credResult = evaluator.evaluate({
      resource: ResourceType.APPLICATIONS,
      action: 'execute',
      target: 'dump_passwords /etc/shadow',
    });

    expect(credResult.riskLevel).toBe(RiskLevel.CRITICAL);
    expect(credResult.prohibitedWithoutElevation).toBe(true);
  });

  it('computes overall risk across multiple steps accurately', () => {
    const steps = [
      { riskLevel: RiskLevel.LOW },
      { riskLevel: RiskLevel.MEDIUM },
      { riskLevel: RiskLevel.HIGH },
    ];

    expect(evaluator.computeOverallRisk(steps)).toBe(RiskLevel.HIGH);

    const criticalSteps = [
      { riskLevel: RiskLevel.LOW },
      { riskLevel: RiskLevel.CRITICAL },
    ];

    expect(evaluator.computeOverallRisk(criticalSteps)).toBe(RiskLevel.CRITICAL);
  });
});
