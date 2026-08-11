# Troubleshooting

| Symptom | Meaning | Action |
| --- | --- | --- |
| `capture_in_progress` | A snapshot is already serializing or saving | Wait for its terminal result, then retry |
| Keypoint preconditions failed | The visible page has not reached the configured state | Complete the stated manual step or update a stale versioned selector |
| `oversized` | DOM exceeds 150,000 nodes or 25 MB | Reduce the target state; do not force a partial artifact |
| `canvas_unreadable` | Canvas is tainted or unsupported | Use the reference PNG as visual truth |
| `iframe_present` | Iframe DOM was not embedded | Inspect the PNG and metadata warning |
| `shadow_dom_present` | Shadow content is outside ordinary outerHTML | Inspect the PNG; evaluate explicit open-shadow support separately |
| Hash mismatch | Artifact changed after capture or is corrupt | Preserve the original, recapture, and investigate the writer/storage path |
| Public selector missing | Vuestic or another public site changed | Run reconnaissance, update the scenario version, and retain the old scenario if historical runs depend on it |
| Browser missing | Neither Playwright Chromium nor system Chrome is available | Run `npx playwright install chromium`; the tool can safely fall back to an installed Chrome |
| PowerShell script execution is disabled | Windows policy blocked direct `.ps1` invocation | Invoke with `powershell.exe -NoProfile -ExecutionPolicy Bypass -File <script>`; do not change the machine-wide policy |

Never bypass script, password, file-path, or sensitive-query validation to make a run pass.
