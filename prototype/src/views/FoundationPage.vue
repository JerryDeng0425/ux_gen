<script setup lang="ts">
import { baselinePages } from '../data/baseline-pages';
</script>

<template>
  <el-card shadow="never" data-testid="foundation-page">
    <template #header><strong>原型工程基础</strong></template>
    <el-alert title="Vue 3 + Element Plus + Hash Router 离线骨架已就绪" type="success" show-icon :closable="false" />
    <el-descriptions class="foundation-info" :column="3" border>
      <el-descriptions-item label="基线页面">{{ baselinePages.length }}</el-descriptions-item>
      <el-descriptions-item label="数据模式">前端内存</el-descriptions-item>
      <el-descriptions-item label="交付模式">file:// 单 HTML</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<style scoped>.foundation-info { margin-top: 20px; }</style>
