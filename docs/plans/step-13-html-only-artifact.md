# Step 13：HTML-only 产物

## 目标

每次 capture 只生成一个包含安全元数据的 HTML，不生成 PNG、捕获 JSON 或 JSON summary。

## 实施项

1. 使用 `writeHtmlCapture()` 替换三件套 writer。
2. 使用四位递增序号和可选安全 label 命名。
3. 将 session、capture、时间、URL、route、viewport、DPR、节点与 warning 写入 `<meta>`。
4. 滚动状态写入 HTML 属性。
5. 使用临时文件加原子重命名，删除截图/hash/sidecar 主流程与依赖。

## 可验收项

| ID | 通过标准 | 结果 |
| --- | --- | --- |
| AC-13-01 | 一次 capture 只新增一个 HTML | PASS |
| AC-13-02 | 20 次目录内 JSON/PNG 均为 0 | PASS |
| AC-13-03 | 必需 meta 齐全且 script 数为 0 | PASS |
| AC-13-04 | 重复 label 不覆盖文件 | PASS |
| AC-13-05 | 篡改/截断能被 validator 检出 | PASS |

证据：`reports/acceptance-report.json`、`tests/integration/capture-flow.spec.ts`。
