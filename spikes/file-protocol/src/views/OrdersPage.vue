<script setup lang="ts">
const rows = [
  { id: 'SO-2026-001', customer: '星云科技', status: '待审核' },
  { id: 'SO-2026-002', customer: '北辰制造', status: '已确认' }
];
</script>

<template>
  <section data-page="orders">
    <h1>订单列表</h1>
    <el-table :data="rows">
      <el-table-column prop="id" label="订单编号" />
      <el-table-column prop="customer" label="客户" />
      <el-table-column prop="status" label="状态" />
    </el-table>
  </section>
</template>
