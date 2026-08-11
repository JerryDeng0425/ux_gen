# Step 06：建立本地一致性测试站点

## 目标

提供不依赖 Vuestic 线上版本的确定性 SPA fixture，用于稳定复现序列化、安全和异常边界。

## 前置条件

- Step 04、05 的序列化与产物接口稳定。
- fixture 只服务测试，不引入生产工具依赖。

## 实施任务

1. 创建最小 Vue SPA，包含路由切换、动态列表和延迟更新。
2. 加入 input、textarea、select、checkbox、radio、contenteditable。
3. 加入 dialog、details、滚动容器和主题 class 切换。
4. 加入可读 canvas、tainted canvas 模拟、iframe、open Shadow DOM。
5. 加入 password、file input 和测试 token URL。
6. 加入 50,000/150,000 节点规模生成器。
7. 为每个状态提供稳定 selector 和 ground-truth JSON。
8. 在 Playwright Test 中启动/关闭本地站点，不要求外网。

## 交付物

- `tests/fixtures/conformance-spa/`。
- ground-truth fixtures。
- 捕获流程集成测试和异常注入用例。

## 可验收项

| ID | 验证方法 | 通过标准 | 验收证据 |
| --- | --- | --- | --- |
| AC-06-01 | 断网执行 fixture 测试 | 本地站点启动且核心集成测试通过 | 测试报告 |
| AC-06-02 | 对照 fixture 能力清单 | PRD 中所有可支持状态至少有一个确定性样本 | 能力映射表 |
| AC-06-03 | 重复运行核心测试 20 次 | 无随机失败，ground truth 结果一致 | 20 次汇总 |
| AC-06-04 | 执行安全 fixture | 密码、文件路径、token 均不出现在产物 | 扫描报告 |
| AC-06-05 | 执行 canvas/iframe/shadow fixture | 支持项被保存，不支持项产生稳定 warning code | warning 断言 |
| AC-06-06 | 执行导航中和持续变动场景 | exact/settled 行为符合配置，不产生截断文件 | 集成测试日志 |
| AC-06-07 | 执行规模生成器 | 能稳定生成边界节点数量并输出可复现 seed | fixture metadata |

## 完成判定

核心功能无需访问公开网站即可被持续集成完整验证；重复运行不存在已知 flaky 用例。

## 后续步骤

[Step 07：Vuestic 场景工作流](./step-07-vuestic-scenario.md)
