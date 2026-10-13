/**
 * JARVIS Phase 18 - Safe Window Management & UI Automation Adapter
 */

import { AppDefinition, WindowActionResult } from '../app.interface.js';

export class WindowAdapter {
  private protectedWindowTitles = [
    /user account control/i,
    /credential/i,
    /windows security/i,
    /password/i,
    /authentication dialog/i,
    /sudo/i,
  ];

  public assertWindowActionPermitted(windowTitle: string): void {
    for (const pattern of this.protectedWindowTitles) {
      if (pattern.test(windowTitle)) {
        throw new Error(
          `Security Block: UI Automation is strictly prohibited on sensitive system dialog "${windowTitle}".`
        );
      }
    }
  }

  public async controlWindow(
    app: AppDefinition,
    action: 'focus' | 'minimize' | 'maximize' | 'restore',
    targetTitle?: string,
    simulate = true
  ): Promise<WindowActionResult> {
    const start = Date.now();
    const effectiveTitle = targetTitle || `${app.name} Main Window`;

    this.assertWindowActionPermitted(effectiveTitle);

    if (!app.supportedProtocols.includes('ui_automation')) {
      throw new Error(`Application "${app.name}" is not configured for UI automation window control.`);
    }

    return {
      success: true,
      appId: app.id,
      action,
      windowTitle: effectiveTitle,
      durationMs: Date.now() - start || 1,
    };
  }
}
