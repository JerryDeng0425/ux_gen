<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
const visible = ref(true);
const form = reactive({ title: '基础用法', content: '弹框内容-基础用法' });
function save(): void { visible.value = false; ElMessage.success('弹框内容保存成功'); }
</script>

<template><el-card shadow="never" data-testid="page-dialog-editor"><template #header><strong>函数式弹框</strong></template><el-space wrap><el-button type="primary" @click="visible=true">基础用法</el-button><el-button>可拖拽</el-button><el-button>全屏</el-button><el-button>结合 Form 表单</el-button></el-space><el-divider/><el-text type="info">点击按钮预览不同弹框状态，本页保留了录制时已打开的基础弹框。</el-text></el-card><el-dialog v-model="visible" title="基础用法" width="520px" data-testid="basic-dialog"><el-form :model="form" label-width="90px"><el-form-item label="标题"><el-input v-model="form.title"/></el-form-item><el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="3" data-testid="dialog-content"/></el-form-item></el-form><p>{{ form.content }}</p><template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" data-testid="save-dialog" @click="save">确定</el-button></template></el-dialog></template>
