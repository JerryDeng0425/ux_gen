---
name: capture-spa-html
description: Launch a headed Playwright Chromium for a user to manually browse any HTTP(S) Vue or other SPA and freely save the currently rendered DOM as HTML. Use when the user asks to record, capture, freeze, or collect rendered SPA pages at arbitrary moments with a button, Ctrl+Shift+Y, or terminal command, or asks to validate those captured HTML files.
---

# Capture SPA HTML

Use the repository CLI; do not recreate its serializer with ad-hoc browser JavaScript.

## Record

1. Obtain the target HTTP(S) URL from the request.
2. Run `scripts/preflight.ps1` against the repository root.
3. Read [references/cli-contract.md](references/cli-contract.md), then run `scripts/run-workflow.ps1 -Url <url>`.
4. Keep the terminal alive while the user logs in and operates the headed, isolated Chromium.
5. Tell the user they may capture at any moment with **Capture HTML**, `Ctrl+Shift+Y`, or terminal `capture [name]`.
6. Report each saved HTML path. A repeated page name overwrites that page; no version history is kept.
7. End with `finish`, `quit`, or browser close and report the latest page files.

Do not operate the business page unless explicitly requested. Do not require a route, selector, fixed checkpoint, flow, screenshot, Codegen, JSON sidecar, or completion checklist.

## Validate

Run `scripts/run-workflow.ps1 -ValidatePath <html-or-directory>`. Report blocking errors before embedded warnings; do not modify captured HTML.

For failures, read [references/troubleshooting.md](references/troubleshooting.md).
