<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
const form = reactive({ applicant: '小林', department: '研发部门', category: '新功能开发', deadline: '2030-10-30', priority: '普通', reason: '开发多租户管理' });
const formRef = ref<FormInstance>();
const rules: FormRules = { applicant: [{ required: true, message: '请输入申请人', trigger: 'blur' }], department: [{ required: true, message: '请选择所属部门', trigger: 'change' }], category: [{ required: true, message: '请选择申请类型', trigger: 'change' }], reason: [{ required: true, message: '请输入申请说明', trigger: 'blur' }] };
async function submit(): Promise<void> { if (await formRef.value?.validate().catch(() => false)) ElMessage.success('业务申请提交成功'); }
function draft(): void { ElMessage.success('草稿已保存在当前会话'); }
</script>

<template><el-card shadow="never" data-testid="page-application"><template #header><strong>业务申请表单</strong></template><el-alert title="请完整填写申请信息，带 * 项为必填" type="info" :closable="false" show-icon/><el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="application-form"><el-row :gutter="20"><el-col :span="12"><el-form-item label="申请人" prop="applicant"><el-input v-model="form.applicant"/></el-form-item></el-col><el-col :span="12"><el-form-item label="所属部门" prop="department"><el-select v-model="form.department" style="width:100%"><el-option label="研发部门" value="研发部门"/><el-option label="管理部门" value="管理部门"/></el-select></el-form-item></el-col><el-col :span="12"><el-form-item label="申请类型" prop="category"><el-select v-model="form.category" style="width:100%"><el-option label="新功能开发" value="新功能开发"/><el-option label="版本发布" value="版本发布"/></el-select></el-form-item></el-col><el-col :span="12"><el-form-item label="期望完成日期"><el-date-picker v-model="form.deadline" type="date" value-format="YYYY-MM-DD" style="width:100%"/></el-form-item></el-col></el-row><el-form-item label="优先级"><el-radio-group v-model="form.priority"><el-radio value="普通">普通</el-radio><el-radio value="紧急">紧急</el-radio></el-radio-group></el-form-item><el-form-item label="申请说明" prop="reason"><el-input v-model="form.reason" type="textarea" :rows="5" data-testid="application-reason"/></el-form-item><el-form-item><el-button type="primary" data-testid="submit-application" @click="submit">提交申请</el-button><el-button @click="draft">保存草稿</el-button><el-button>取消</el-button></el-form-item></el-form></el-card></template>

<style scoped>.application-form{max-width:980px;margin-top:24px}</style>
