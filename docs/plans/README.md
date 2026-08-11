# SPA 关键时点 DOM 快照：实施计划索引

## 1. 文档关系

- 产品需求：[PRD.md](../PRD.md)
- 本目录：按顺序执行的实施步骤、验收项和证据要求
- 基准网站：Vuestic Admin
- 实施主线：Playwright CLI + 场景配置 + Codex Skill

核心工具负责浏览器控制、DOM 冻结、产物写入和验证；场景文件描述用户操作关键点；Skill 只负责环境预检、启动、引导、汇总和故障分流。

## 2. 执行顺序

| 步骤 | 文件 | 阶段目标 | 主要退出条件 | 状态 |
| ---: | --- | --- | --- | --- |
| 00 | [锁定实现契约](./step-00-contracts.md) | 统一类型、状态机、限制和退出码 | 契约评审通过，正反例齐全 | 已完成 |
| 01 | [工程与最小 CLI](./step-01-project-scaffold.md) | 建立可构建、可测试的工程 | CLI 帮助、配置校验、测试通过 | 已完成 |
| 02 | [有界面浏览器与终端采集](./step-02-headed-browser.md) | 打通最小人工采集链路 | K01 基础四类产物完整 | 已完成 |
| 03 | [页面快捷键捕获桥](./step-03-capture-bridge.md) | 在页面焦点内精确触发 | 快捷键与终端共用捕获入口 | 已完成 |
| 04 | [DOM Serializer](./step-04-dom-serializer.md) | 固化运行时状态并安全清理 | FR-05/FR-06 测试通过 | 已完成 |
| 05 | [产物与元数据](./step-05-artifacts.md) | 建立原子、可审计的产物协议 | 无半文件、无覆盖、hash 可复算 | 已完成 |
| 06 | [本地一致性测试站点](./step-06-conformance-spa.md) | 稳定覆盖序列化边界 | 离线集成测试可重复通过 | 已完成 |
| 07 | [Vuestic 场景工作流](./step-07-vuestic-scenario.md) | 配置 K01–K04 人工流程 | 新用户可按提示完成四个关键点 | 已完成 |
| 08 | [自动验证器](./step-08-validator.md) | 验证内容、安全和视觉结果 | 篡改、截断、泄漏均能检出 | 已完成 |
| 09 | [可靠性与性能验收](./step-09-reliability.md) | 量化验证 PRD 指标 | 生成可追溯验收报告 | 已完成 |
| 10 | [Codex Skill 封装](./step-10-codex-skill.md) | 用自然语言编排同一 CLI | Skill 校验与前向测试通过 | 已完成 |
| 11 | [端到端验收与交付](./step-11-delivery.md) | 证明工具和 Skill 无功能分叉 | PRD MVP 完成定义全部签收 | 已完成 |

## 3. 实施批次

| 批次 | 步骤 | 可演示结果 |
| --- | --- | --- |
| P1 | 00–02 | 终端触发 K01，生成基础产物 |
| P2 | 03–05 | 快捷键冻结表单和弹窗状态，产物可追溯 |
| P3 | 06、08 | 本地自动验证状态一致性和安全约束 |
| P4 | 07、09 | Vuestic K01–K04 达到量化指标 |
| P5 | 10–11 | Skill 引导完整工作流并完成交付验收 |

粗略工作量：1 名熟悉 TypeScript/Playwright 的开发者约 8–12 个工作日。不包含完全离线资源内联、跨浏览器、登录态复用和 closed Shadow DOM。

## 4. 统一验收规则

每个步骤只有在其文件内全部 P0 验收项通过后才能关闭。每一项至少保留一种证据：

- 自动化测试报告或命令输出；
- 产物文件及其 hash；
- 结构化 JSON 报告；
- 必须人工确认时的检查记录和截图。

验收结果使用 `PASS`、`FAIL`、`BLOCKED`。`BLOCKED` 必须记录阻塞原因、负责人和解除条件，不能等同于通过。P1 增强项不阻塞当前步骤，但应进入 backlog。

## 5. 全局完成标准

1. `docs/PRD.md` 的 MVP 完成定义 8 项都有对应证据。
2. K01–K04 均生成 HTML、PNG、JSON，整次运行生成 summary。
3. 指定文本、属性和表单状态一致率为 100%。
4. 产物中可执行站点脚本、password/file 测试值泄漏和文件覆盖均为 0。
5. 工具模式与 Skill 模式调用同一核心 CLI，没有两套实现。
6. 性能、可靠性和视觉差异满足 PRD 第 11.2 节。

## 6. 实施证据

- 使用入口：[USAGE.md](../USAGE.md)
- 需求追踪：[ACCEPTANCE_MATRIX.md](../ACCEPTANCE_MATRIX.md)
- 本地可靠性与性能：[acceptance-report.json](../../reports/acceptance-report.json)
- Vuestic 20 轮公网验收：[vuestic-acceptance-report.json](../../reports/vuestic-acceptance-report.json)
- Skill：[capture-spa-keypoints](../../skills/capture-spa-keypoints/SKILL.md)
