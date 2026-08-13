# SPA 任意时刻 DOM HTML 捕获工具 PRD（v2 归档）

> 状态：已归档。本文档记录升级为完整业务分析原型工作流之前的捕获子系统需求。当前产品需求以 [../PRD.md](../PRD.md) 为准。

## 1. 产品定位

使用 Playwright 打开独立、有界面的 Chromium。用户在 Vue SPA 中自由操作，并可在任意时刻通过页面按钮、`Ctrl+Shift+Y` 或终端命令冻结当前渲染 DOM。每次捕获只保存一个安全静态 HTML，不需要浏览器插件，也不要求固定关键点或步骤顺序。

## 2. 核心能力

- 自由捕获，不使用路由、selector 或业务断言作为门禁。
- 固化表单值、选中状态、弹窗、路由、canvas 和滚动位置。
- 删除脚本、内联事件、`javascript:` URL 和 meta refresh。
- 每次 capture 原子写入一个 HTML，不生成 PNG、捕获 JSON 或 run summary。
- 支持验证单个 HTML 或目录。
- 支持连续捕获、错误恢复和 headed Chromium。

## 3. 历史验收结果

- 连续捕获 20/20。
- 快捷键 5/5、页面按钮 5/5、终端入口 10/10。
- 20 HTML、0 JSON、0 PNG。
- 50,000 节点序列化 p95 低于 1 秒。
- Vuestic Admin 公网回归通过。

## 4. 被 v3 覆盖的内容

v3 将本能力收敛为“HTML 基线录制 Skill”，并在其后增加 Vue 3 + Element Plus 交互原型的生成、自然语言修改、自动验证和离线 ZIP 交付。v3 的简化策略以最终用户访谈结论为准，包括同名覆盖、只保存 HTML、不保存截图或操作轨迹，以及用户自行负责捕获数据和 Git 管理。
