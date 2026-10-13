import { describe, it, expect, beforeEach } from 'vitest';
import { FormAutomation } from '../../src/browser/form-automation.js';
import { DownloadController } from '../../src/browser/download-controller.js';
import { BrowserSession } from '../../src/browser/browser-session.js';
import { BrowserManager } from '../../src/browser/browser-manager.js';
import { BrowserAgent } from '../../src/browser/browser-agent.js';
import { SearchProvider } from '../../src/browser/search-provider.js';
import { PageReader } from '../../src/browser/page-reader.js';
import { PermissionManager } from '../../src/security/permission-manager.js';
import { SecurityGuardian } from '../../src/security/guardian.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';
import { ResourceType, PermissionLevel } from '../../src/security/types.js';
import fs from 'fs';

describe('Phase 17 - FormAutomation', () => {
  const formAutomation = new FormAutomation();

  const sampleForm = {
    formId: 'registration-form',
    action: 'https://example.com/api/register',
    method: 'POST' as const,
    inputs: [
      { name: 'username', type: 'text' as const, required: true },
      { name: 'email', type: 'email' as const, required: true },
      { name: 'password', type: 'password' as const, required: true },
      { name: 'notes', type: 'textarea' as const, required: false },
    ],
  };

  it('validates required fields and detects sensitive credentials', () => {
    const check1 = formAutomation.validateFormSubmission(sampleForm, {
      username: 'dwight',
    });
    expect(check1.valid).toBe(false);
    expect(check1.missingFields).toContain('email');
    expect(check1.missingFields).toContain('password');
    expect(check1.sensitiveFieldsPresent).toBe(true);

    const check2 = formAutomation.validateFormSubmission(sampleForm, {
      username: 'dwight',
      email: 'dwight@example.com',
      password: 'SafePassword123!',
    });
    expect(check2.valid).toBe(true);
    expect(check2.missingFields.length).toBe(0);
  });

  it('executes form filling successfully', () => {
    const result = formAutomation.executeFormFill(
      {
        url: 'https://example.com/register',
        formId: 'registration-form',
        fields: {
          username: 'dwight',
          email: 'dwight@example.com',
          password: 'SafePassword123!',
        },
        submit: true,
      },
      [sampleForm]
    );

    expect(result.formId).toBe('registration-form');
    expect(result.submitted).toBe(true);
    expect(result.filledFields.length).toBe(3);
    expect(result.postSubmitUrl).toBe('https://example.com/api/register');
  });
});

