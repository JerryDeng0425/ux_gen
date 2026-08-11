# Step 08：实现自动验证器

## 目标

将“成功写出文件”提升为“快照内容完整、状态正确、安全且可追溯”，并支持历史运行重新验证。

## 前置条件

- Step 05 的 artifact schema 已稳定。
- Step 06 有确定性 ground truth。
- Step 07 有 Vuestic 场景断言和视觉 mask。

## 实施任务

1. 实现 `validate --run-dir <path>`。
2. 校验 summary、metadata schema、文件存在性、大小和 SHA-256。
3. 新 Playwright page 打开生成 HTML，检查 doctype、解析成功和文档完整性。
4. 执行场景 selector 的文本、属性、表单和路由断言。
5. 扫描 script、内联事件、`javascript:` URL、meta refresh。
6. 扫描 password、文件路径和伪造 token 泄漏。
7. 联网重放截图并应用动态区域 mask，输出像素差异。
8. 将 failure 与 warning 分开，生成机器可读和人可读报告。

## 交付物

- Validator、隐私扫描器和视觉比较器。
- 单次 validation report。
- 历史运行重新验证命令及测试。

## 可验收项

| ID | 验证方法 | 通过标准 | 验收证据 |
| --- | --- | --- | --- |
| AC-08-01 | 验证一组未修改的 fixture 产物 | schema、hash、DOM 和状态断言全部通过 | validation report |
| AC-08-02 | 截断 HTML 末尾后验证 | 检测失败，报告具体文件和完整性原因 | 篡改测试报告 |
| AC-08-03 | 修改 HTML 或 PNG 一个字节 | hash 校验失败，不继续标记整体成功 | hash 负向测试 |
| AC-08-04 | 人工加入 script/onclick/javascript URL | 安全扫描全部检出并将验证置为失败 | 安全扫描报告 |
| AC-08-05 | 人工加入测试密码、文件路径、token | 三类敏感值全部检出 | 隐私扫描报告 |
| AC-08-06 | 修改一个表单值 | selector 断言失败，报告期望值和实际值 | 状态差异报告 |
| AC-08-07 | 使用含动态时间的截图并配置 mask | mask 区域不计差异，未 mask 的变化仍可检出 | 视觉报告 |
| AC-08-08 | 验证带 canvas/iframe warning 的合法快照 | 结果为通过并带 warning，不误判为无警告成功或失败 | 结构化报告 |
| AC-08-09 | 对历史 run 目录重复验证 | 不修改原始产物，结果可单独保存和比较 | 前后 hash、报告 |

## 完成判定

完整、状态、安全和视觉四类验证都有正反例；任何篡改、截断、可执行脚本或敏感测试值都不能通过。

## 后续步骤

[Step 09：可靠性与性能验收](./step-09-reliability.md)
