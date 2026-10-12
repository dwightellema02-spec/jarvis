import { KnowledgeDomain } from '../memory/knowledge.interface.js';

export type DocumentType =
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'csv'
  | 'txt'
  | 'image'
  | 'paper'
  | 'note'
  | 'unknown';

export interface DocumentMetadata {
  id: string;
  filename: string;
  fileType: DocumentType;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
  author?: string;
  pageCount?: number;
  rowCount?: number;
  columnCount?: number;
  tags?: string[];
  sourcePath?: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  pageNumber?: number;
  level?: number;
}

export interface NumericColumnStats {
  count: number;
  nullCount: number;
  sum: number;
  mean: number;
  min: number;
  max: number;
  median?: number;
  stdDev?: number;
}

export interface CategoricalColumnStats {
  count: number;
  distinctCount: number;
  topValues: { value: string; frequency: number }[];
}

export interface ParsedTable {
  id: string;
  name?: string;
  headers: string[];
  rows: (string | number | boolean | null)[][];
  rowCount: number;
  columnCount: number;
  columnTypes: Record<string, 'number' | 'string' | 'boolean' | 'date'>;
  numericStats?: Record<string, NumericColumnStats>;
  categoricalStats?: Record<string, CategoricalColumnStats>;
}

export interface ExtractedEntities {
  dates: string[];
  numbers: { value: number; unit?: string; raw: string }[];
  emails: string[];
  urls: string[];
  keyTerms: string[];
}

export interface ParsedDocument {
  metadata: DocumentMetadata;
  rawText: string;
  sections: DocumentSection[];
  tables: ParsedTable[];
  citations?: string[];
  entities: ExtractedEntities;
  isScanned?: boolean;
  warnings?: string[];
}

export interface DocumentSummary {
  documentId: string;
  filename: string;
  title: string;
  overview: string;
  keyPoints: string[];
  topics: string[];
  wordCount: number;
  estimatedReadMinutes: number;
  sectionCount: number;
  tableCount: number;
}

export interface DocumentSearchResult {
  documentId: string;
  sectionTitle?: string;
  pageNumber?: number;
  lineNumber?: number;
  snippet: string;
  relevanceScore: number;
  matchedTerms: string[];
}

export interface DocumentComparison {
  docA: { id: string; filename: string; title: string };
  docB: { id: string; filename: string; title: string };
  similarityScore: number; // 0.0 - 1.0
  commonThemes: string[];
  docAExclusive: string[];
  docBExclusive: string[];
  contradictions: string[];
  metricsComparison?: {
    wordCountDiff: number;
    tableCountDiff: number;
  };
}

export interface DocumentQAResponse {
  documentId: string;
  question: string;
  answer: string;
  confidence: number;
  sourceSnippets: {
    sectionTitle?: string;
    text: string;
    relevanceScore: number;
  }[];
}

export interface TabularAnalysisQuery {
  filterColumn?: string;
  filterOperator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
  filterValue?: string | number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface TabularAnalysisResult {
  tableId: string;
  tableName?: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  columnTypes: Record<string, string>;
  numericSummary: Record<string, NumericColumnStats>;
  categoricalSummary: Record<string, CategoricalColumnStats>;
  filteredRows?: (string | number | boolean | null)[][];
  insights: string[];
}

export interface BuildKnowledgeResult {
  documentId: string;
  createdNodes: {
    id: string;
    title: string;
    domain?: KnowledgeDomain;
    category: string;
  }[];
  summary: string;
}
