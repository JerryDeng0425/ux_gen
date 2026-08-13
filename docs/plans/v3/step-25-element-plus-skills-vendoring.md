# Step 25：固定 Element Plus Skills 参考集

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 17 |
| 后续步骤 | Step 27–30 |
| PRD 追踪 | FR-PROTO-02、FR-PROTO-03、§14 上游变化风险 |

## 固定来源

- 上游：`https://github.com/jiaiyan/element-plus-skills`
- 完整 commit：`1d126b39a80523665cc6290f70ce25aa89d708ae`
- 仓库目录：`skills/element-plus/`
- 许可：MIT

## 可验收项

| ID | 优先级 | 通过标准 | 结果 |
| --- | --- | --- | --- |
| AC-25-01 | P0 | URL、完整 commit、许可和内容 hash 可追溯 | PASS |
| AC-25-02 | P0 | 指定基础、设计规范和业务组件均有参考 | PASS |
| AC-25-03 | P0 | 只写仓库目录，个人全局 Skill 目录零变化 | PASS |
| AC-25-04 | P0 | 未创建原型生成、修改、验证、打包或页面 Agent Skill | PASS |
| AC-25-05 | P0 | 89 个上游 `SKILL.md` 结构校验通过 | PASS |
| AC-25-06 | P1 | 升级必须显式变更 commit、diff、许可与 hash | PASS |

## 结果

完整上游参考集按 commit 固定，设计与目标组件覆盖完整；个人技能目录仍只有原有 `.system` 与 `convert-gif-to-social-video`。来源、覆盖矩阵和升级契约记录于 `skills/element-plus/UPSTREAM.md`。

证据：`validation/reports/step-25-element-plus-skills.md`。
