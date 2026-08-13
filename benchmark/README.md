# Pure Admin 本地基准站

基准源码固定为 Pure Admin `v7.0.0`，本地目录为 `benchmark/vue-pure-admin/`。源码、依赖和构建产物属于可再生本地内容，不进入本仓库 Git；来源与校验信息见 [manifest.md](./manifest.md)。

## 本地启动

```powershell
Copy-Item benchmark\pnpm-workspace.compat.yaml benchmark\vue-pure-admin\pnpm-workspace.yaml -Force
$env:CI='true'
pnpm.cmd --dir benchmark\vue-pure-admin install --frozen-lockfile
pnpm.cmd --dir benchmark\vue-pure-admin exec vite --host 127.0.0.1 --port 4178
```

运行环境：Node `^20.19.0 || >=22.13.0`、pnpm `>=9`；本次验收使用 Node `v24.18.0`、pnpm `11.16.0`。默认账号 `admin` / `admin123`，验证码由页面本地生成。

系统使用上游 `vite-plugin-fake-server` mock。登录只属于基准系统，不是录制器的固定流程或 capture 限制。
