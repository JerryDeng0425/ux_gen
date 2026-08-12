<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';

type UserStatus = '正常' | '停用';
type Priority = '高' | '普通' | '低';
interface UserRow { id: number; name: string; account: string; department: string; phone: string; role: string; priority: Priority; status: UserStatus; createdAt: string }

const initialUsers: UserRow[] = [
  { id: 1, name: '小林', account: 'common', department: '研发部门', phone: '13800138000', role: '普通用户', priority: '高', status: '正常', createdAt: '2024-05-10' },
  { id: 2, name: '小铭', account: 'admin', department: '管理部门', phone: '13900139000', role: '管理员', priority: '普通', status: '正常', createdAt: '2024-06-18' },
  { id: 3, name: '李白', account: 'libai', department: '研发部门', phone: '13700137000', role: '普通用户', priority: '低', status: '正常', createdAt: '2024-07-02' },
  { id: 4, name: '杜甫', account: 'dufu', department: '测试部门', phone: '13600136000', role: '普通用户', priority: '高', status: '停用', createdAt: '2024-07-12' },
  { id: 5, name: '王维', account: 'wangwei', department: '设计部门', phone: '13500135000', role: '普通用户', priority: '普通', status: '正常', createdAt: '2024-08-01' },
  { id: 6, name: '苏轼', account: 'sushi', department: '管理部门', phone: '13400134000', role: '管理员', priority: '普通', status: '正常', createdAt: '2024-08-08' }
];

const users = ref(initialUsers.map((item) => ({ ...item })));
const keyword = ref('小铭');
const status = ref<UserStatus | ''>('');
const appliedKeyword = ref('小铭');
const appliedStatus = ref<UserStatus | ''>('');
const priority = ref<Priority | ''>('');
const appliedPriority = ref<Priority | ''>('');
const page = ref(1);
const pageSize = 4;
const dialogVisible = ref(false);
const editingId = ref<number>();
const formRef = ref<FormInstance>();
const userForm = reactive({ name: '', account: '', department: '研发部门', phone: '', role: '普通用户', priority: '普通' as Priority });
const rules: FormRules = {
  name: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
  account: [{ required: true, message: '请输入用户账号', trigger: 'blur' }],
  phone: [{ pattern: /^1\d{10}$/, message: '请输入 11 位手机号', trigger: 'blur' }]
};

const filteredUsers = computed(() => users.value.filter((item) =>
  (!appliedKeyword.value || item.name.includes(appliedKeyword.value) || item.account.includes(appliedKeyword.value))
  && (!appliedStatus.value || item.status === appliedStatus.value)
  && (!appliedPriority.value || item.priority === appliedPriority.value)
));
const pagedUsers = computed(() => filteredUsers.value.slice((page.value - 1) * pageSize, page.value * pageSize));

function search(): void { appliedKeyword.value = keyword.value.trim(); appliedStatus.value = status.value; appliedPriority.value = priority.value; page.value = 1; ElMessage.success('查询完成'); }
function reset(): void { keyword.value = ''; status.value = ''; priority.value = ''; appliedKeyword.value = ''; appliedStatus.value = ''; appliedPriority.value = ''; page.value = 1; }
function openCreate(): void { editingId.value = undefined; Object.assign(userForm, { name: '', account: '', department: '研发部门', phone: '', role: '普通用户', priority: '普通' }); dialogVisible.value = true; }
function openEdit(row: UserRow): void { editingId.value = row.id; Object.assign(userForm, row); dialogVisible.value = true; }
async function saveUser(): Promise<void> {
  if (!await formRef.value?.validate().catch(() => false)) return;
  if (editingId.value) {
    const target = users.value.find((item) => item.id === editingId.value);
    if (target) Object.assign(target, userForm);
    ElMessage.success('用户修改成功');
  } else {
    users.value.unshift({ id: Date.now(), ...userForm, status: '正常', createdAt: '2026-08-13' });
    ElMessage.success('用户新增成功');
  }
  dialogVisible.value = false;
  reset();
}
function removeUser(id: number): void { users.value = users.value.filter((item) => item.id !== id); ElMessage.success('用户删除成功'); }
function changeStatus(row: UserRow): void { ElMessage.success(`${row.name}已${row.status === '正常' ? '启用' : '停用'}`); }
</script>

