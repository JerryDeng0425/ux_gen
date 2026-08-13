# Step 29：全部基线页面原型生成

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 28 自动确认 |
| 后续步骤 | Step 30 |
| PRD 追踪 | FR-PROTO-03–04、§12.5–12.6、§13 页面覆盖指标 |

## 可验收项

| ID | 优先级 | 通过标准 | 结果 |
| --- | --- | --- | --- |
| AC-29-01 | P0 | 基线到原型覆盖率 100% | PASS（7/7） |
| AC-29-02 | P0 | 每页菜单、激活态和面包屑正确 | PASS |
| AC-29-03 | P0 | 每页 Hash URL 直达和刷新无空白 | PASS（7/7） |
| AC-29-04 | P0 | 原路由与推断 route 有明确映射 | PASS |
| AC-29-05 | P0 | 页面结构使用适用 Element Plus 组件 | PASS |
| AC-29-06 | P0 | 标题、栏目、字段和主要语料来自基线 | PASS |
| AC-29-07 | P0 | 基线 SHA256 不变 | PASS（7/7） |
| AC-29-08 | P1 | 失效菜单、重复 route、不可达页面为 0 | PASS |

证据：`validation/reports/step-29-page-coverage.md`、`tests/prototype/all-pages.spec.ts`。
