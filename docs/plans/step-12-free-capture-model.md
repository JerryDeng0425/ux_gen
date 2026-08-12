# Step 12：自由捕获模型

## 目标

移除固定关键点、顺序和业务断言门禁，让用户在任意页面、任意状态、任意次数 capture。

## 实施项

1. 启动配置只保留 URL 和通用捕获选项。
2. 删除 Keypoint 类型、状态机、`nextKeypoint()` 和 precondition assertions。
3. Runner 使用内存计数器和可选 label；并发请求进入顺序队列。
4. `status` 只显示 URL、总数和最近文件。
5. `finish/quit` 不检查业务完成度。

## 可验收项

| ID | 通过标准 | 结果 |
| --- | --- | --- |
| AC-12-01 | 任意路由和状态均可 capture | PASS |
| AC-12-02 | 连续 20 次成功且序号递增 | PASS |
| AC-12-03 | label 只改变文件名 | PASS |
| AC-12-04 | CLI 无 skip、Kxx 或待完成列表 | PASS |
| AC-12-05 | 生产路径无业务 assertion 门禁 | PASS |

证据：`tests/integration/capture-flow.spec.ts`、`tests/unit/scenario.spec.ts`。
