# Step 04：实现确定性 DOM Serializer

## 目标

替换 `page.content()`，在用户触发的关键时点同步冻结当前 DOM、补写运行时状态、执行安全清理并报告无法完整表达的内容。

## 前置条件

- Step 03 已提供统一页面捕获入口。
- Step 00 已定义 payload、warning 和上限。

## 实施任务

1. 保存 doctype，并同步执行 `document.documentElement.cloneNode(true)`。
2. 单次深度遍历配对原节点与克隆节点。
3. 补写 input value、checked、textarea value、option selected。
4. 补写 details/dialog open、contenteditable DOM、图片 `currentSrc`。
5. 保存页面及滚动容器位置到 metadata。
6. 注入来源、关键点、时间和视口元数据；加入正确的 `base href`。
7. 删除 script、`on*`、`javascript:` URL 和 meta refresh。
8. 清空 password/file 状态并脱敏敏感查询参数。
9. 尝试将可读 2D canvas 替换为 data URL 图片。
10. 检测 tainted canvas、iframe、Shadow DOM 和 oversized 状态。

## 交付物

- `capture/serializer.ts`。
- warning 分类和统计。
- 表单、安全、特殊 DOM 和边界规模单元测试。

## 可验收项

| ID | 验证方法 | 通过标准 | 验收证据 |
| --- | --- | --- | --- |
| AC-04-01 | 修改 input/textarea 后捕获 | HTML 重新打开时值与捕获瞬间完全一致 | fixture 断言 |
| AC-04-02 | 切换 checkbox/radio/select | checked/selected 状态一致率 100% | 自动化测试报告 |
| AC-04-03 | 打开 details/dialog 并编辑 contenteditable | 打开状态和当前内容被固化 | HTML 与断言 |
| AC-04-04 | 使用 responsive image | 保存 `currentSrc` 对应资源，不退回错误候选 | 测试产物 |
| AC-04-05 | 在页面加入 script、onclick、javascript URL、refresh | 四类可执行入口均从产物移除 | 安全扫描报告 |
| AC-04-06 | 输入测试 password 并选择本地文件 | HTML/JSON 不包含密码、文件值或本地路径 | 泄漏扫描结果 |
| AC-04-07 | URL 包含测试 token/code/key | 原始值不进入可公开字段，脱敏 URL 保留可追溯结构 | metadata 断言 |
| AC-04-08 | 捕获可读和 tainted canvas | 可读 canvas 产生图像；失败项保留标签并产生 warning | 两类 fixture 结果 |
| AC-04-09 | 加入 iframe 和 open Shadow DOM | 检测数量准确，不能处理的内容不静默丢失 | warning JSON |
| AC-04-10 | 超过节点或字节上限 | 状态标记 `oversized` 并按契约中止，不传输半截 HTML | 边界测试报告 |
| AC-04-11 | 打开生成 HTML | doctype、base、来源元数据存在，文档可解析 | Validator 初步输出 |

## 完成判定

PRD FR-05 和 FR-06 的每一条都有自动化正反例；指定运行时状态一致率 100%，可执行脚本和敏感测试值泄漏均为 0。

## 后续步骤

[Step 05：产物与元数据](./step-05-artifacts.md)
