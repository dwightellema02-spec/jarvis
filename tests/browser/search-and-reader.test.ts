import { describe, it, expect } from 'vitest';
import { SearchProvider } from '../../src/browser/search-provider.js';
import { PageReader } from '../../src/browser/page-reader.js';

describe('Phase 17 - SearchProvider', () => {
  const searchProvider = new SearchProvider();

  it('searches indexed corpus and returns ranked results', () => {
    const res = searchProvider.search('autonomous agents security');

    expect(res.query).toBe('autonomous agents security');
    expect(res.totalResults).toBeGreaterThan(0);
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results[0].title).toBeDefined();
    expect(res.results[0].url).toContain('https://');
    expect(res.results[0].domain).toBeDefined();
    expect(res.safeSearchActive).toBe(true);
  });

  it('supports domain scoping in search options', () => {
    const res = searchProvider.search('mathematics', { domain: 'deped.gov.ph' });

    expect(res.results.length).toBeGreaterThan(0);
    for (const item of res.results) {
      expect(item.domain).toContain('deped.gov.ph');
    }
  });

  it('synthesizes reliable fallback references for unindexed queries', () => {
    const res = searchProvider.search('quantum gravity lattice simulation');

    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results[0].url).toContain('wikipedia.org');
  });
});

describe('Phase 17 - PageReader (Sanitization, Markdown & Anti-SSRF)', () => {
  const reader = new PageReader();

  it('parses raw HTML, strips dangerous script tags, and extracts markdown', async () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Quantum Security Manual</title></head>
        <body>
          <script>alert("malicious script");</script>
          <iframe src="http://evil.com"></iframe>
          <h1>Quantum Key Distribution</h1>
          <p>Quantum cryptographic mechanisms guarantee <strong>information-theoretic</strong> privacy.</p>
          <h2>Core Protocols</h2>
          <ul>
            <li>BB84 Protocol</li>
            <li>E91 Entanglement Protocol</li>
          </ul>
          <a href="/docs/bb84">Explore BB84 Specifications</a>
          <form id="auth-check" action="/verify" method="POST">
            <input type="text" name="keyId" required />
            <input type="password" name="authSecret" />
            <button type="submit">Verify</button>
          </form>
        </body>
      </html>
    `;

    const result = await reader.readPage('https://quantum-sec.org/manual', sampleHtml);

    expect(result.url).toBe('https://quantum-sec.org/manual');
    expect(result.title).toBe('Quantum Security Manual');
    expect(result.textContent).not.toContain('malicious script');
    expect(result.textContent).not.toContain('<script>');
    expect(result.markdownContent).toContain('# Quantum Key Distribution');
    expect(result.markdownContent).toContain('## Core Protocols');
    expect(result.headings.length).toBe(2);
    expect(result.headings[0].text).toBe('Quantum Key Distribution');
    expect(result.links.length).toBe(1);
    expect(result.links[0].href).toBe('https://quantum-sec.org/docs/bb84');
    expect(result.forms.length).toBe(1);
    expect(result.forms[0].formId).toBe('auth-check');
    expect(result.forms[0].inputs.length).toBe(2);
    expect(result.wordCount).toBeGreaterThan(5);
    expect(result.readabilityScore).toBeGreaterThan(0);
  });

  it('strictly blocks Anti-SSRF attempts to loopback and metadata addresses', () => {
    // 127.0.0.1
    expect(() => reader.assertUrlSafe('http://127.0.0.1:8080/admin')).toThrow(
      /Anti-SSRF Block: Access to private\/loopback address/i
    );

    // localhost
    expect(() => reader.assertUrlSafe('http://localhost:3000/api/keys')).toThrow(
      /Anti-SSRF Block: Access to private\/loopback address/i
    );

    // AWS/Cloud Metadata IP
    expect(() => reader.assertUrlSafe('http://169.254.169.254/latest/meta-data/')).toThrow(
      /Anti-SSRF Block: Access to private\/loopback address/i
    );

    // Private LAN RFC 1918
    expect(() => reader.assertUrlSafe('http://192.168.1.1/router')).toThrow(
      /Anti-SSRF Block: Access to private RFC 1918 IP/i
    );

    expect(() => reader.assertUrlSafe('http://10.0.0.5/internal')).toThrow(
      /Anti-SSRF Block: Access to private RFC 1918 IP/i
    );

    expect(() => reader.assertUrlSafe('http://172.16.4.20/db')).toThrow(
      /Anti-SSRF Block: Access to private RFC 1918 IP/i
    );

    // Non-HTTP protocol
    expect(() => reader.assertUrlSafe('file:///C:/Windows/System32/cmd.exe')).toThrow(
      /Only HTTP and HTTPS are permitted/i
    );
  });
});
