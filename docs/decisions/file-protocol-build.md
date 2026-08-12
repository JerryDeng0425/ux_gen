# ADR：`file://` 离线原型构建

## 决策

MVP 使用 Vite + `vite-plugin-singlefile` 生成单入口 `index.html`。Vue 3、Element Plus、CSS、图标和页面代码全部内联，Vue Router 使用 Hash History，运行时数据直接进入 bundle。

产物仍允许 ZIP 中包含 `assets/`（用于图片、字体和其他非代码视觉资源），但入口不得依赖运行时动态 import、HTTP fetch、CDN、绝对路径或本地服务。

## 验证结论

- Vite 7.3.6、Vue 3.5.20、Element Plus 2.11.7；
- 三个 Hash 路由在断网 Chrome/Edge 中通过 `file://` 直达与刷新；
- 测试目录包含中文和空格；
- 控制台错误、page error 和 HTTP(S) 请求均为 0；
- 8/8 自动测试通过。

内联脚本仍保留 `type="module"`，但它不引用外部模块文件，已在 Chrome/Edge 的 `file://` 环境实际通过。因此正式门禁以“无外部 module/import 依赖并通过双浏览器运行”作为标准，而不是机械禁止该属性。

## 构建约束

1. `base: './'`；
2. `cssCodeSplit: false`；
3. `modulePreload: false`；
4. `inlineDynamicImports: true`；
5. 不使用页面级 lazy import；
6. 不在运行时 fetch JSON；
7. 图片/字体使用相对本地路径或安全 data URI；
8. 正式 ZIP 必须在断网 Chrome/Edge 中从中文+空格目录重新验证。

## 环境说明

当前受管工作区阻止 Vite/Playwright 在新仓库子目录直接创建或覆盖派生目录，因此探针把 build/results 定向到系统临时目录。源码、锁文件和本 ADR 保留在仓库；该限制不影响 `file://` 技术结论。
