<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const active = computed(() => route.path);
</script>

<template>
  <el-container class="shell">
    <el-header>
      <strong>离线业务原型</strong>
      <span data-testid="protocol">file:// compatible</span>
    </el-header>
    <el-container>
      <el-aside width="210px">
        <el-menu :default-active="active" router @select="value => router.push(value)">
          <el-menu-item index="/dashboard">仪表盘</el-menu-item>
          <el-menu-item index="/orders">订单</el-menu-item>
          <el-menu-item index="/settings">设置</el-menu-item>
        </el-menu>
      </el-aside>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>
