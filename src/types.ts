export type CaptureMode = 'exact' | 'settled';

export interface ScenarioConfig {
  id: string;
  version: string;
  startUrl: string;
  captureMode?: CaptureMode;
  hotkey?: string;
  outputDir?: string;
  captureButton?: boolean;
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
  requestedLabel?: string;
  requestId?: string;
  oversized: boolean;
}

export interface HtmlCaptureRecord {
  captureId: string;
  label?: string;
  fileName: string;
  filePath: string;
  requestedAt: string;
  capturedAt: string;
  savedAt: string;
  nodeCount: number;
  htmlBytes: number;
  warningCount: number;
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  file?: string;
}

export interface HtmlValidationResult {
  file: string;
  passed: boolean;
  issues: ValidationIssue[];
}

export interface HtmlValidationReport {
  validatedAt: string;
  path: string;
  passed: boolean;
  results: HtmlValidationResult[];
}
