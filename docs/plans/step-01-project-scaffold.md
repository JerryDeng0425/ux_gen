# Step 01：工程与最小 CLI

## 目标

建立可构建、可测试、可执行的 Node.js 20+ TypeScript 工程，并让错误配置在浏览器启动前失败。

## 前置条件

- Step 00 契约已通过评审。
- 开发机具备 Node.js 20 或更高版本。

## 实施任务

1. 创建 `package.json`、`tsconfig.json`、`playwright.config.ts`。
2. 安装 Playwright、Playwright Test 及必要的 TypeScript 工具。
3. 创建 `src/cli.ts`、`src/types.ts` 和模块目录。
4. 增加 `build`、`typecheck`、`test`、`snapshot`、`validate` 脚本。
5. 实现 `run --scenario --output`、`validate --run-dir` 的参数解析和帮助文本。
6. 加载场景并执行 schema 校验，生成唯一 `run-id`。
7. 统一结构化日志和用户可操作的错误信息。

## 交付物

- 可安装依赖的 TypeScript 工程。
- 最小 CLI 和帮助文档。
- 配置加载器、schema 校验器和基础测试。

## 可验收项

| ID | 验证方法 | 通过标准 | 验收证据 |
| --- | --- | --- | --- |
| AC-01-01 | 在 Node.js 20 环境执行 `npm ci` | 安装成功，无未锁定依赖变更 | 命令输出、lockfile |
| AC-01-02 | 执行 `npm run typecheck` | 退出码为 0，无 TypeScript 错误 | CI/终端输出 |
| AC-01-03 | 执行 `npm test` | 基础测试全部通过 | 测试报告 |
| AC-01-04 | 执行 snapshot CLI 的 `--help` | 展示 `run`、`validate` 及必需参数 | 命令输出 |
| AC-01-05 | 使用缺少 `startUrl` 的场景运行 | 浏览器启动前失败，错误包含字段路径和修复提示 | 负向测试日志 |
| AC-01-06 | 连续启动两次合法场景 | 生成不同 `run-id`，目录不冲突 | 两个运行目录名 |
| AC-01-07 | 执行构建命令 | 产出可运行 JavaScript，退出码为 0 | 构建日志和产物清单 |

## 完成判定

AC-01-01 至 AC-01-07 全部 `PASS`，并在持续集成或本地统一验证脚本中可重复执行。

## 后续步骤

[Step 02：有界面浏览器与终端采集](./step-02-headed-browser.md)
