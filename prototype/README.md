# Vue 3 离线高保真原型

独立原型工程，使用 Vue 3、TypeScript、Vite、Element Plus 和 Vue Router Hash 模式。状态只保存在页面内存中，不使用 Pinia、真实 API 或浏览器持久化。

```powershell
npm.cmd --prefix prototype ci
npm.cmd --prefix prototype run typecheck
$env:PROTOTYPE_OUTPUT = Join-Path $env:TEMP 'ux-gen-prototype-dist'
npm.cmd --prefix prototype run build
```

正式离线构建为单个 `index.html`，所有 JS/CSS 均内联，可直接通过 `file://` 打开。
