# Step 32：完全离线构建与 ZIP 交付

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 18、31 |
| 后续步骤 | Step 33、35 |
| PRD 追踪 | §10、§9.7–9.10、§12.9–12.10、§13 离线指标 |

## 可验收项

| ID | 优先级 | 通过标准 | 结果 |
| --- | --- | --- | --- |
| AC-32-01 | P0 | ZIP 根级含 `index.html`，无嵌套目录 | PASS |
| AC-32-02 | P0 | 本地资源引用完整，缺失为 0 | PASS |
| AC-32-03 | P0 | 断网运行时网络请求为 0 | PASS |
| AC-32-04 | P0 | 中文+空格目录 Chrome/Edge `file://` 2/2 | PASS |
| AC-32-05 | P0 | 全路由和关键交互在解压包中通过 | PASS（12/12） |
| AC-32-06 | P0 | 无绝对路径、`..`、源码、依赖或报告 | PASS |
| AC-32-07 | P0 | inventory、文件 hash 和 ZIP SHA256 可追溯 | PASS |
| AC-32-08 | P1 | 真实 OS 双击打开 | 自动等价 `file://` PASS；物理动作不可由 Playwright 证明 |

证据：`validation/reports/step-32-offline-package.md`、`scripts/package-offline.ps1`。
