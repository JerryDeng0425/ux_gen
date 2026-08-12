# Step 31：原型自动验证流水线

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 30 |
| 后续步骤 | Step 32–35 |
| PRD 追踪 | §9、§12.8–12.9、§13 自动指标 |

## 可验收项

| ID | 优先级 | 通过标准 | 结果 |
| --- | --- | --- | --- |
| AC-31-01 | P0 | typecheck/build 退出码 0 | PASS |
| AC-31-02 | P0 | 100% route 可直达、刷新且非空 | PASS（7/7 × 2） |
| AC-31-03 | P0 | 必需交互 smoke 100% | PASS（3/3 × 2） |
| AC-31-04 | P0 | console/page/unhandled/resource 错误为 0 | PASS |
| AC-31-05 | P0 | 横溢出、遮挡、不可点击、不可达为 0 | PASS |
| AC-31-06 | P0 | Chrome/Edge 2/2，未 skip | PASS |
| AC-31-07 | P0 | 缺 route/interaction/browser 时契约失败 | PASS |
| AC-31-08 | P0 | 基线 SHA256 不变 | PASS（7/7） |
| AC-31-09 | P1 | 报告含条款、版本、环境、命令与 hash | PASS |

证据：`validation/reports/step-31-automated-validation.md`、`playwright.prototype.config.ts`、`validation/contracts/`。
