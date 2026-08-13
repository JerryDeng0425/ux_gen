# Step 24 — Pure Admin benchmark acceptance

- Status: PASS
- Date: 2026-08-13
- Upstream tag: `v7.0.0`
- Commit: `b8177a202dceb1412d3bf56f3d15483dc1606c9c`
- Runtime: Node `v24.18.0`, pnpm `11.16.0`, system Chrome, viewport `1280×800`

## Results

- Official archive, lockfile and MIT license hashes: PASS
- `pnpm install --frozen-lockfile` first run: PASS after applying the recorded pnpm 11 compatibility file
- Second frozen install: PASS, lockfile unchanged
- Local Vite startup on `127.0.0.1:4178`: PASS
- Mock `/login` response and admin role: PASS
- Real login UI with locally generated captcha: PASS
- Dynamic route navigation: PASS
- Dashboard, query table, form/detail, dialog, account settings/theme: 5/5 PASS
- Basic dialog open interaction: PASS
- External business XHR: 0
- Browser runtime errors: 0
- Recorder authentication coupling: 0

## Command

```powershell
npx.cmd playwright test tests/benchmark/pure-admin.spec.ts --reporter=list
```

Result: 1 passed.