describe('Phase 17 - DownloadController & BrowserSession Workflows', () => {
  const downloadController = new DownloadController();

  it('downloads safe non-executable files to the local environment', async () => {
    const result = await downloadController.downloadFile(
      {
        url: 'https://example.com/whitepaper.pdf',
        destinationFilename: 'whitepaper.pdf',
      },
      'PDF-1.4 Mock Whitepaper Content'
    );

    expect(result.fileName).toBe('whitepaper.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.verifiedSafe).toBe(true);
    expect(fs.existsSync(result.savedPath)).toBe(true);
  });

  it('strictly blocks executable and script file extensions (Invariant)', async () => {
    await expect(
      downloadController.downloadFile({
        url: 'https://example.com/installer.exe',
      })
    ).rejects.toThrow(/executable\/script downloads are strictly prohibited/i);

    await expect(
      downloadController.downloadFile({
        url: 'https://example.com/payload.bat',
      })
    ).rejects.toThrow(/executable\/script downloads are strictly prohibited/i);
  });

  it('manages browser navigation history across back and forward', () => {
    const session = new BrowserSession('https://example.com');
    expect(session.getSessionState().currentUrl).toBe('https://example.com');

    session.navigate('https://example.com/page1');
    session.navigate('https://example.com/page2');
    expect(session.getSessionState().currentUrl).toBe('https://example.com/page2');

    session.back();
    expect(session.getSessionState().currentUrl).toBe('https://example.com/page1');

    session.forward();
    expect(session.getSessionState().currentUrl).toBe('https://example.com/page2');
  });

  it('executes a multi-step web workflow end-to-end', async () => {
    const session = new BrowserSession();
    const searchProvider = new SearchProvider();
    const pageReader = new PageReader();
    const formAutomation = new FormAutomation();

    const workflow = await session.executeWorkflow(
      'Research & Document Collection',
      [
        { type: 'search', target: 'autonomous agents' },
        { type: 'navigate', target: 'https://docs.jarvis-ai.dev/architecture/multi-agent' },
        { type: 'read', target: 'https://docs.jarvis-ai.dev/architecture/multi-agent' },
        { type: 'download', target: 'https://docs.jarvis-ai.dev/spec.json', data: { filename: 'spec.json' } },
      ],
      {
        searchProvider,
        pageReader,
        formAutomation,
        downloadController,
      }
    );

    expect(workflow.workflowName).toBe('Research & Document Collection');
    expect(workflow.success).toBe(true);
    expect(workflow.stepsExecuted).toBe(4);
    expect(workflow.totalSteps).toBe(4);
  });
});

describe('Phase 17 - BrowserManager & Security Guardian Gating', () => {
  let permissionManager: PermissionManager;
  let guardian: SecurityGuardian;
  let auditLogger: AuditLogger;
  let browserManager: BrowserManager;

  beforeEach(() => {
    permissionManager = new PermissionManager();
    guardian = new SecurityGuardian();
    auditLogger = new AuditLogger();

    // Grant WEBSITES execute permissions to authorized user
    permissionManager.grantPermission({
      userId: 'authorized_dwight',
      resource: ResourceType.WEBSITES,
      level: PermissionLevel.EXECUTE,
      allowedActions: ['read', 'write', 'execute'],
      grantedBy: 'admin',
    });

    browserManager = new BrowserManager(permissionManager, guardian, auditLogger);
  });

  it('allows authorized user to search and read pages', async () => {
    const searchRes = await browserManager.searchWeb('typescript', undefined, 'authorized_dwight');
    expect(searchRes.results.length).toBeGreaterThan(0);

    const openRes = await browserManager.openUrl('https://docs.jarvis-ai.dev/guides', 'authorized_dwight');
    expect(openRes.currentUrl).toBe('https://docs.jarvis-ai.dev/guides');

    const pageRes = await browserManager.readPage('https://docs.jarvis-ai.dev/guides', undefined, 'authorized_dwight');
    expect(pageRes.title).toBeDefined();
  });

  it('blocks unauthorized user with permission error', async () => {
    await expect(
      browserManager.searchWeb('secret info', undefined, 'unauthorized_stranger')
    ).rejects.toThrow(/Permission Denied on WEBSITES/i);
  });

  it('Security Guardian intercepts and blocks phishing domains', async () => {
    await expect(
      browserManager.openUrl('https://phishing-account-login.com', 'authorized_dwight')
    ).rejects.toThrow(/suspicious phishing domain|Guardian Security Block/i);
  });

  it('Security Guardian intercepts and blocks scam domains', async () => {
    await expect(
      browserManager.openUrl('https://double-bitcoin-scam.com', 'authorized_dwight')
    ).rejects.toThrow(/potential scam|Guardian Security Block/i);
  });

  it('Security Guardian intercepts and requires confirmation on unverified suspicious links', async () => {
    await expect(
      browserManager.openUrl('https://bit.ly/unverified-redirect', 'authorized_dwight')
    ).rejects.toThrow(/Requires explicit confirmation/i);
  });

  it('executes via BrowserAgent interface', async () => {
    const agent = new BrowserAgent(browserManager);
    const result = await agent.execute(
      { action: 'search', query: 'ai devtools' },
      { userId: 'authorized_dwight', sessionId: 'sess_1', guardian, permissionManager, auditLogger }
    );

    expect(result.success).toBe(true);
    expect(result.agentId).toBe('browser-agent');
    expect((result.data as any).results.length).toBeGreaterThan(0);
  });
});
