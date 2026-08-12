<script setup lang="ts">
const activities = [
  { time: '今天', text: '小铭 评论了你：诚信在于心行合一。' },
  { time: '昨天', text: '李白 回复了你：长风破浪会有时，直挂云帆济沧海。' },
  { time: '06-18', text: '版本发布任务已进入验收阶段。' }
];
</script>

<template>
  <section data-testid="page-home">
    <el-card shadow="never" class="welcome-card"><div><h2>早上好，小铭！</h2><p>今天是充满活力的一天，当前有 4 项待办任务。</p></div><el-badge :value="4"><el-button type="primary">查看待办</el-button></el-badge></el-card>
    <el-row :gutter="16" class="section-row">
      <el-col :span="15"><el-card shadow="never"><template #header><strong>最新动态</strong></template><el-timeline><el-timeline-item v-for="item in activities" :key="item.text" :timestamp="item.time">{{ item.text }}</el-timeline-item></el-timeline></el-card></el-col>
      <el-col :span="9"><el-card shadow="never"><template #header><strong>快捷入口</strong></template><el-space wrap><el-button>用户管理</el-button><el-button>业务申请</el-button><el-button>系统日志</el-button><el-button>账户设置</el-button></el-space><el-divider/><el-alert title="消息(3) · 待办(4)" type="info" show-icon :closable="false"/></el-card></el-col>
    </el-row>
  </section>
</template>

<style scoped>.welcome-card :deep(.el-card__body){display:flex;align-items:center;justify-content:space-between}.welcome-card h2{margin:0 0 8px}.welcome-card p{margin:0;color:#909399}.section-row{margin-top:16px}</style>
