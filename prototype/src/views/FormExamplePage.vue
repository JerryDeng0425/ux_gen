<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
const initial = { name: '版本发布', region: '研发部门', type: '线上活动', date: '2026-08-13', delivery: true, description: '指派小铭完成更新并发布。' };
const form = reactive({ ...initial });
const formRef = ref<FormInstance>();
const rules: FormRules = { name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }], region: [{ required: true, message: '请选择所属部门', trigger: 'change' }], description: [{ required: true, message: '请输入任务说明', trigger: 'blur' }] };
async function submit(): Promise<void> { if (await formRef.value?.validate().catch(() => false)) ElMessage.success('表单提交成功'); }
function reset(): void { Object.assign(form, initial); formRef.value?.clearValidate(); ElMessage.info('表单已重置'); }
</script>

<template><el-card shadow="never" data-testid="page-form"><template #header><strong>表单示例</strong></template><el-form ref="formRef" :model="form" :rules="rules" label-width="110px" style="max-width:820px"><el-form-item label="任务名称" prop="name"><el-input v-model="form.name" data-testid="task-name"/></el-form-item><el-form-item label="所属部门" prop="region"><el-select v-model="form.region" style="width:100%"><el-option label="研发部门" value="研发部门"/><el-option label="管理部门" value="管理部门"/></el-select></el-form-item><el-form-item label="活动类型"><el-radio-group v-model="form.type"><el-radio value="线上活动">线上活动</el-radio><el-radio value="线下活动">线下活动</el-radio></el-radio-group></el-form-item><el-form-item label="发布日期"><el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD"/></el-form-item><el-form-item label="立即交付"><el-switch v-model="form.delivery"/></el-form-item><el-form-item label="任务说明" prop="description"><el-input v-model="form.description" type="textarea" :rows="4"/></el-form-item><el-form-item><el-button type="primary" data-testid="submit-task" @click="submit">提交</el-button><el-button @click="reset">重置</el-button></el-form-item></el-form></el-card></template>
