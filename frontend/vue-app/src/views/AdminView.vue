<template>
  <div class="admin-container">
    <el-container class="admin-layout">
      <!-- 侧边栏 -->
      <el-aside width="250px" class="admin-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">
            <el-icon size="24px" color="#4CAF50"><Setting /></el-icon>
            管理后台
          </h2>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
          @select="handleMenuSelect"
        >
          <el-menu-item index="/admin">
            <el-icon><DataBoard /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          
          <el-sub-menu index="ai-agent">
            <template #title>
            <el-icon><Monitor /></el-icon>
              <span>AI智能体管理</span>
            </template>
            <el-menu-item index="/admin/ai-agent">智能体管理</el-menu-item>
            <el-menu-item index="/admin/ai-agent-client">客户端关联</el-menu-item>
            <el-menu-item index="/admin/ai-agent-task">任务调度</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="ai-client">
            <template #title>
              <el-icon><Cpu /></el-icon>
              <span>客户端管理</span>
            </template>
            <el-menu-item index="/admin/ai-client-advisor">顾问管理</el-menu-item>
            <el-menu-item index="/admin/ai-client-advisor-config">顾问配置</el-menu-item>
            <el-menu-item index="/admin/ai-client-model">模型管理</el-menu-item>
            <el-menu-item index="/admin/ai-client-model-config">模型配置</el-menu-item>
            <el-menu-item index="/admin/ai-client-system-prompt">系统提示词</el-menu-item>
            <el-menu-item index="/admin/ai-client-tool-config">工具配置</el-menu-item>
            <el-menu-item index="/admin/ai-client-tool-mcp">MCP工具</el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/admin/ai-rag-order">
            <el-icon><Document /></el-icon>
            <span>RAG订单管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="admin-main">
        <el-header class="admin-header" height="60px">
          <div class="header-content">
            <div class="header-left">
              <h3 class="page-title">{{ pageTitle }}</h3>
            </div>
            <div class="header-right">
              <el-button @click="goBack" :icon="Back">返回首页</el-button>
            </div>
          </div>
        </el-header>

        <el-main class="admin-content">
          <!-- 仪表盘 -->
          <div v-if="activeMenu === '/admin'" class="dashboard">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <div class="stat-icon">
                      <el-icon size="48px" color="#409EFF"><Monitor /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ stats.agents }}</div>
                      <div class="stat-label">智能体数量</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <div class="stat-icon">
                      <el-icon size="48px" color="#67C23A"><User /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ stats.clients }}</div>
                      <div class="stat-label">客户端数量</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <div class="stat-icon">
                      <el-icon size="48px" color="#E6A23C"><Tools /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ stats.tasks }}</div>
                      <div class="stat-label">已调度任务数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <div class="stat-icon">
                      <el-icon size="48px" color="#F56C6C"><Document /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ stats.ragOrders }}</div>
                      <div class="stat-label">RAG订单数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="12">
                <el-card shadow="hover">
                  <template #header>
                    <span>最近任务调度</span>
                  </template>
                  <el-table :data="recentJobs" style="width: 100%">
                    <el-table-column prop="jobId" label="任务ID" width="120" />
                    <el-table-column prop="agentName" label="智能体" />
                    <el-table-column prop="status" label="状态" width="110">
                      <template #default="scope">
                        <el-tag :type="getJobTagType(scope.row.status)">{{ scope.row.statusLabel }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="time" label="时间" width="180" />
                  </el-table>
                </el-card>
              </el-col>
              
              <el-col :span="12">
                <el-card shadow="hover">
                  <template #header>
                    <span>运行概览</span>
                  </template>
                  <div class="system-status">
                    <div class="status-item">
                      <span class="status-label">任务成功率</span>
                      <el-progress :percentage="overview.successRate" :color="getProgressColor" />
                    </div>
                    <div class="status-item">
                      <span class="status-label">平均延迟</span>
                      <span>{{ overview.latencyMs }} ms</span>
                    </div>
                    <div class="status-item">
                      <span class="status-label">在线智能体</span>
                      <el-tag type="success">{{ overview.activeAgents }}/{{ stats.agents }}</el-tag>
                    </div>
                    <div class="status-item">
                      <span class="status-label">队列长度</span>
                      <el-tag :type="overview.queueLength > 10 ? 'warning' : 'info'">{{ overview.queueLength }}</el-tag>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 路由视图 -->
          <router-view v-else />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Setting, DataBoard, Files, User, Document, Tools, 
  Back, Plus, ChatDotRound, Monitor,
  Cpu
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 当前激活的菜单
const activeMenu = ref('/admin')

// 页面标题
const pageTitle = computed(() => {
  const titleMap = {
    '/admin': '仪表盘',
    '/admin/ai-agent': 'AI智能体管理',
    '/admin/ai-agent-client': '智能体客户端关联',
    '/admin/ai-agent-task': 'AI代理任务调度',
    '/admin/ai-client-advisor': '客户端顾问管理',
    '/admin/ai-client-advisor-config': '客户端顾问配置',
    '/admin/ai-client-model': '客户端模型管理',
    '/admin/ai-client-model-config': '客户端模型配置',
    '/admin/ai-client-system-prompt': '系统提示词管理',
    '/admin/ai-client-tool-config': '客户端工具配置',
    '/admin/ai-client-tool-mcp': 'MCP工具管理',
    '/admin/ai-rag-order': 'RAG订单管理'
  }
  return titleMap[activeMenu.value] || '管理后台'
})

// 统计数据（与功能贴合）
const stats = reactive({
  agents: 12,
  clients: 28,
  tasks: 342,
  ragOrders: 76
})

// 最近任务
const recentJobs = ref([
  { jobId: 'T-202501-001', agentName: '报表生成Agent', status: 'success', statusLabel: '成功', time: '2025-01-15 14:30:00' },
  { jobId: 'T-202501-002', agentName: '数据同步Agent', status: 'running', statusLabel: '运行中', time: '2025-01-15 14:22:10' },
  { jobId: 'T-202501-003', agentName: '知识入库Agent', status: 'queued', statusLabel: '排队中', time: '2025-01-15 14:05:40' }
])

// 概览
const overview = reactive({
  successRate: 92,
  latencyMs: 184,
  activeAgents: 9,
  queueLength: 3
})

// 方法
const handleMenuSelect = (index) => {
  router.push(index)
}

const goBack = () => {
  router.push('/')
}

const getProgressColor = (percentage) => {
  if (percentage < 50) return '#4CAF50'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

const getJobTagType = (status) => {
  if (status === 'success') return 'success'
  if (status === 'running') return 'warning'
  if (status === 'queued') return 'info'
  return ''
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
}, { immediate: true })

onMounted(() => {
  // 设置初始激活菜单
  activeMenu.value = route.path
})
</script>

<style scoped>
.admin-container {
  height: 100vh;
  background: #f5f7fa;
}

.admin-layout {
  height: 100%;
}

.admin-sidebar {
  background: linear-gradient(160deg, #0a0f1a 0%, #0e1730 45%, #0a0f1a 100%);
  color: #f3f6fb;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.06);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #435266;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: #f3f6fb;
  font-size: 19px;
  font-weight: 600;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: #cdd6e3;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  transition: background 0.2s ease, color 0.2s ease, padding-left 0.2s ease;
  height: 46px;
  line-height: 46px;
  font-size: 14.5px;
}

.sidebar-menu :deep(.el-sub-menu__title:hover),
.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.10);
  color: #ffffff;
}

