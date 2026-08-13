# v3 validation contract

发布聚合报告必须满足 `prototype-validation.schema.json`：Chrome、Edge、至少 7 个 route、至少 3 个交互组和 7 个基线 hash 都是必填。状态语义：`PASS` 仅表示执行并通过；`FAIL` 表示门禁失败；`SKIP` 只用于非发布的显式排除项；`BLOCKED` 表示必需环境缺失。Chrome 或 Edge 缺失时发布状态必须为 `BLOCKED`/`FAIL`，不得 `SKIP` 或 `PASS`。

报告和测试产物只能写入 `validation/reports/` 或系统临时目录；截图、视频和 trace 永久关闭。
