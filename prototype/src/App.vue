<script setup lang="ts">
import { computed } from 'vue';
import { DataAnalysis, Document, House, Setting, User } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const activeRoute = computed(() => route.path);
const pageTitle = computed(() => String(route.meta.title ?? '业务原型'));
const pageSection = computed(() => String(route.meta.section ?? '原型'));
</script>

<template>
  <el-config-provider>
    <el-container class="app-shell">
      <el-aside width="210px" class="app-aside">
        <div class="brand"><span class="brand-mark">P</span><strong>PureAdmin</strong></div>
        <el-menu :default-active="activeRoute" :default-openeds="['home-group','form-group']" router class="side-menu" @select="value => router.push(String(value))">
          <el-menu-item index="/foundation"><el-icon><House /></el-icon><span>原型说明</span></el-menu-item>
          <el-sub-menu index="home-group"><template #title><el-icon><DataAnalysis /></el-icon><span>首页</span></template><el-menu-item index="/overview">运营总览</el-menu-item><el-menu-item index="/home">工作台</el-menu-item></el-sub-menu>
          <el-menu-item index="/users"><el-icon><User /></el-icon><span>用户管理</span></el-menu-item>
          <el-menu-item index="/user-exceptions"><el-icon><User /></el-icon><span>异常用户</span></el-menu-item>
          <el-sub-menu index="form-group"><template #title><el-icon><Document /></el-icon><span>表单页面</span></template><el-menu-item index="/form">表单示例</el-menu-item><el-menu-item index="/application">业务申请</el-menu-item><el-menu-item index="/dialog-editor">弹窗编辑</el-menu-item></el-sub-menu>
          <el-menu-item index="/account-settings"><el-icon><Setting /></el-icon><span>账号设置</span></el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="app-header">
          <span>业务系统高保真原型</span>
          <el-tag type="success" effect="plain">离线可交付</el-tag>
        </el-header>
        <el-main class="app-main">
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item>{{ pageSection }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>
