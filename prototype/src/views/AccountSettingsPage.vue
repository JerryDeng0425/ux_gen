<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
const active = ref('profile');
const profile = reactive({ nickname: '小铭', email: 'pureadmin@163.com', phone: '13800138000', notice: true });
const logs = [{ system: 'Windows', browser: 'Chrome', location: '中国 · 上海', time: '2026-08-13 09:30' }, { system: 'macOS', browser: 'Safari', location: '中国 · 杭州', time: '2026-08-12 18:20' }];
const themeMode = ref('浅色');
const tabPersistence = ref(false);
const logo = ref(true);
function saveProfile(): void { ElMessage.success('个人信息保存成功'); }
</script>

<template>
  <el-card shadow="never" data-testid="page-account-settings"><el-tabs v-model="active" tab-position="left" class="settings-tabs"><el-tab-pane label="个人信息" name="profile"><h3>个人信息</h3><div class="profile-row"><el-avatar :size="72">铭</el-avatar><el-form :model="profile" label-width="90px"><el-form-item label="昵称"><el-input v-model="profile.nickname"/></el-form-item><el-form-item label="邮箱"><el-input v-model="profile.email"/></el-form-item><el-form-item label="联系方式"><el-input v-model="profile.phone"/></el-form-item><el-form-item label="消息通知"><el-switch v-model="profile.notice"/></el-form-item><el-form-item><el-button type="primary" @click="saveProfile">保存信息</el-button></el-form-item></el-form></div></el-tab-pane><el-tab-pane label="安全日志" name="security"><h3>安全日志</h3><el-table :data="logs"><el-table-column prop="system" label="操作系统"/><el-table-column prop="browser" label="浏览器"/><el-table-column prop="location" label="登录地点"/><el-table-column prop="time" label="登录时间"/></el-table></el-tab-pane><el-tab-pane label="系统配置" name="theme"><h3>系统配置</h3><el-form label-width="100px"><el-form-item label="主题模式"><el-radio-group v-model="themeMode"><el-radio value="浅色">浅色</el-radio><el-radio value="深色">深色</el-radio><el-radio value="自动">自动</el-radio></el-radio-group></el-form-item><el-form-item label="页签持久化"><el-switch v-model="tabPersistence"/></el-form-item><el-form-item label="Logo"><el-switch v-model="logo"/></el-form-item></el-form></el-tab-pane></el-tabs></el-card>
</template>

<style scoped>.settings-tabs{min-height:520px}.profile-row{display:grid;grid-template-columns:100px minmax(420px,680px);gap:24px;margin-top:24px}</style>
