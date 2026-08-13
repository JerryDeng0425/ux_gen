# Step 18：`file://` 离线构建技术探针

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 17 |
| 后续步骤 | Step 27、31、32 |
| PRD 追踪 | FR-DEL-01、FR-DEL-02、§9.7–9.10、§14 `file://` 风险 |

## 目标

在批量开发原型页面前，使用最小 Vue 3 + Element Plus + Hash Router 样例验证完全离线、无需服务器的多文件构建方案，提前消除默认 Vite ESM 在 `file://` 下可能受到 CORS、动态 import 和绝对路径限制的风险。

## 实施范围

1. 在独立探针目录创建最小工程，不读取或修改业务基线。
2. 样例至少包含三个 Hash 路由、Element Plus 组件、CSS、字体/图标和本地图片。
3. 评估并选定一种正式策略：经典 IIFE 或等价的非 module bundle、相对资源路径、无运行时动态 import、模拟数据直接打包。
4. 禁止通过本地 HTTP 服务掩盖 `file://` 问题；自动测试直接打开文件 URL。
5. 在断网上下文中分别使用系统 Chrome 和 Edge 验证。
6. 把探针解压/复制到含空格和中文的目录再次验证。
7. 形成 ADR，记录选定方案、构建约束、已禁止能力和后续回归命令。

## 预计产物

- `spikes/file-protocol/` 最小探针及锁文件；
- `docs/decisions/file-protocol-build.md`；
- `validation/reports/<run-id>/file-protocol-probe.*`。

## 计划验收命令（本轮不执行）

```powershell
npm run build:offline:probe
npm run test:offline:probe:chrome
npm run test:offline:probe:edge
```

## 可验收项

| ID | 优先级 | 通过标准 | 计划证据 | 结果 |
| --- | --- | --- | --- | --- |
| AC-18-01 | P0 | `index.html` 自包含，无外部脚本/样式、绝对资源根路径或运行时动态 import | 构建产物静态审计 | PASS |
| AC-18-02 | P0 | 断网 Chrome、Edge 通过 `file://` 打开，结果 2/2 | `validation/reports/step-18-file-protocol-probe.md` | PASS |
| AC-18-03 | P0 | 三个 Hash 路由均可直接进入、切换和刷新 | 双浏览器 6 个路由测试 | PASS |
| AC-18-04 | P0 | 页面无空白、控制台错误、page error 或必需网络请求 | 运行时事件断言 | PASS |
| AC-18-05 | P0 | 中文且含空格的绝对目录中同样通过 | 临时解压目录报告 | PASS |
| AC-18-06 | P0 | ADR 明确正式构建策略，Step 27/32 可直接复用 | `docs/decisions/file-protocol-build.md` | PASS |
| AC-18-07 | P1 | CSS、组件代码和模拟数据全部内联；视觉 assets 契约为本地相对路径 | 构建产物审计 | PASS |

## 失败与回退边界

- 任一 P0 失败即阻断 Step 27 的正式工程搭建，不允许用“部署一个本地服务”替代 PRD 的双击要求。
- 探针位于隔离目录，可整体丢弃；不得因此修改 `baseline/pages/`。

## 完成定义

选定方案在 Chrome/Edge 的断网 `file://` 环境中稳定通过，并产出可复用的构建决策和自动回归入口。
