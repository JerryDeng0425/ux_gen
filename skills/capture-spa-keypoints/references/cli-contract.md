# CLI contract

## Start

```powershell
npm run snapshot -- run --scenario scenarios/vuestic.json --output artifacts
```

Options:

- `--scenario <file>`: required versioned scenario JSON.
- `--output <dir>`: artifact root; defaults to scenario output or `artifacts`.
- `--headless`: testing only. Omit for manual operation.

Interactive commands:

- `capture`: capture the next pending or failed keypoint.
- `capture K03`: capture a named keypoint.
- `status`: show URL and all keypoint states.
- `skip K03 reason`: skip with an auditable reason.
- `finish`: close and write the final summary.
- `quit`: require confirmation if work remains.

## Validate

```powershell
npm run snapshot -- validate --run-dir artifacts/<run-id>
```

Add `--visual` for online screenshot replay.

## Exit codes

- `0`: success.
- `2`: CLI or scenario configuration error.
- `3`: browser/runtime failure.
- `4`: session ended with unfinished keypoints.
- `5`: validation failure.
