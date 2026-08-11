# Step 10：封装 Codex Skill

## 目标

让用户通过自然语言完成环境检查、场景选择、CLI 启动、关键点引导、结果汇总和故障诊断，同时保持 CLI 为唯一核心实现。

## 前置条件

- Step 09 的核心工具已达到 MVP 指标。
- 已决定 Skill 开发/安装位置。默认先在仓库 `skills/capture-spa-keypoints/` 开发。
- 创建时遵循可用的 `skill-creator` 规范和校验脚本。

## 实施任务

1. 使用 skill-creator 的 `scripts/init_skill.py` 初始化 `capture-spa-keypoints`。
2. 创建 `SKILL.md`，frontmatter 只包含 `name` 和 `description`。
3. description 覆盖“启动 SPA DOM 采集”“关键点导出”“验证历史快照”等触发语义。
4. 在正文中定义预检、选择场景、启动 CLI、等待人工操作、读取 summary、故障分流。
5. 将 CLI 完整参数放入 `references/cli-contract.md`。
6. 将场景格式放入 `references/scenario-schema.md`。
7. 将常见失败及恢复方式放入 `references/troubleshooting.md`。
8. 创建薄封装 `scripts/preflight.ps1` 和 `scripts/run-workflow.ps1`，不得复制 TypeScript 业务逻辑。
9. 创建 `agents/openai.yaml`，配置清晰名称和默认提示。
10. 执行 `scripts/quick_validate.py`，再进行首次采集、失败恢复、历史验证三类前向测试。

## 交付物

- `skills/capture-spa-keypoints/SKILL.md`。
- `agents/openai.yaml`、两个薄脚本和三份 reference。
- Skill 结构校验结果和前向测试记录。
- 最终安装/分发决策记录。

## 可验收项

| ID | 验证方法 | 通过标准 | 验收证据 |
| --- | --- | --- | --- |
| AC-10-01 | 运行 skill-creator 的 `quick_validate.py` | Skill 名称、frontmatter、目录和引用全部通过 | 校验输出 |
| AC-10-02 | 使用“启动 Vuestic Admin，让我采集四个关键点” | Skill 完成预检并启动正确 CLI/场景 | 前向测试 transcript |
| AC-10-03 | 缺少 Node、依赖或 Chromium 时运行预检 | 准确指出缺失项和安全修复步骤，不进入半启动状态 | 三类负向测试 |
| AC-10-04 | 在一次 capture 失败后请求继续 | Skill 读取当前状态，指导重试而非重启或覆盖运行 | 恢复测试 transcript |
| AC-10-05 | 请求验证一个历史 run 目录 | 调用同一 validator，返回通过项、失败项、warning 和证据路径 | 验证 transcript |
| AC-10-06 | 检查 Skill 脚本和正文 | 不存在 serializer、writer 或 validator 的重复实现 | 代码审查记录 |
| AC-10-07 | 测试不相关请求 | Skill 不被宽泛触发，description 边界清晰 | 触发测试矩阵 |
| AC-10-08 | 检查渐进披露 | `SKILL.md` 保持简洁，详细参数/schema/排障只在需要时读取 | 结构审查记录 |
| AC-10-09 | 从 UI 或目标安装位置调用 Skill | 显示名称、默认提示和资源路径有效 | 安装验证截图/日志 |

## 完成判定

Skill 可以稳定编排同一核心 CLI，不要求用户记忆命令；环境失败、采集失败和历史验证都有可复现的处理路径。

## 后续步骤

[Step 11：端到端验收与交付](./step-11-delivery.md)
