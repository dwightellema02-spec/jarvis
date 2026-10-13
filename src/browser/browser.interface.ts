/**
 * JARVIS Phase 17 - Web & Browser Agent Interfaces
 * Defines structured representations for web search, page reading, form automation,
 * secure file downloads, session states, and browser workflow orchestration.
 */

export interface WebSearchItem {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  publishedDate?: string;
}

export interface WebSearchResult {
  query: string;
  totalResults: number;
  results: WebSearchItem[];
  searchTimeMs: number;
  safeSearchActive: boolean;
}

export interface PageLink {
  text: string;
  href: string;
}

export interface FormInputSpec {
  name: string;
  type: 'text' | 'email' | 'password' | 'checkbox' | 'radio' | 'select' | 'textarea' | 'hidden' | 'submit' | 'button';
  label?: string;
  defaultValue?: string;
  required?: boolean;
  options?: string[]; // for select/radio
}

export interface FormSpec {
  formId: string;
  action: string;
  method: 'GET' | 'POST';
  name?: string;
  inputs: FormInputSpec[];
}

export interface PageReadResult {
  url: string;
  title: string;
  textContent: string;
  markdownContent: string;
  headings: Array<{ level: number; text: string }>;
  links: PageLink[];
  forms: FormSpec[];
  wordCount: number;
  readabilityScore: number; // 0 - 100
  metadata: {
    description?: string;
    author?: string;
    contentType?: string;
    fetchedAt: string;
  };
}

export interface FormFillRequest {
  url: string;
  formId?: string;
  fields: Record<string, string>;
  submit?: boolean;
}

export interface FormFillResult {
  url: string;
  formId: string;
  submitted: boolean;
  filledFields: string[];
  responseStatus: number;
  message: string;
  postSubmitUrl?: string;
}

export interface FileDownloadRequest {
  url: string;
  destinationFilename?: string;
  maxSizeBytes?: number;
}

export interface FileDownloadResult {
  sourceUrl: string;
  savedPath: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  verifiedSafe: boolean;
  downloadTimestamp: string;
}

export interface BrowserSessionState {
  sessionId: string;
  currentUrl: string;
  history: string[];
  historyIndex: number;
  userAgent: string;
  cookiesCount: number;
  activeSince: string;
  lastNavigatedAt: string;
}

export type BrowserStepType = 'navigate' | 'read' | 'fill' | 'search' | 'download';

export interface BrowserWorkflowStep {
  type: BrowserStepType;
  target: string;
  data?: Record<string, any>;
}

export interface BrowserWorkflowResult {
  workflowName: string;
  stepsExecuted: number;
  totalSteps: number;
  success: boolean;
  stepResults: Array<{
    step: number;
    type: BrowserStepType;
    target: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    details?: any;
  }>;
  executionTimeMs: number;
}

export interface BrowserSecurityPolicy {
  allowedProtocols: string[];
  blockedIpRanges: string[];
  disallowedExtensions: string[];
  maxDownloadSizeBytes: number;
  antiSsrfActive: boolean;
}
