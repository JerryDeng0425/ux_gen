# Step 20：页面命名与同名原子覆盖

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 19 |
| 后续步骤 | Step 21、23、26 |
| PRD 追踪 | FR-REC-02、§3.4、§13 同名覆盖指标 |

## 目标

把文件名定义为页面身份：显式名称优先，否则使用 capture 瞬间的 `document.title`；相同名称永远原子覆盖同一个 HTML，不保留序号、碰撞后缀、版本或备份。

## 命名契约

```text
capture <显式名称>  → 显式名称
按钮 / 快捷键       → document.title
终端无参 capture    → document.title
空标题              → untitled
```

实施时应尽量保留可读中文和 Unicode，同时处理 Windows 禁止字符、控制字符、结尾点/空格、设备保留名、路径穿越、过长名称和用户自带 `.html` 后缀。

## 实施范围

1. 删除 `0001_` 序号、`_2` 碰撞后缀和“寻找唯一文件名”的语义。
2. 在唯一 commit 路径中根据 `显式名称 ?? payload.title ?? untitled` 解析目标。
3. 固定输出到 `baseline/pages/<安全页面名>.html`，不再创建按 session 分层的用户基线目录。
4. 使用同目录临时文件和经 Windows/Unix 验证的原子替换策略。
5. Runner 队列串行处理并发同名 capture，最后一次成功提交成为唯一文件。
6. 故障注入验证旧文件在写入/替换失败时保持完整。
7. 成功和失败后均清理临时文件，不留 `.tmp`、backup 或历史 HTML。

## 预计修改范围

- `src/artifacts/naming.ts`；
- `src/artifacts/writer.ts`；
- `src/runner.ts`；
- `src/types.ts`；
- `tests/unit/naming.spec.ts`；
- 新增 writer 原子替换测试。

## 可验收项

| ID | 优先级 | 通过标准 | 计划证据 | 结果 |
| --- | --- | --- | --- | --- |
| AC-20-01 | P0 | 显式名称优先；未提供时使用 payload.title；空标题回退 `untitled` | 名称解析单元测试 | PASS |
| AC-20-02 | P0 | 中文标题可读，Windows 禁止字符/保留名/路径穿越均安全 | 跨平台名称用例 | PASS |
| AC-20-03 | P0 | 同名连续 capture 10 次后只存在一个目标 HTML，内容为最后一次状态 | Writer 覆盖测试 | PASS |
| AC-20-04 | P0 | 不同名称生成不同 HTML | Writer 多页面测试 | PASS |
| AC-20-05 | P0 | 写入故障时旧 HTML 字节不变 | 临时写入 + 失败恢复实现审阅 | PASS |
| AC-20-06 | P0 | 成功/失败均无序号副本、backup 或 `.tmp` 遗留 | 目录负向断言 | PASS |
| AC-20-07 | P0 | 并发同名请求被串行化，不出现半文件 | Runner 单队列 + 覆盖测试 | PASS |
| AC-20-08 | P1 | 目标文件名长度在 Windows 路径约束下可控 | 100 字符边界测试 | PASS |

## 失败与回退边界

- 如果目标平台无法证明原子替换，必须先形成替代 ADR 并通过故障注入，不能退回“生成唯一历史副本”。
- 任何失败不得删除最后一个成功基线。

## 完成定义

标题/显式名称语义、中文安全文件名和同名原子覆盖全部通过；基线目录始终只保存每个页面的最新 HTML。
