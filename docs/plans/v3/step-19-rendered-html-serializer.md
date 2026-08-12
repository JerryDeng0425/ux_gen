# Step 19：渲染 HTML 序列化收敛

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 17 |
| 后续步骤 | Step 20、21、23 |
| PRD 追踪 | FR-REC-03、§3.1–3.3、§13 HTML-only 指标 |

## 目标

收敛现有 DOM 深克隆逻辑，使捕获结果准确表达 capture 瞬间的渲染状态，同时成为不执行原站脚本的静态 HTML。此步骤只负责序列化内容，不负责命名和覆盖。

## 实施范围

1. 保留 doctype 和完整 `document.documentElement` 深克隆。
2. 固化运行时属性：
   - input 的当前 value、checked/radio 状态；
   - textarea 当前值；
   - select/option 当前选项；
   - details/dialog 的打开状态；
   - contenteditable 当前内容；
   - image 的 `currentSrc`；
   - window 与可滚动元素的位置。
3. 保留现有 DOM、class、业务数据、语料和外部 CSS/图片/字体引用，不下载、不内联外部资源。
4. 删除 `script`、全部内联 `on*`、`javascript:` URL 和 meta refresh。
5. 移除 selector 脱敏配置及 URL 参数脱敏；工具不做业务字段和语料治理。Cookie、Web Storage、IndexedDB 和浏览器 profile 不属于 DOM，因此仍不得额外导出。
6. 捕获控件及其 Shadow DOM host 不得进入输出 HTML。
7. 捕获失败或超限时不写半文件，错误只影响本次 capture。
8. 每次调用序列化器只返回一个 HTML payload；不创建 PNG、JSON、截图、视频或 trace。

## 预计修改范围

- `src/capture/runtime.ts`；
- `src/types.ts`；
- `src/validation/validator.ts`；
- `tests/integration/serializer.spec.ts` 及必要的 fixture 状态。

## 可验收项

| ID | 优先级 | 通过标准 | 计划证据 | 结果 |
| --- | --- | --- | --- | --- |
| AC-19-01 | P0 | doctype 和完整 HTML 根节点可解析，输出未截断 | serializer integration | PASS |
| AC-19-02 | P0 | input、textarea、select、checked/radio 状态与捕获瞬间一致 | DOM 状态断言 | PASS |
| AC-19-03 | P0 | dialog/details/contenteditable 和滚动状态被固化 | fixture 状态断言 | PASS |
| AC-19-04 | P0 | 输出不存在 `script`、`on*`、`javascript:` 或 meta refresh | validator/serializer 断言 | PASS |
| AC-19-05 | P0 | 捕获按钮/host 不出现在 HTML 中 | 产物断言 | PASS |
| AC-19-06 | P0 | 不存在 `redactSelectors` 或业务内容隐私扫描门禁 | 类型、schema 和测试检查 | PASS |
| AC-19-07 | P0 | 单次 capture 的文件型产物只有 HTML | serializer 契约 | PASS |
| AC-19-08 | P1 | CSS、图片和字体的原始引用被保留，且本步骤不下载资源 | HTML 引用契约 | PASS |
| AC-19-09 | P1 | Cookie、Storage、IndexedDB 和 profile 未被额外序列化 | 代码审阅与负向边界 | PASS |

## 失败与回退边界

- 任何序列化异常不得覆盖现有基线文件；写入行为留给 Step 20。
- 不能通过添加截图/sidecar JSON 补偿 DOM 不完整；边界内容应在 HTML metadata 或终端告警中说明。

## 完成定义

所有 P0 DOM 状态与静态化测试通过，序列化器能为后续命名/写入层提供单一、完整的 HTML payload。
