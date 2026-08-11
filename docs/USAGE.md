# 使用说明

## 安装与检查

```powershell
npm install
npx playwright install chromium
npm run typecheck
npm test
```

也可以运行 Skill 的预检：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File skills/capture-spa-keypoints/scripts/preflight.ps1
```

## 启动人工采集

```powershell
npm run snapshot -- run --scenario scenarios/vuestic.json --output artifacts
```

Playwright 会启动有界面 Chromium。按场景提示手工操作，到达关键点时在页面按 `Ctrl+Shift+Y`；也可在终端输入 `capture` 或 `capture K03`。

其他终端命令：`status`、`skip K03 <reason>`、`finish`、`quit`。

## 验证历史运行

```powershell
npm run snapshot -- validate --run-dir artifacts/<run-id>
```

添加 `--visual` 执行联网视觉回放。默认结构验证不会执行快照中的站点脚本。

## 自动验收

```powershell
npm run acceptance
```

公网 Vuestic 单次或重复验收：

```powershell
$env:VUESTIC_ITERATIONS = "1"
npm run acceptance:vuestic
```

## 已知限制

- HTML 是冻结快照，不恢复 Vue/Pinia 内存或事件监听器。
- MVP 依赖线上 CSS、图片和字体，不保证完全离线外观。
- 跨域 iframe、Shadow DOM、tainted canvas 和 WebGL 以 warning 与 PNG 作为补充证据。
- 默认单业务标签页、Chromium；不复用日常 Chrome profile 或登录态。
