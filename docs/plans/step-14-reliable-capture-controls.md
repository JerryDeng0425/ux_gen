# Step 14：可靠捕获入口

## 目标

修复手工 `Ctrl+Shift+Y` 无反馈问题，并提供页面按钮与终端命令两个无需插件的可靠兜底。

## 实施项

1. 在 window capture phase 监听 keydown/keyup，并使用 `event.code` 与 `event.key`。
2. 只对 hotkey 的同一按键动作做时间窗去重，不误杀按钮操作。
3. 注入 Shadow DOM **Capture HTML** 按钮和短状态反馈。
4. 序列化时删除捕获控件宿主。
5. 导航时由 init script 自动重新安装监听器和按钮。
6. 快捷键、按钮、终端共用 request/serializer/binding/writer。

## 可验收项

| ID | 通过标准 | 结果 |
| --- | --- | --- |
| AC-14-01 | 有界面浏览器快捷键 5/5，每次一份 HTML | PASS |
| AC-14-02 | 页面按钮 5/5 且有反馈 | PASS |
| AC-14-03 | 终端入口至少 5/5 | PASS |
| AC-14-04 | 路由切换后入口仍工作 | PASS |
| AC-14-05 | HTML 不含捕获按钮宿主 | PASS |
| AC-14-06 | keydown/keyup 不重复落盘 | PASS |

证据：headed `reports/acceptance-report.json`、serializer/capture-flow 集成测试。
