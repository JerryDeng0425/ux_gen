---
name: capture-spa-keypoints
description: Launch, guide, resume, and validate Playwright-based snapshots of rendered SPA DOM at named keypoints. Use when Codex needs to open a headed Chromium for manual SPA operation, export the current DOM as HTML/PNG/JSON, run the Vuestic Admin scenario, inspect snapshot warnings, resume a failed capture, or validate an existing SPA snapshot run directory.
---

# Capture SPA Keypoints

Use the repository CLI as the only implementation of browser control, serialization, artifact writing, and validation. Do not reproduce those operations in ad-hoc browser JavaScript.

## Run a capture workflow

1. Locate the repository root three levels above this skill's `scripts` directory unless the user supplies another project root.
2. On Windows, run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/preflight.ps1`; stop on any failed P0 check. Use the equivalent host shell invocation elsewhere.
3. Read [references/cli-contract.md](references/cli-contract.md) when selecting CLI flags or handling exit codes.
4. Use `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/run-workflow.ps1` to launch the selected scenario. Default to `scenarios/vuestic.json`.
5. Keep the terminal session alive while the user operates the headed browser.
6. Echo the current keypoint instruction. Accept page hotkey `Ctrl+Shift+Y` or terminal `capture [Kxx]`.
7. After each capture, report the metadata path and distinguish failures from warnings.
8. On `finish`, read `run-summary.json` and state completed, skipped, failed, and pending keypoints.

Do not click or fill the business page unless the user explicitly requests an automated execution. The normal product workflow preserves manual user operation.

## Validate a run

1. Run `scripts/run-workflow.ps1 -ValidateRunDir <path>`.
2. Read `validation-report.json`.
3. Report errors first, then non-blocking warnings such as iframe, Shadow DOM, or unreadable canvas.
4. Link the run directory and evidence files. Do not modify the captured HTML during validation.

## Recover failures

- For missing Node, packages, Chromium, or output permissions, follow the exact action emitted by preflight.
- For `capture_in_progress`, wait for the current capture result before retrying.
- For failed keypoint assertions, return focus to the browser and have the user complete the stated condition.
- For a stale public-site selector, read [references/troubleshooting.md](references/troubleshooting.md) and update the versioned scenario instead of weakening validation.
- For schema changes or custom sites, read [references/scenario-schema.md](references/scenario-schema.md).

Never export cookies, Web Storage, IndexedDB, passwords, file paths, or unredacted token-like query parameters.
