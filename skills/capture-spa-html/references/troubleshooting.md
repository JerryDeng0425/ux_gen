# Troubleshooting

| Symptom | Action |
| --- | --- |
| `Ctrl+Shift+Y` does nothing | Click the page body and retry. If browser/OS UI intercepts it, click **Capture HTML** or type `capture` in the terminal. |
| Capture button is absent | Reload once. The runtime also remounts the button after SPA body replacement; terminal capture remains available. |
| `capture_in_progress` | Wait for the current serialization, then retry. |
| `oversized` | The DOM exceeds 150,000 nodes or 25 MB; reduce it rather than saving a partial file. |
| `canvas_unreadable` | Canvas pixels are not embedded because capture is HTML-only; the canvas node and warning remain. |
| `iframe_present` | Iframe DOM is not embedded. Capture the frame separately if it is in scope. |
| `shadow_dom_present` | Ordinary `outerHTML` cannot represent that shadow root. |
| Validation reports scripts or inline handlers | Treat the HTML as unsafe/corrupt and recapture; do not weaken validation. |
| Browser missing | Install Playwright Chromium or use the installed system Chrome fallback. |

The floating capture control lives in its own Shadow DOM and is removed from every saved snapshot.
