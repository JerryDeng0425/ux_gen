# Step 22：录制 Skill v3

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 21 |
| 后续步骤 | Step 23、26 |
| PRD 追踪 | FR-REC-01–04、§3.2–3.3 |

## 目标

把现有 `capture-spa-html` 更新为仓库中唯一自建工作流 Skill：用户用自然语言提供本次 URL，Skill 完成预检、启动隔离 headed Chromium、解释三个入口并在结束时报告 HTML 路径。

## Skill 设计约束

执行本计划时必须遵循 `skill-creator` 规范：保持 `SKILL.md` 精简，触发条件全部写在 frontmatter description；确定性启动逻辑放 `scripts/`，详细 CLI 和故障处理放一层 `references/`；更新后校验 `agents/openai.yaml` 与 Skill 一致。

本步骤是更新既有 Skill，不创建新的原型生成、页面修改、验证、打包或页面 Agent Skill。

## 实施范围

1. 自然语言触发示例包括“录制这个 URL 的页面 HTML”“打开系统让我手工操作并随时 capture”。
2. CLI 改为本次参数 `--url <http-or-https-url>`；URL 不写入 scenario 或项目配置。
3. 预检 Node、依赖、Playwright/系统 Chrome 和 `baseline/pages/` 写权限。
4. 启动隔离临时 profile 的 headed Chromium，不复用用户日常 profile。
5. 明确用户自行登录和操作；Skill 不自动点击或录制操作。
6. 指导按钮、`Ctrl+Shift+Y` 和 `capture [名称]`，不描述关键点、路线或完成清单。
7. 每次只报告 `.html`；不期待 JSON、PNG、截图、Codegen 或 run summary。
8. `finish` 或关闭浏览器后报告已保存页面和基线目录。
9. 删除 Vuestic 默认站点、scenario 配置、脱敏配置和旧关键点语义。

## 预计修改范围

- `skills/capture-spa-html/SKILL.md`；
- `skills/capture-spa-html/agents/openai.yaml`；
- `skills/capture-spa-html/scripts/*.ps1`；
- `skills/capture-spa-html/references/*.md`；
- `docs/USAGE.md` 中的录制部分。

## 可验收项

| ID | 优先级 | 通过标准 | 计划证据 | 结果 |
| --- | --- | --- | --- | --- |
| AC-22-01 | P0 | 自然语言提供 URL 可启动，URL 不生成或修改持久配置 | CLI `--url` 与脚本审阅 | PASS |
| AC-22-02 | P0 | headed Chromium 使用隔离临时 profile | BrowserSession + preflight | PASS |
| AC-22-03 | P0 | Skill 只指导用户手工操作和自由 capture，不自动操作业务页 | SKILL.md 审阅 | PASS |
| AC-22-04 | P0 | 输出描述严格为 HTML-only，不出现截图、Codegen、流程或 JSON sidecar | Skill 负向文本检查 | PASS |
| AC-22-05 | P0 | 不存在默认 Vuestic、scenario 或业务脱敏配置依赖 | 文本与脚本检查 | PASS |
| AC-22-06 | P0 | `SKILL.md` frontmatter、目录名和 `agents/openai.yaml` 校验通过 | skill-creator `quick_validate.py` | PASS |
| AC-22-07 | P0 | 仓库中没有新增其他自建工作流 Skill | Skill inventory | PASS |
| AC-22-08 | P1 | 前置检查失败时给出可操作错误，不部分启动浏览器 | preflight 与 URL 负向用例 | PASS |

## 计划验收命令（本轮不执行）

```powershell
# 实施阶段使用 skill-creator 提供的 quick_validate.py 路径
python <skill-creator>/scripts/quick_validate.py skills/capture-spa-html
```

## 失败与回退边界

- Skill 校验或最小上下文 forward test 失败时不得进入 Step 23。
- 不通过安装到用户全局技能目录来规避仓库 Skill 的问题；本项目只维护仓库内版本。

## 完成定义

用户只提供一次 URL 即可进入通用录制会话；Skill 精简、可触发、与 CLI 一致且不引入任何额外工作流 Skill。
