# Step 23 — Recorder v3 acceptance

- Status: PASS
- Acceptance date: 2026-08-13
- Scope: HTML-only recorder, arbitrary capture timing, three capture controls, same-page overwrite, browser-close persistence, URL-first CLI

## Commands

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test -- --reporter=list
npm.cmd run acceptance:recorder:v3
```

## Results

- TypeScript typecheck: PASS
- Production build: PASS
- Automated suite: 16 passed, 1 skipped
- The skipped case is the archived external Vuestic v2 acceptance and is not part of the v3 gate.
- Arbitrary capture requests: 20/20
- Trigger distribution: hotkey 5/5, in-page button 5/5, terminal 10/10
- Generated artifacts: 11 HTML, 0 JSON, 0 PNG
- Same-title overwrite: PASS; hotkey and in-page button captures intentionally converge on the same page file.
- Distinct terminal page names: PASS
- Serialized 50k-node DOM p95: 104 ms
- Oversized DOM guard: PASS
- Static HTML validation: PASS
- Browser-close preservation and graceful CLI exit: PASS

## Gate conclusion

The v3 recorder accepts an HTTP(S) URL directly, permits capture at any user-selected moment, writes only rendered HTML, and preserves the latest capture per page name. No scenario file, flow replay, screenshot, JSON sidecar, or automatic commit is required by the production workflow.
