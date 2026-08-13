<script setup lang="ts">
import { ref } from 'vue';
const compact = ref(false);
</script>

<template>
  <section data-page="settings">
    <h1>系统设置</h1>
    <el-form label-width="120px">
      <el-form-item label="紧凑模式"><el-switch v-model="compact" /></el-form-item>
      <el-form-item><el-alert :title="compact ? '已启用紧凑模式' : '标准显示模式'" type="success" :closable="false" /></el-form-item>
    </el-form>
  </section>
</template>
