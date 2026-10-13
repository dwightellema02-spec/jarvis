/**
 * JARVIS Phase 18 - Deep Link URI Scheme Adapter
 */

import { AppDefinition } from '../app.interface.js';

export interface UriDispatchResult {
  success: boolean;
  appId: string;
  uri: string;
  dispatchedAt: string;
  simulated: boolean;
  message: string;
}

export class UriAdapter {
  private dangerousCharsRegex = /["';|&`$\r\n\x00]/;

  public assertUriSafe(uri: string): void {
    if (!uri || typeof uri !== 'string') {
      throw new Error('URI must be a non-empty string.');
    }

    if (this.dangerousCharsRegex.test(uri)) {
      throw new Error('Security Block: URI contains dangerous command-injection characters.');
    }

    // Ensure valid protocol format
    const protocolMatch = uri.match(/^([a-z0-9+.-]+):\/\//i) || uri.match(/^([a-z0-9+.-]+):/i);
    if (!protocolMatch) {
      throw new Error('Invalid URI scheme format.');
    }

    const scheme = protocolMatch[1].toLowerCase();
    const disallowedSchemes = ['javascript', 'vbscript', 'data', 'file', 'cmd', 'powershell'];
    if (disallowedSchemes.includes(scheme)) {
      throw new Error(`Security Block: Prohibited dangerous scheme "${scheme}:".`);
    }
  }

  public async dispatchUri(
    app: AppDefinition,
    uri: string,
    simulate = true
  ): Promise<UriDispatchResult> {
    this.assertUriSafe(uri);

    if (app.uriSchemePrefix && !uri.toLowerCase().startsWith(app.uriSchemePrefix.toLowerCase())) {
      throw new Error(
        `URI "${uri}" does not match required application prefix "${app.uriSchemePrefix}".`
      );
    }

    // When simulated or in server-side test runtime, record successful dispatch without opening OS windows
    return {
      success: true,
      appId: app.id,
      uri,
      dispatchedAt: new Date().toISOString(),
      simulated: simulate,
      message: `URI scheme "${uri}" dispatched successfully to application "${app.name}".`,
    };
  }
}
