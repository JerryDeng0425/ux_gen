# Pure Admin v7.0.0 基准清单

| 字段 | 固定值 |
| --- | --- |
| 上游 | `https://github.com/pure-admin/vue-pure-admin` |
| Tag | `v7.0.0` |
| 完整 commit | `b8177a202dceb1412d3bf56f3d15483dc1606c9c` |
| 官方归档 | `https://codeload.github.com/pure-admin/vue-pure-admin/zip/refs/tags/v7.0.0` |
| 归档 SHA256 | `C65F7E791D889FE7B54830C491EA8A5580EC873FB3958D75C11060C981D5C1EF` |
| `pnpm-lock.yaml` SHA256 | `E5F654C507336920C9385DE7704D1C78B9D625C39D906ACEFE6D4CFEB08BC6A5` |
| 上游 LICENSE SHA256 | `595D3C8DC79997D191374BDE6FBFA251923441EBEFCD42151947D8B2A2407F2D` |
| 许可 | MIT；仓库保留 `benchmark/LICENSE.vue-pure-admin` |
| 本地 URL | `http://127.0.0.1:4178/` |
| 固定视口 | `1280 × 800` |

## 可复现获取

1. 下载上表官方归档并校验 SHA256。
2. 解压其 `vue-pure-admin-7.0.0/` 到 `benchmark/vue-pure-admin/`。
3. 校验锁文件与 LICENSE SHA256。
4. 复制 `benchmark/pnpm-workspace.compat.yaml` 覆盖上游同名文件。该补丁只适配 pnpm 11 的构建脚本许可与上游直接导入的 `tippy.js` 根级链接，不改变业务源码或锁文件。
5. 设置 `CI=true`，运行 `pnpm install --frozen-lockfile`。
6. 以 `pnpm exec vite --host 127.0.0.1 --port 4178` 启动。

## 页面侦察清单

| 页面族 | 路由 | 代表能力 |
| --- | --- | --- |
| Dashboard / 导航 | `/welcome` | 总览、侧边导航、系统布局 |
| 查询表格 | `/system/user/index` | 查询、表格、分页、新增用户入口 |
| 表单 / 详情 | `/form/index` | Element Plus 表单控件与校验 |
| Dialog 编辑 | `/components/dialog` | 基础弹窗及多种交互 |
| 账号设置 / 主题 | `/account-settings` | 账户信息、安全日志与主题入口 |

验证使用真实 UI 登录，并直接验证 `/login` mock 返回管理员角色；浏览器 XHR 外部业务请求为 0。未在通用录制器加入认证逻辑。
