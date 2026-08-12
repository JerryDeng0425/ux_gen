# Step 16：v2 端到端验收

## 目标

用本地确定性 SPA、有界面 Chromium 和 Vuestic Admin 证明自由 capture、HTML-only 与三个入口达到 PRD v2 门槛。

## 可验收项

| ID | 通过标准 | 结果 |
| --- | --- | --- |
| AC-16-01 | typecheck、build、全量本地测试通过 | PASS（12 passed，公网用例默认 skipped） |
| AC-16-02 | 20 次自由 capture 为 20 HTML、0 JSON、0 PNG | PASS |
| AC-16-03 | hotkey 5/5、button 5/5、terminal ≥5/5 | PASS（5/5/10） |
| AC-16-04 | 合法 HTML 全过；篡改/截断失败 | PASS |
| AC-16-05 | 50k 节点 p95 ≤1s，oversized guard 生效 | PASS（headed p95 100ms） |
| AC-16-06 | 有界面 Chromium 自动验收通过 | PASS |
| AC-16-07 | Vuestic Admin 无登录公网回归 | PASS（1/1，4 captures） |

证据：`reports/acceptance-report.json`、`reports/vuestic-acceptance-report.json`、Playwright 测试输出。
