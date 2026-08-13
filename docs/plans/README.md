# 实施计划索引

产品需求见 [PRD](../PRD.md)。当前实施主线为 v3“HTML 基线到交互原型工作流”，其逐步计划位于 [v3/README.md](./v3/README.md)。

## 当前主线

| 版本 | 步骤 | 状态 | 说明 |
| --- | --- | --- | --- |
| v3 | [Step 17–35](./v3/README.md) | 全部完成并通过验收 | HTML 录制、Element Plus 原型、自动验证与离线 ZIP 完整闭环 |

## 历史计划

- Step 12–16：v2 自由 HTML 捕获实现记录，历史结果不作为 v3 验收证据。
- Step 00–11：v1 固定关键点、三件套产物等早期设计，已被后续版本废止。

历史文件保留在本目录，不再追加实现状态：

- [Step 00](./step-00-contracts.md) · [Step 01](./step-01-project-scaffold.md) · [Step 02](./step-02-headed-browser.md)
- [Step 03](./step-03-capture-bridge.md) · [Step 04](./step-04-dom-serializer.md) · [Step 05](./step-05-artifacts.md)
- [Step 06](./step-06-conformance-spa.md) · [Step 07](./step-07-vuestic-scenario.md) · [Step 08](./step-08-validator.md)
- [Step 09](./step-09-reliability.md) · [Step 10](./step-10-codex-skill.md) · [Step 11](./step-11-delivery.md)
- [Step 12](./step-12-free-capture-model.md) · [Step 13](./step-13-html-only-artifact.md) · [Step 14](./step-14-reliable-capture-controls.md)
- [Step 15](./step-15-v2-migration.md) · [Step 16](./step-16-v2-acceptance.md)

## 状态规则

- v3 每个计划在实际实施并产生新证据前保持“未执行 / PENDING”；Step 17–35 现已全部产生本版本 PASS 证据。
- 计划中的命令只是未来验收方式，不表示已经运行。
- 旧版 PASS 不得复制为 v3 PASS。
- 只有用户明确要求执行某一步后，才可修改源码、安装依赖、运行测试或更新该步状态。