<template>
  <section data-testid="page-users">
    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="用户名称"><el-input v-model="keyword" placeholder="请输入用户名称" data-testid="user-keyword"/></el-form-item>
        <el-form-item label="状态"><el-select v-model="status" placeholder="请选择状态" clearable style="width:150px"><el-option label="正常" value="正常"/><el-option label="停用" value="停用"/></el-select></el-form-item>
        <el-form-item label="优先级"><el-select v-model="priority" placeholder="请选择优先级" clearable style="width:150px" data-testid="priority-filter"><el-option label="高" value="高"/><el-option label="普通" value="普通"/><el-option label="低" value="低"/></el-select></el-form-item>
        <el-form-item><el-button type="primary" data-testid="search-users" @click="search">搜索</el-button><el-button data-testid="reset-users" @click="reset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <template #header><div class="card-header"><strong>用户管理</strong><el-button type="primary" data-testid="create-user" @click="openCreate">新增用户</el-button></div></template>
      <el-table :data="pagedUsers" row-key="id" stripe data-testid="users-table">
        <el-table-column type="selection" width="50"/><el-table-column prop="name" label="用户名称"/><el-table-column prop="account" label="账号"/><el-table-column prop="department" label="部门"/><el-table-column prop="phone" label="手机号"/><el-table-column prop="role" label="角色"/>
        <el-table-column label="优先级" width="90"><template #default="scope"><el-tag :type="scope.row.priority === '高' ? 'danger' : scope.row.priority === '低' ? 'info' : 'primary'">{{ scope.row.priority }}</el-tag></template></el-table-column>
        <el-table-column label="状态" width="105"><template #default="scope"><el-switch v-model="scope.row.status" active-value="正常" inactive-value="停用" inline-prompt active-text="启" inactive-text="停" @change="changeStatus(scope.row)"/></template></el-table-column>
        <el-table-column prop="createdAt" label="创建时间"/><el-table-column label="操作" width="160"><template #default="scope"><el-button link type="primary" @click="openEdit(scope.row)">修改</el-button><el-popconfirm title="确认删除该用户？" @confirm="removeUser(scope.row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm></template></el-table-column>
      </el-table>
      <div class="pager"><el-pagination v-model:current-page="page" layout="total, prev, pager, next" :page-size="pageSize" :total="filteredUsers.length"/></div>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="editingId ? '修改用户' : '新增用户'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="userForm" :rules="rules" label-width="90px">
        <el-form-item label="用户名称" prop="name"><el-input v-model="userForm.name" data-testid="user-name"/></el-form-item>
        <el-form-item label="账号" prop="account"><el-input v-model="userForm.account" :disabled="Boolean(editingId)" data-testid="user-account"/></el-form-item>
        <el-form-item label="部门"><el-select v-model="userForm.department" style="width:100%"><el-option label="研发部门" value="研发部门"/><el-option label="测试部门" value="测试部门"/><el-option label="管理部门" value="管理部门"/></el-select></el-form-item>
        <el-form-item label="手机号" prop="phone"><el-input v-model="userForm.phone" data-testid="user-phone"/></el-form-item>
        <el-form-item label="角色"><el-radio-group v-model="userForm.role"><el-radio value="普通用户">普通用户</el-radio><el-radio value="管理员">管理员</el-radio></el-radio-group></el-form-item>
        <el-form-item label="优先级"><el-radio-group v-model="userForm.priority"><el-radio value="高">高</el-radio><el-radio value="普通">普通</el-radio><el-radio value="低">低</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" data-testid="save-user" @click="saveUser">保存</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>.filter-card{margin-bottom:16px}.filter-card :deep(.el-form-item){margin-bottom:0}.card-header{display:flex;align-items:center;justify-content:space-between}.pager{display:flex;justify-content:flex-end;margin-top:18px}</style>
