# Step 02：有界面浏览器与终端采集基线

## 目标

完成 PRD M1：一个命令启动有界面 Chromium，允许用户手工操作，并由终端命令采集 K01 基础产物。

## 前置条件

- Step 01 工程和 CLI 已验收。
- Chromium 已通过 Playwright 安装。
- 运行环境可访问 Vuestic Admin。

## 实施任务

1. 用 Playwright 启动 `headless: false` 的隔离 browser context。
2. 打开场景 `startUrl`，维护当前业务页面引用。
3. 监听页面、context 和浏览器关闭事件。
4. 用 `readline` 实现 `capture`、`capture <id>`、`status`、`finish`、`quit`。
5. 首版用 `page.content()` 和 `page.screenshot()` 生成 K01 基线。
6. 写出初版 metadata 与 `run-summary.json`。
7. 写入采用临时文件后原子重命名，失败时保留浏览器供用户重试。

## 交付物

- 有界面浏览器 session 管理器。
- 交互式终端命令。
- K01 HTML、PNG、JSON 和 run summary 基线。

## 可验收项

| ID | 验证方法 | 通过标准 | 验收证据 |
| --- | --- | --- | --- |
| AC-02-01 | 运行 Vuestic 场景 | 出现正常可操作的 Chromium 窗口并打开 Dashboard | 启动日志、截图 |
| AC-02-02 | 在页面中手工导航和滚动 | 工具不抢占操作，`status` 返回当前 URL | 操作记录、status 输出 |
| AC-02-03 | 执行 `capture K01` | 同一目录生成非空 HTML、PNG、JSON | 产物清单及大小 |
| AC-02-04 | 执行 `finish` | 生成 summary，记录 K01 完成状态并正常关闭浏览器 | `run-summary.json` |
| AC-02-05 | 模拟一次写入失败 | 本次不标记完成，不产生最终命名的半文件，浏览器仍可继续使用 | 故障注入日志 |
| AC-02-06 | 连续捕获 K01 两次 | 历史文件不被覆盖，命名可区分 | 两组文件及 hash |
| AC-02-07 | 手工关闭浏览器 | CLI 安全退出并保存已完成结果 | 退出码、summary |
| AC-02-08 | 执行 `quit` 且存在未完成关键点 | 工具要求确认，取消后会话继续 | 交互测试记录 |

## 完成判定

K01 基线四类产物完整；异常写入、重复捕获和浏览器关闭行为均通过测试。

## 后续步骤

[Step 03：页面快捷键捕获桥](./step-03-capture-bridge.md)
