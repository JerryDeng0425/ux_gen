# v3 仓库与写权限契约

## 目录所有权

| 路径 | 职责 | 允许写入者 | Git 默认策略 |
| --- | --- | --- | --- |
| `src/`、`tests/` | Playwright HTML 录制器 | 录制器开发步骤 | 跟踪 |
| `skills/capture-spa-html/` | 唯一自建工作流 Skill | Step 22 | 跟踪 |
| `skills/element-plus/` | 固定的上游组件/设计参考 | Step 25 的显式 vendoring | 跟踪 |
| `baseline/pages/` | 每个页面最新的只读 HTML 基线 | 仅录制器 capture/重录 | 由用户决定；工具不改 Git 策略 |
| `benchmark/` | 固定基准来源、manifest 和许可 | Step 24 | manifest/许可跟踪；上游副本忽略 |
| `prototype/` | Vue 3 + Element Plus 原型源码 | 自然语言原型步骤 | 源码/锁文件跟踪，构建物忽略 |
| `validation/` | 测试契约和证据 | 验证步骤 | 契约跟踪，逐次运行报告忽略 |
| `delivery/` | 可再生离线目录和 ZIP | Step 32/33/35 | 忽略派生物 |
| `spikes/` | 有界技术探针 | 对应技术步骤 | 源码/决策跟踪，依赖/构建物忽略 |

## 不可变边界

1. 除 capture/重录外，任何实现、生成、验证或交付步骤必须在操作前后比较 `baseline/pages/*.html` SHA256。
2. 捕获目录只允许 HTML；验证 JSON、DOM 摘要和环境信息写入 `validation/reports/`。
3. `capture-spa-html` 是唯一自建端到端 Skill。Element Plus Skills 是固定上游组件参考，不承担工作流编排。
4. 不实现页面 Agent、HTML→Vue 确定性转换器、操作流程记录器、版本中心或真实 API 集成。
5. 自动流程不得运行 `git commit`、`git push` 或改变当前 Git ref。

## v2 退场清单

- 生产 CLI 不再依赖 scenario 文件；URL 仅作为本次调用参数。
- 不再使用序号文件名、碰撞副本或按 session 划分基线。
- 不再以 Vuestic Admin 为默认目标。
- 不再提供 selector 脱敏配置或业务隐私扫描门禁。
- `reports/*.json` 和 Step 00–16 PASS 只作为历史记录，不计入 v3 验收。

## 变更失败边界

- 原型或验证失败不得修改基线来迁就实现。
- capture 写入失败必须保留最后一个成功 HTML。
- 离线构建或 ZIP 失败必须保留最近一次验证通过的交付物。
