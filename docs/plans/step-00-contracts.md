# Step 00：锁定实现契约

## 目标

把 PRD 转换成后续模块共同依赖的类型、状态机、配置格式和错误语义，避免实现期间产生不兼容解释。

## 前置条件

- 已确认 [PRD](../PRD.md) 为当前需求基线。
- MVP 固定为 Chromium、单业务页、联网回放和人工操作。

## 实施任务

1. 定义 `ScenarioConfig`、`KeypointConfig`、`CapturePayload`、`ArtifactMetadata`、`RunSummary`。
2. 定义状态：`pending`、`capturing`、`completed`、`completed_with_warnings`、`skipped`、`failed`。
3. 定义 `requestedAt`、`capturedAt`、`savedAt` 的产生位置和时区格式。
4. 定义 warning code：canvas、iframe、Shadow DOM、oversized、资源和隐私相关告警。
5. 固定 25 MB、150,000 节点、单业务页等限制。
6. 定义 CLI 退出码和失败分类，区分配置错误、运行错误、未完成关键点和验证失败。
7. 编写场景 schema 的最小合法示例与各类非法反例。

## 交付物

- 核心 TypeScript 类型草案。
- 场景 JSON Schema 和示例。
- 状态迁移表、warning code 表、退出码表。
- 契约决策记录。

## 可验收项

| ID | 验证方法 | 通过标准 | 验收证据 |
| --- | --- | --- | --- |
| AC-00-01 | 对照 PRD FR-02、FR-07 检查字段映射 | PRD 要求字段全部能映射到类型或 schema，无未解释字段 | 字段映射表 |
| AC-00-02 | 用合法 Vuestic 示例执行 schema 校验 | 校验成功且不产生未知字段警告 | 校验输出、示例 JSON |
| AC-00-03 | 分别删除 `id`、`startUrl`、`keypoints` | 三个非法示例均被拒绝，错误指向具体字段 | 反例测试结果 |
| AC-00-04 | 审查状态迁移 | 不允许从 `completed` 回到 `capturing`；失败后允许显式重试 | 状态迁移测试或评审记录 |
| AC-00-05 | 审查时间语义 | 三个时间字段都有唯一产生方，统一使用 ISO 8601 UTC | 契约文档 |
| AC-00-06 | 审查退出码 | 自动化调用可仅凭退出码区分成功、配置错误和验证失败 | 退出码表及示例 |
| AC-00-07 | 对照 PRD 非目标 | 契约未承诺离线完整交互、浏览器存储或 Vue 内存恢复 | 评审记录 |

## 完成判定

所有 P0 验收项为 `PASS`，类型/schema 变更进入评审控制；后续破坏性修改需要同步更新场景版本和验证器。

## 后续步骤

[Step 01：工程与最小 CLI](./step-01-project-scaffold.md)
