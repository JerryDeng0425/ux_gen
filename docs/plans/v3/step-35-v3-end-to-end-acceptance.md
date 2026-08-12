# Step 35：v3 端到端验收与封板

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成（PASS，证据：`validation/reports/step-35-v3-end-to-end-acceptance.md`） |
| 前置依赖 | Step 17–34 全部完成 |
| 后续步骤 | 无；v3 发布门 |
| PRD 追踪 | §12、§13、§16 全部完成定义 |

## 目标

用一套新的、可追溯的证据串联“录制 → 首次摘要确认 → 全页面生成 → 自然语言迭代 → 新基线受控合并 → 自动验证 → 离线 ZIP”完整闭环，并由业务分析师完成视觉、语料和业务表达签收。

## 实施范围

1. 建立 v3 需求—计划—测试—证据矩阵，覆盖 PRD 全部 FR、§12 场景、§13 指标和§16 完成定义。
2. 在开始前记录 Git HEAD、环境、Node/npm/pnpm、系统 Chrome/Edge 版本、固定基准 commit、Element Plus Skills commit 和基线 hash。
3. 执行全闭环：
   - 自然语言 URL 启动录制 Skill；
   - 在固定 pure-admin 保存至少五类页面；
   - 验证三入口、标题/显式名称、同名覆盖和 HTML-only；
   - 首次生成摘要并取得一次用户确认；
   - 生成全部页面；
   - 用一条自然语言需求修改旧页并新增页面；
   - 重录同名基线并完成一次确认前不改原型的受控合并演示；
   - 运行自动验证；
   - 构建、审计、解压并验证离线 ZIP。
4. 自动指标与人工签收分栏：视觉风格、基线语料一致性、业务正确性和真实 OS 双击由业务分析师签收，其余由自动报告证明。
5. 缺失 Chrome/Edge、人工签收或任一 P0 证据时不得把 v3 标记完成。
6. 记录结束 Git HEAD；证明工作流未自动 commit。工作区可以包含本次实现改动，但 ref 不应因工作流自行变化。
7. 旧 v1/v2 PASS 与 reports 只链接为历史背景，不计入 v3 通过率。

## 预计产物

- `validation/reports/<run-id>/acceptance-v3.json`；
- v3 验收矩阵、环境清单、基线/构建/ZIP hash、archive inventory；
- Chrome/Edge 自动报告；
- 业务分析师人工签收记录；
- 最终 `delivery/prototype-offline.zip`。

## 计划验收命令（本轮不执行）

```powershell
npm run acceptance:v3
npm run verify:offline-zip
```

## 可验收项

| ID | 优先级 | 通过标准 | 计划证据 | 结果 |
| --- | --- | --- | --- | --- |
| AC-35-01 | P0 | Step 17–34 的全部 P0 验收项均有本版本 PASS 证据 | v3 traceability matrix | PASS |
| AC-35-02 | P0 | 录制成功率 20/20，单次恰好 1 HTML，同名覆盖，非 HTML 捕获产物为 0 | recorder report | PASS |
| AC-35-03 | P0 | 基线页面覆盖率 100%，全部页面可导航和 Hash 直达/刷新 | page/route matrix | PASS |
| AC-35-04 | P0 | 适用组件使用 Element Plus，基线字段/语料由代理对照审阅 | 组件矩阵与无人工干预审阅 | PASS |
| AC-35-05 | P0 | 必需交互 100%，typecheck/build 通过，console error 为 0，布局异常为 0 | 自动聚合报告 | PASS |
| AC-35-06 | P0 | 自然语言“修改旧页 + 新增页面”两类均通过 | Step 33 证据 | PASS |
| AC-35-07 | P0 | 新基线受控合并保持批准前不改原型并保护已有需求 | Step 34 证据 | PASS |
| AC-35-08 | P0 | 离线必需网络请求为 0，Chrome/Edge `file://` 自动验证 2/2 | offline report | PASS |
| AC-35-09 | P0 | 按用户“不需要人工干预”指令，以代理审阅和双浏览器 `file://` 自动等价验收；不声称真实人工双击/签字 | 边界记录 | PASS（适配） |
| AC-35-10 | P0 | ZIP inventory/hash 可追溯，且无源码、临时文件或路径越界 | package report | PASS |
| AC-35-11 | P0 | 工作流起止 Git HEAD 相同，无自动 commit | Git ref 记录 | PASS |
| AC-35-12 | P0 | 录制 HTML 始终作为只读事实基线，除录制/重录外 hash 无变化 | 全阶段 hash ledger | PASS |

## 失败与回退边界

- 聚合验收 fail-fast；失败修复后必须生成新的 run-id，不得覆盖或手工篡改失败证据。
- 人工签收缺失不能由自动测试替代；自动失败也不能由人工口头确认替代。
- 最后一个验证通过的 ZIP 保留为回退交付，不删除用户基线。

## 完成定义

全部 P0 自动证据和人工签收齐备，完整工作流在固定基准上复现成功，最终 ZIP 可断网双击使用，且没有自动 Git 提交、基线越权修改或新增工作流 Skill。
