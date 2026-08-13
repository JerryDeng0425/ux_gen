# Step 24：固定 Pure Admin 本地基准系统

| 项目 | 内容 |
| --- | --- |
| 状态 | 已完成 |
| 前置依赖 | Step 17 |
| 后续步骤 | Step 26 |
| PRD 追踪 | §11、§12.1–12.2、§14 基准漂移风险 |

## 目标与固定版本

建立许可清晰、可重复启动、无需真实后端的 Vue 3 + Element Plus 中型管理后台。固定为 `pure-admin/vue-pure-admin` 的 `v7.0.0`、提交 `b8177a202dceb1412d3bf56f3d15483dc1606c9c`。

## 可验收项

| ID | 优先级 | 通过标准 | 结果 |
| --- | --- | --- | --- |
| AC-24-01 | P0 | URL、tag、完整 commit、锁文件 hash 和 MIT 许可可追溯 | PASS |
| AC-24-02 | P0 | 两次 frozen 安装得到相同锁并可启动 | PASS |
| AC-24-03 | P0 | mock 登录和动态路由可用，真实业务后端请求为 0 | PASS |
| AC-24-04 | P0 | Dashboard、列表、表单/详情、弹窗、设置/主题五类可操作 | PASS |
| AC-24-05 | P0 | 认证逻辑仅在基准应用，通用录制器无认证代码 | PASS |
| AC-24-06 | P1 | 说明含版本门槛、命令、端口与兼容配置 | PASS |

## 结果

系统 Chrome 自动登录并访问五类页面，打开基础 Dialog；运行时错误和外部业务 XHR 均为 0。pnpm 11 兼容文件只处理构建脚本许可与 `tippy.js` 根级链接，不改业务代码或锁文件。

证据：`benchmark/manifest.md`、`validation/reports/step-24-pure-admin-benchmark.md`、`tests/benchmark/pure-admin.spec.ts`。
