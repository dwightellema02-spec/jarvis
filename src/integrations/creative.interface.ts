export type CreativeMediaType = 'IMAGE' | 'VIDEO' | 'ANIMATION' | 'AUDIO' | 'PRESENTATION' | 'DOCUMENT';

export interface CreativeTaskSpec {
  mediaType: CreativeMediaType;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  targetFormat?: string;
  parameters?: Record<string, unknown>;
}

export interface CreativeArtifactResult {
  taskId: string;
  mediaType: CreativeMediaType;
  assetUri: string;
  format: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ICreativeCoordinator {
  readonly supportedMedia: CreativeMediaType[];
  submitTask(spec: CreativeTaskSpec): Promise<{ taskId: string; status: 'queued' | 'processing' }>;
  checkStatus(taskId: string): Promise<{ status: string; result?: CreativeArtifactResult; error?: string }>;
}
