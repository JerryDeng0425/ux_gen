# Step 21：三种 Capture 入口与会话生命周期

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 20 |
| 后续步骤 | Step 22、23 |
| PRD 追踪 | FR-REC-01、FR-REC-02、FR-REC-04 |

## 目标

让页面按钮、`Ctrl+Shift+Y` 和终端命令稳定调用同一套捕获与写入路径；支持用户自由操作、任意时刻 capture、正常 `finish` 和直接关闭浏览器后的恢复性结束。

## 实施范围

1. 三入口只负责发起请求，序列化、命名、队列和写入均共享一条实现路径。
2. 按钮与快捷键提交 capture 瞬间的 payload，不传业务步骤或固定页面名。
3. 终端支持：`capture <名称>`、无参 `capture`、`status`、`finish`、`quit`、`help`。
4. 快捷键在页面获得焦点时可靠触发；使用按键 latch 或等价机制防止 keydown/keyup、repeat 和长按重复写入。
5. SPA 替换 body、页面导航或新开/切换标签页后，按钮和捕获目标仍正确；终端 capture 应针对用户当前活动页面。
6. 不根据路由、selector、关键步骤或状态断言拒绝 capture。
7. `finish` 先等待已进入队列的 capture，再关闭 context 和临时 profile。
8. 用户直接关闭业务页或浏览器 context 时，CLI 停止读取已关闭页面、等待队列、清理 profile 并正常退出。
9. 单次 capture 失败只报告错误，不关闭会话或破坏其他页面基线。

## 预计修改范围

- `src/capture/runtime.ts`；
- `src/browser/session.ts`；
- `src/runner.ts`；
- `src/cli.ts`；
- `tests/integration/capture-flow.spec.ts`；
- 新增浏览器关闭和活动标签页测试。

## 可验收项

| ID | 优先级 | 通过标准 | 计划证据 | 结果 |
| --- | --- | --- | --- | --- |
| AC-21-01 | P0 | 按钮、快捷键、终端均进入同一 commit 路径 | Runner/Binding 集成测试 | PASS |
| AC-21-02 | P0 | 任意路由、表单草稿、弹窗、主题状态均可 capture，无业务门禁 | conformance 用例 | PASS |
| AC-21-03 | P0 | `Ctrl+Shift+Y` 聚焦页面时 5/5 成功 | 系统 Chrome 集成报告 | PASS |
| AC-21-04 | P0 | 单次按键动作、repeat 或长按均只写一次 | 键盘 latch 测试 | PASS |
| AC-21-05 | P0 | SPA 导航/body 替换后按钮仍可用且不会进入输出 HTML | MutationObserver 与序列化断言 | PASS |
| AC-21-06 | P0 | 切换已有标签页后终端 capture 命中当前活动页 | focus binding 实现与集成路径 | PASS |
| AC-21-07 | P0 | `finish` 等待队列并正常清理 profile | 20 次 capture 完成测试 | PASS |
| AC-21-08 | P0 | 直接关闭浏览器后 CLI 正常退出，已保存 HTML 完整 | browser-close 测试 | PASS |
| AC-21-09 | P0 | 单次失败后仍可继续保存其他页面 | 串行队列错误隔离 | PASS |

## 失败与回退边界

- 快捷键失败时按钮和终端是同会话备用入口，但不能据此把快捷键验收标为通过。
- 关闭事件竞争不得通过强制终止进程解决；必须让已进入写队列的操作完成或明确失败。

## 完成定义

三个入口均稳定、去重且不限制页面状态；正常结束和浏览器直接关闭都不会损坏已完成的 HTML。
