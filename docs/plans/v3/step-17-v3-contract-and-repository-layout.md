# Step 17：v3 契约与仓库边界

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | PRD v3.0 已确认 |
| 后续步骤 | Step 18–35 |
| PRD 追踪 | §§3–6、§13、§16 |

## 目标

在改动实现前固化 v3 的需求追踪、目录职责、写权限和旧能力退场边界，避免捕获基线、原型源码、验证报告及交付物相互污染。

## 实施范围

1. 建立 v3 的 FR/验收指标到 Step 17–35 的追踪矩阵。
2. 固化实际目录契约：
   - 现有根目录 `src/`、`tests/` 和根 `package.json` 继续作为录制子系统，避免无价值搬迁；
   - `skills/capture-spa-html/` 为唯一自建工作流 Skill；
   - `baseline/pages/` 保存最新 HTML 基线；
   - `benchmark/` 保存固定基准系统及来源信息；
   - `skills/element-plus/` 保存固定版本的上游组件/设计参考；
   - `prototype/` 保存 Vue 原型源码；
   - `validation/reports/` 保存验收证据；
   - `delivery/` 保存派生静态目录和 ZIP。
3. 定义写权限：录制器可写 `baseline/pages/`；其他步骤只读基线，只写自身产物目录。
4. 定义派生产物清理和 Git 策略：是否提交基线由用户决定；工具不自动 commit。
5. 标记 v2 语义中需要退出生产路径的内容：scenario 启动配置、序号文件名、唯一副本、Vuestic 默认站点、业务脱敏配置和旧验收报告复用。
6. 明确非目标：页面 Agent、HTML→Vue 转换器、流程记录器、版本中心和新增工作流 Skill。

## 预计产物

- v3 需求追踪矩阵；
- 仓库目录与写权限说明；
- v1/v2 退场项清单；
- `.gitignore` 与派生产物策略的设计结论。

## 可验收项

| ID | 优先级 | 通过标准 | 计划证据 | 结果 |
| --- | --- | --- | --- | --- |
| AC-17-01 | P0 | PRD 中全部 FR、量化指标和完成定义至少归属一个后续 Step | `docs/architecture/v3-traceability-matrix.md` | PASS |
| AC-17-02 | P0 | `baseline/pages/` 的唯一写入者明确为录制链路 | `docs/architecture/v3-repository-contract.md` | PASS |
| AC-17-03 | P0 | 原型、验证、交付步骤均声明基线只读 | 目录 README 与仓库契约 | PASS |
| AC-17-04 | P0 | 明确只有 `capture-spa-html` 是自建工作流 Skill | 仓库契约与 v3 计划索引 | PASS |
| AC-17-05 | P0 | 明确不建设页面 Agent、转换器、流程模型或真实 API 接入 | 追踪矩阵非目标表 | PASS |
| AC-17-06 | P0 | 任何自动流程均不得执行 Git commit | 仓库契约 | PASS |
| AC-17-07 | P1 | 旧 v2 PASS、reports 和 Vuestic 用例被标记为历史证据 | 仓库契约 v2 退场清单 | PASS |
| AC-17-08 | P1 | 目录策略与当前仓库结构兼容，不要求无必要地搬迁稳定录制代码 | 目录所有权表 | PASS |

## 失败与回退边界

- 若目录所有权或追踪矩阵存在歧义，不得开始 Step 18 及后续实现。
- 本步骤只调整契约和文档；回退不应删除任何现有源码或用户数据。

## 完成定义

所有 P0 验收项有可审阅证据并通过；后续步骤能仅凭本契约判断输入、允许修改的目录和应提交的证据。
