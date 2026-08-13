<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
type ExceptionStatus = '待处理' | '处理中' | '已关闭';
interface ExceptionRow { id: string; user: string; account: string; type: string; priority: '高' | '普通' | '低'; status: ExceptionStatus; time: string }
const status = ref<ExceptionStatus | ''>('');
const rows = ref([
  { id: 'EX-20260813-01', user: '杜甫', account: 'dufu', type: '连续登录失败', priority: '高', status: '待处理', time: '2026-08-13 09:20' },
  { id: 'EX-20260812-02', user: '小林', account: 'common', type: '异地登录', priority: '普通', status: '处理中', time: '2026-08-12 18:10' },
  { id: 'EX-20260811-03', user: '李白', account: 'libai', type: '账号长时间未使用', priority: '低', status: '已关闭', time: '2026-08-11 14:30' }
]) as { value: ExceptionRow[] };
const visibleRows = computed(() => rows.value.filter((row) => !status.value || row.status === status.value));
function handle(row: ExceptionRow): void { row.status = '处理中'; ElMessage.success(`${row.id} 已进入处理`); }
</script>

<template><section data-testid="page-user-exceptions"><el-card shadow="never" class="filter-card"><el-form inline><el-form-item label="处理状态"><el-select v-model="status" clearable style="width:160px" data-testid="exception-status"><el-option label="待处理" value="待处理"/><el-option label="处理中" value="处理中"/><el-option label="已关闭" value="已关闭"/></el-select></el-form-item><el-form-item><el-button type="primary">查询</el-button><el-button @click="status=''">重置</el-button></el-form-item></el-form></el-card><el-card shadow="never"><template #header><div class="card-header"><strong>异常用户</strong><el-tag type="danger">高优先级 1</el-tag></div></template><el-table :data="visibleRows" row-key="id" stripe data-testid="exceptions-table"><el-table-column prop="id" label="异常编号" min-width="150"/><el-table-column prop="user" label="用户名称"/><el-table-column prop="account" label="账号"/><el-table-column prop="type" label="异常类型" min-width="150"/><el-table-column label="优先级"><template #default="scope"><el-tag :type="scope.row.priority === '高' ? 'danger' : scope.row.priority === '低' ? 'info' : 'primary'">{{ scope.row.priority }}</el-tag></template></el-table-column><el-table-column label="状态"><template #default="scope"><el-tag :type="scope.row.status === '待处理' ? 'warning' : scope.row.status === '处理中' ? 'primary' : 'success'">{{ scope.row.status }}</el-tag></template></el-table-column><el-table-column prop="time" label="发现时间" min-width="150"/><el-table-column label="操作"><template #default="scope"><el-button link type="primary" :disabled="scope.row.status === '已关闭'" data-testid="handle-exception" @click="handle(scope.row)">处理</el-button></template></el-table-column></el-table></el-card></section></template>

<style scoped>.filter-card{margin-bottom:16px}.filter-card :deep(.el-form-item){margin-bottom:0}.card-header{display:flex;align-items:center;justify-content:space-between}</style>
