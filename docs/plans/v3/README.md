# v3 实施计划：HTML 基线到交互原型工作流

## 计划状态

| 项目 | 内容 |
| --- | --- |
| 对应 PRD | [IT 系统 HTML 基线到交互原型工作流 PRD v3.0](../../PRD.md) |
| 总步骤 | Step 17–35，共 19 步 |
| 当前状态 | **Step 17–35 全部完成并通过验收** |
| 执行方式 | 严格按依赖顺序实施；本目录当前只包含设计计划 |

## 全局实施约束

1. `baseline/pages/*.html` 只有录制链路可以写入；原型生成、验证和交付步骤只读。
2. 录制会话只生成 HTML，不生成截图、PNG、JSON、视频、trace、Codegen 或操作流程。
3. 只有 `capture-spa-html` 是本项目自建工作流 Skill；原型生成、修改、合并和交付均通过自然语言协作，不新增页面 Agent、转换器或工作流 Skill。
4. Element Plus 上游 Skills 仅作为固定版本的组件/设计参考，不包装成新的端到端工作流。
5. 不接真实 API，不使用 Pinia；MVP 数据为前端内存数据，刷新后复位。
6. 验收证据写入 `validation/reports/`，不得混入 `baseline/pages/` 或交付 ZIP。
7. 不自动 Git commit；只有用户明确提出时才提交。
8. 每步必须以本版本新证据从 `PENDING` 转为 `PASS`；旧 v1/v2 PASS 不得复用。

## 顺序与阶段门

| Step | 文件 | 目标 | 依赖 | 状态 |
| ---: | --- | --- | --- | --- |
| 17 | [v3 契约与仓库边界](./step-17-v3-contract-and-repository-layout.md) | 固化范围、目录、写权限和追踪矩阵 | PRD v3 | 已完成 |
| 18 | [`file://` 技术探针](./step-18-file-protocol-technical-spike.md) | 前置验证离线构建可行性 | 17 | 已完成 |
| 19 | [渲染 HTML 序列化](./step-19-rendered-html-serializer.md) | 固化运行态并清除可执行内容 | 17 | 已完成 |
| 20 | [页面命名与原子覆盖](./step-20-page-naming-and-atomic-overwrite.md) | 标题/显式命名及同名覆盖 | 19 | 已完成 |
| 21 | [三入口与会话生命周期](./step-21-capture-controls-and-session-lifecycle.md) | 统一 Capture、关闭与故障恢复 | 20 | 已完成 |
| 22 | [录制 Skill v3](./step-22-capture-skill-v3.md) | 自然语言 URL 启动和通用录制指导 | 21 | 已完成 |
| 23 | [录制子系统验收](./step-23-recorder-v3-acceptance.md) | 封板 HTML-only 录制能力 | 22 | 已完成 |
| 24 | [pure-admin 基准](./step-24-pure-admin-benchmark.md) | 固定可重复本地基准系统 | 17 | 已完成 |
| 25 | [Element Plus Skills 固定](./step-25-element-plus-skills-vendoring.md) | 固定组件/设计参考及许可 | 17 | 已完成 |
| 26 | [基准 HTML 语料库](./step-26-benchmark-baseline-corpus.md) | 录制至少 5 类页面基线 | 23、24 | 已完成 |
| 27 | [原型工程基础](./step-27-prototype-foundation.md) | 建立 Vue 3 + Element Plus 原型 | 18、25、26 | 已完成 |
| 28 | [首次生成摘要与确认](./step-28-first-generation-briefing.md) | 固化自然语言首次确认契约 | 26、27 | 已完成 |
| 29 | [全页面原型生成](./step-29-all-page-prototype-generation.md) | 覆盖全部基线页面及导航 | 28 | 已完成 |
| 30 | [风格、数据与交互](./step-30-fidelity-data-and-interactions.md) | 完成高保真和主要业务交互 | 29 | 已完成 |
| 31 | [自动验证流水线](./step-31-automated-validation-pipeline.md) | 类型、构建、路由、交互和布局验收 | 30 | 已完成 |
| 32 | [离线构建与 ZIP](./step-32-offline-build-and-zip.md) | 完全离线的 `file://` 交付包 | 18、31 | 已完成 |
| 33 | [自然语言迭代闭环](./step-33-natural-language-iteration.md) | 修改旧页并新增页面 | 32 | 已完成 |
| 34 | [新基线合并](./step-34-baseline-refresh-and-merge.md) | 受控合并新录制基线 | 33 | 已完成 |
| 35 | [v3 端到端验收](./step-35-v3-end-to-end-acceptance.md) | 完整工作流封板 | 34 | 已完成 |

关键阶段门：Step 23（录制可用）→ Step 26（输入基线齐备）→ Step 30（原型功能齐备）→ Step 32（交付可用）→ Step 35（v3 完成）。

## 通用验收记录格式

每个 Step 的验收表包含：`ID / 优先级 / 通过标准 / 计划证据 / 结果`。结果只能取：

- `PENDING`：尚未执行；
- `PASS`：已执行且证据可追溯；
- `FAIL`：已执行但未达到标准；
- `BLOCKED`：存在明确外部阻塞，并记录原因。

Step 17–35 已按依赖顺序执行，每步验收表均已依据本版本证据更新为 `PASS`；最终聚合证据见 `validation/reports/step-35-v3-end-to-end-acceptance.md`。
