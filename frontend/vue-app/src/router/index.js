import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '@/views/ChatView.vue'
import UploadView from '@/views/UploadView.vue'
import GitView from '@/views/GitView.vue'
import AdminView from '@/views/AdminView.vue'
import HelpView from '@/views/HelpView.vue'

// Admin sub-pages (placeholders)
const AiAgent = () => import('@/views/admin/AiAgent.vue')
const AiAgentClient = () => import('@/views/admin/AiAgentClient.vue')
const AiAgentTask = () => import('@/views/admin/AiAgentTask.vue')
const AiClientAdvisor = () => import('@/views/admin/AiClientAdvisor.vue')
const AiClientAdvisorConfig = () => import('@/views/admin/AiClientAdvisorConfig.vue')
const AiClientModel = () => import('@/views/admin/AiClientModel.vue')
const AiClientModelConfig = () => import('@/views/admin/AiClientModelConfig.vue')
const AiClientSystemPrompt = () => import('@/views/admin/AiClientSystemPrompt.vue')
const AiClientToolConfig = () => import('@/views/admin/AiClientToolConfig.vue')
const AiClientToolMcp = () => import('@/views/admin/AiClientToolMcp.vue')
const AiRagOrder = () => import('@/views/admin/AiRagOrder.vue')

const routes = [
  {
    path: '/',
    name: 'Chat',
    component: ChatView,
    meta: { title: 'AI对话' }
  },
  {
    path: '/upload',
    name: 'Upload',
    component: UploadView,
    meta: { title: '上传文件' }
  },
  {
    path: '/git',
    name: 'Git',
    component: GitView,
    meta: { title: 'Git仓库' }
  },
  {
    path: '/help',
    name: 'Help',
    component: HelpView,
    meta: { title: '帮助中心' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { title: '管理后台' },
    children: [
      { path: 'ai-agent', name: 'AiAgent', component: AiAgent, meta: { title: 'AI智能体管理' } },
      { path: 'ai-agent-client', name: 'AiAgentClient', component: AiAgentClient, meta: { title: '智能体客户端关联' } },
      { path: 'ai-agent-task', name: 'AiAgentTask', component: AiAgentTask, meta: { title: 'AI代理任务调度' } },
      { path: 'ai-client-advisor', name: 'AiClientAdvisor', component: AiClientAdvisor, meta: { title: '客户端顾问管理' } },
      { path: 'ai-client-advisor-config', name: 'AiClientAdvisorConfig', component: AiClientAdvisorConfig, meta: { title: '客户端顾问配置' } },
      { path: 'ai-client-model', name: 'AiClientModel', component: AiClientModel, meta: { title: '客户端模型管理' } },
      { path: 'ai-client-model-config', name: 'AiClientModelConfig', component: AiClientModelConfig, meta: { title: '客户端模型配置' } },
      { path: 'ai-client-system-prompt', name: 'AiClientSystemPrompt', component: AiClientSystemPrompt, meta: { title: '系统提示词管理' } },
      { path: 'ai-client-tool-config', name: 'AiClientToolConfig', component: AiClientToolConfig, meta: { title: '客户端工具配置' } },
      { path: 'ai-client-tool-mcp', name: 'AiClientToolMcp', component: AiClientToolMcp, meta: { title: 'MCP工具管理' } },
      { path: 'ai-rag-order', name: 'AiRagOrder', component: AiRagOrder, meta: { title: 'RAG订单管理' } }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - AI智能文档平台`
  next()
})

export default router

