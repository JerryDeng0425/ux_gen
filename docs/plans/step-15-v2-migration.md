# Step 15：CLI、验证器、配置与 Skill 迁移

## 目标

删除旧关键点和旁路 JSON 契约，让所有入口与文档只描述 v2 自由 HTML capture。

## 实施项

1. 更新 schema 与 Vuestic/conformance 启动配置。
2. 更新 CLI 帮助、交互命令和退出码。
3. 改为 `validate --path <html-or-directory>`。
4. 用 `capture-spa-html` Skill 替换旧 keypoint Skill。
5. 更新 preflight、workflow 脚本、references、使用说明和验收矩阵。
6. 删除 PNG/hash/assertion 生产代码和依赖。

## 可验收项

| ID | 通过标准 | 结果 |
| --- | --- | --- |
| AC-15-01 | 无 keypoints 的配置可启动；旧字段被拒绝 | PASS |
| AC-15-02 | `--help` 只显示自由捕获与 HTML validate | PASS |
| AC-15-03 | 单 HTML 与目录验证均通过 | PASS |
| AC-15-04 | Skill quick_validate 和 preflight 通过 | PASS |
| AC-15-05 | 生产代码无 PNG、sidecar、业务断言依赖 | PASS |

证据：CLI 实跑、Skill quick validation、preflight 输出、全仓依赖检查。