.sidebar-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  box-shadow: inset 3px 0 0 rgba(0, 102, 51, 0.92);;
  font-weight: 600;
}

.sidebar-menu :deep(.el-menu--inline) {
  background: rgba(8, 12, 24, 0.9) !important;
}

.sidebar-menu :deep(.el-menu--inline .el-menu-item) {
  color: #eef3f9;
  height: 44px;
  line-height: 44px;
}

.sidebar-menu :deep(.el-menu--inline .el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.sidebar-menu :deep(.el-menu--inline .el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.32) 0%, rgba(34, 197, 94, 0.16) 100%);
  color: #ffffff;
  box-shadow: inset 3px 0 0rgba(0, 102, 51, 0.92);;
}

.sidebar-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title .el-sub-menu__icon-arrow),
.sidebar-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title .el-icon) {
  color: #ffffff;
  opacity: 1;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.28) 0%, rgba(34, 197, 94, 0.12) 100%);
  color: #ffffff;
  box-shadow: inset 3px 0 0 rgba(0, 102, 51, 0.92);;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  padding-left: 18px;
}
.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 36px !important;
}
.sidebar-menu :deep(.el-icon) {
  opacity: 1;
  color: #d7e3f2;
}

.sidebar-menu :deep(.el-sub-menu__icon-arrow) {
  color: #cdd6e3;
}

.admin-main {
  background: #f5f7fa;
}

.admin-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.admin-content {
  padding: 20px;
}

.stat-card {
  background: rgba(0, 102, 51, 0.92);
  color: #fff;
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  opacity: 0.8;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.system-status {
  padding: 20px 0;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.status-label {
  font-weight: 500;
  color: #303133;
  min-width: 100px;
}

.logs-filter {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-tip {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

/* 新增样式 */
.metric-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid rgba(0, 102, 51, 0.92);
}

.metric-icon {
  opacity: 0.8;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: rgba(0, 102, 51, 0.92);;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 14px;
  color: #303133;
}

.chart-placeholder {
  margin-top: 30px;
  padding: 40px;
  text-align: center;
  background: #fafafa;
  border-radius: 8px;
  border: 2px dashed #dcdfe6;
}

.backup-actions {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-top: 1px solid #e4e7ed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: -250px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
  }
  
  .admin-sidebar.open {
    left: 0;
  }
  
  .admin-content {
    padding: 10px;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
