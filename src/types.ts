export type CaptureMode = 'exact' | 'settled';

export type KeypointStatus =
  | 'pending'
  | 'capturing'
  | 'completed'
  | 'completed_with_warnings'
  | 'skipped'
  | 'failed';

export type AssertionConfig =
  | { type: 'url'; includes: string }
  | { type: 'exists'; selector: string }
  | { type: 'text'; selector: string; includes: string }
  | { type: 'attribute'; selector: string; name: string; equals: string }
  | { type: 'value'; selector: string; equals: string }
  | { type: 'checked'; selector: string; equals: boolean };

export interface KeypointConfig {
  id: string;
  name: string;
  instruction: string;
  assertions?: AssertionConfig[];
  maskSelectors?: string[];
  redactSelectors?: string[];
}

export interface ScenarioConfig {
  id: string;
  version: string;
  startUrl: string;
  captureMode?: CaptureMode;
  hotkey?: string;
  outputDir?: string;
  redactSelectors?: string[];
  keypoints: KeypointConfig[];
}

export type WarningCode =
  | 'canvas_unreadable'
  | 'iframe_present'
  | 'shadow_dom_present'
  | 'oversized'
  | 'resource_external'
  | 'capture_delayed';

export interface CaptureWarning {
  code: WarningCode;
  message: string;
  count?: number;
}

export interface ScrollPosition {
  selector: string;
  top: number;
  left: number;
}

export interface PageCapturePayload {
  html: string;
  doctype: string;
  requestedAt: string;
  cloneStartedAt: string;
  capturedAt: string;
  originalUrl: string;
  sanitizedUrl: string;
  route: string;
  title: string;
  nodeCount: number;
  htmlBytes: number;
  viewport: { width: number; height: number };
  dpr: number;
  scrollPositions: ScrollPosition[];
  specialContent: {
    canvasTotal: number;
    canvasSerialized: number;
    canvasFailed: number;
    iframeCount: number;
    shadowRootCount: number;
  };
  warnings: CaptureWarning[];
  requestedKeypointId?: string;
  oversized: boolean;
}

export interface ArtifactMetadata extends Omit<PageCapturePayload, 'html' | 'doctype'> {
  runId: string;
  scenarioId: string;
  scenarioVersion: string;
  keypointId: string;
  keypointName: string;
  savedAt: string;
  status: Extract<KeypointStatus, 'completed' | 'completed_with_warnings'>;
  files: { html: string; screenshot: string };
  hashes: { htmlSha256: string; screenshotSha256: string };
  assertions: AssertionConfig[];
  maskSelectors: string[];
}

export interface KeypointRunRecord {
  id: string;
  name: string;
  status: KeypointStatus;
  attempts: number;
  artifactMetadata?: string;
  reason?: string;
  error?: string;
}

export interface RunSummary {
  schemaVersion: 1;
  runId: string;
  scenarioId: string;
  scenarioVersion: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'completed' | 'incomplete' | 'failed';
  browser: { name: 'chromium'; headless: boolean };
  keypoints: KeypointRunRecord[];
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  file?: string;
}

export interface KeypointValidationResult {
  keypointId: string;
  passed: boolean;
  issues: ValidationIssue[];
  visualDiffRatio?: number;
}

export interface ValidationReport {
  runId: string;
  validatedAt: string;
  passed: boolean;
  results: KeypointValidationResult[];
}
