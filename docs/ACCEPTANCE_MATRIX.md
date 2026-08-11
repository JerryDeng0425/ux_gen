# MVP 需求—验收证据矩阵

| PRD 完成项 | 自动化证据 | 当前状态 |
| --- | --- | --- |
| 一个命令启动有界面 Chromium | `SnapshotRunner`、CLI `run`、Vuestic E2E | PASS |
| 用户可手工操作 | headed context，不注入可见业务控件 | PASS |
| 快捷键和终端均可捕获 | hotkey binding 测试、`captureFromPage` 集成测试 | PASS |
| K01–K04 生成 HTML/PNG/JSON | conformance E2E、Vuestic E2E | PASS |
| 表单、选中、弹窗、路由固化 | serializer 与四关键点断言 | PASS |
| 不含密码、文件路径、可执行脚本 | serializer/validator 安全负向测试 | PASS |
| 自动验证满足门槛 | `reports/acceptance-report.json` | PASS |
| 不可序列化内容明确告警 | canvas/iframe/Shadow DOM fixture | PASS |

## 已执行指标

- K01–K04 本地确定性能力：各 20/20。
- 快捷键请求到克隆开始 p95：见 `reports/acceptance-report.json`。
- 50,000 节点序列化 p95：见同一报告。
- 产物保存 p95：见同一报告。
- 150,000 节点上限：oversized guard 已通过。
- Vuestic 公网重复验收：见 `reports/vuestic-acceptance-report.json`；该结果与具体运行日期和场景版本绑定。

## 依赖与环境证据

- 最终锁定：Playwright 1.55.1、Vite 7.3.6、Ajv 8.20.0。
- 最终 `npm install` 审计结果：0 vulnerabilities。
- Playwright 1.55.1 在系统 Chrome 151 fallback 上完成全量本地构建、测试和性能验收。
- Vuestic 20/20 报告生成于安全升级前的 Playwright 1.55.0；其场景和应用代码未变。升级后的公网重跑因自动审批服务容量错误未获执行权限，未绕过该限制。
