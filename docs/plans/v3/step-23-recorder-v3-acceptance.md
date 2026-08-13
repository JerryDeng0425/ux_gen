# Step 23：录制子系统 v3 验收

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 19–22 |
| 后续步骤 | Step 26 |
| PRD 追踪 | §7、§12.1–12.4、§13 录制指标 |

## 目标

用本地确定性 SPA 和系统 Chrome 对录制子系统独立封板，证明自由 capture、HTML-only、标题/显式命名、同名覆盖、三个入口和异常恢复均达到 v3 门槛。

## 已执行验收命令

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test -- --reporter=list
npm.cmd run acceptance:recorder:v3
```

## 可验收项

| ID | 优先级 | 通过标准 | 结果 |
| --- | --- | --- | --- |
| AC-23-01 | P0 | 任意页面状态 capture 成功 20/20 | PASS |
| AC-23-02 | P0 | 按钮、快捷键、终端分别成功 5/5、5/5、10/10 | PASS |
| AC-23-03 | P0 | 同名覆盖 10/10，仅保留最新 HTML | PASS |
| AC-23-04 | P0 | 基线中 JSON/PNG/截图/视频/trace 为 0 | PASS |
| AC-23-05 | P0 | 显式名、标题、空标题、中文及 Windows 边界名称通过 | PASS |
| AC-23-06 | P0 | 表单、弹窗、主题、路由、滚动状态序列化通过 | PASS |
| AC-23-07 | P0 | HTML 不含站点脚本、`on*`、`javascript:`、meta refresh 或捕获控件 | PASS |
| AC-23-08 | P0 | 浏览器关闭后已有文件完整，CLI 正常结束 | PASS |
| AC-23-09 | P0 | 入口只需 URL 和可选输出目录，不产生 scenario/config | PASS |
| AC-23-10 | P1 | 证据位于 `validation/reports/`，不写入基线目录 | PASS |

## 结果

全量测试 16 项通过；1 项旧 Vuestic 外部测试明确排除在 v3 门禁之外。聚合验收完成 20 次捕获，生成 11 个 HTML、0 JSON、0 PNG；50k 节点序列化 p95 为 104 ms。

证据文件：`validation/reports/step-23-recorder-v3-acceptance.md`
