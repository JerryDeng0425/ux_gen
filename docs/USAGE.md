# 使用说明

## 安装与预检

```powershell
npm install
powershell -NoProfile -ExecutionPolicy Bypass -File skills/capture-spa-html/scripts/preflight.ps1
```

## 启动 HTML 录制

```powershell
npm run snapshot -- run --url https://your-system.example/app --output baseline/pages
```

Playwright 打开隔离、有界面的 Chromium。用户自行登录和操作，可随时：

- 点击 **Capture HTML**；
- 聚焦页面后按 `Ctrl+Shift+Y`；
- 在终端输入 `capture` 或 `capture <页面名称>`。

按钮、快捷键和无参终端命令使用当前页面标题；显式名称优先。同名页面直接覆盖，目录只保留最新 HTML。不生成截图、JSON、Codegen、视频、trace、操作流程或 run summary。

终端还支持 `status`、`finish`、`quit` 和 `help`。直接关闭浏览器也会保留已成功写入的页面并正常结束。

## 验证

```powershell
npm run snapshot -- validate --path baseline/pages
```

验证只检查 HTML 完整性、必要 metadata、可执行内容清理和捕获控件泄漏，不执行业务数据脱敏或 Git 门禁。

## 边界

- HTML 是只读事实基线，不恢复 Vue 状态管理或事件监听器。
- CSS、图片和字体可继续引用原地址；录制阶段不下载资源。
- canvas 像素、跨域 iframe 和 Shadow DOM 不能完整表达时，只在 HTML metadata 中告警。
- 不复用用户日常 Chrome profile；URL 只用于本次会话。
