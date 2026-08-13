<script setup lang="ts">
const metrics = [
  { label: '今日访问', value: 3500, note: '较昨日 +12%' },
  { label: '新增用户', value: 188, note: '本周累计 1,260' },
  { label: '待办任务', value: 14, note: '3 项即将到期' },
  { label: '系统消息', value: 8, note: '2 条未读' }
];
const tasks = [
  { name: '第三方紧急代码变更', owner: '小林', status: '马上到期', type: 'danger' },
  { name: '版本发布', owner: '小铭', status: '进行中', type: 'warning' },
  { name: '新功能开发', owner: '小林', status: '进行中', type: 'primary' },
  { name: '多租户管理', owner: '小铭', status: '未开始', type: 'info' }
];
</script>

<template>
  <section data-testid="page-overview">
    <el-row :gutter="16">
      <el-col v-for="metric in metrics" :key="metric.label" :span="6">
        <el-card shadow="never" class="metric-card">
          <el-statistic :title="metric.label" :value="metric.value" />
          <el-text type="info" size="small">{{ metric.note }}</el-text>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" class="section-row">
      <el-col :span="15"><el-card shadow="never"><template #header><strong>运营趋势</strong></template><div class="trend-bars"><span v-for="height in [42,58,48,72,64,86,76,94,82,100]" :key="height" :style="{height: `${height}%`}" /></div></el-card></el-col>
      <el-col :span="9"><el-card shadow="never"><template #header><strong>任务进度</strong></template><div class="progress-item"><span>本周任务</span><el-progress :percentage="72" /></div><div class="progress-item"><span>版本发布</span><el-progress :percentage="45" status="warning" /></div><div class="progress-item"><span>问题修复</span><el-progress :percentage="88" status="success" /></div></el-card></el-col>
    </el-row>
    <el-card shadow="never"><template #header><strong>重点任务</strong></template><el-table :data="tasks" row-key="name"><el-table-column prop="name" label="任务名称" min-width="220"/><el-table-column prop="owner" label="负责人"/><el-table-column label="状态"><template #default="scope"><el-tag :type="scope.row.type">{{ scope.row.status }}</el-tag></template></el-table-column></el-table></el-card>
  </section>
</template>

<style scoped>.metric-card{height:130px}.section-row{margin:16px 0}.trend-bars{display:flex;align-items:flex-end;gap:14px;height:190px;padding:18px;background:linear-gradient(180deg,#f4f9ff,#fff)}.trend-bars span{flex:1;min-height:20px;border-radius:5px 5px 0 0;background:linear-gradient(180deg,#79bbff,#409eff)}.progress-item{margin:18px 0}.progress-item>span{display:block;margin-bottom:8px;color:#606266}</style>
