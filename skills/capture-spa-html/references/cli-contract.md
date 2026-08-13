# CLI contract

## Start

```powershell
npm run snapshot -- run --url <http-or-https-url> --output baseline/pages
```

- `--url` is required for this session and is never stored as project configuration.
- `--output` defaults to `baseline/pages`.
- Omit `--headless` for user recording.

Commands: `capture [name]`, `status`, `finish`, `quit`, `help`.

Button, shortcut, and terminal `capture` without a name use the current document title. An explicit terminal name wins. The safe page name maps to one HTML; the latest same-name capture atomically overwrites it.

## Validate

```powershell
npm run snapshot -- validate --path baseline/pages
npm run snapshot -- validate --path "baseline/pages/用户管理.html"
```

Exit codes: `0` success, `2` CLI input, `3` browser/runtime, `5` HTML validation.
