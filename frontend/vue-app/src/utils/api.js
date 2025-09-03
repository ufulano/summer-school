import axios from 'axios'

export const API_ENV = {
  // 依据 API-QUICK-REFERENCE.md：开发默认端口 8091，无固定前缀
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8091',
  API_PREFIX: import.meta.env.VITE_API_PREFIX || ''
}

export const ENDPOINTS = {
  AGENT: {
    // 参考文档：获取AI代理列表
    LIST: '/ai/admin/agent/queryAllAgentConfigListByChannel',
    DETAIL: '/ai/admin/agent/queryAiAgentDetail',
    ADD: '/ai/admin/agent/addAiAgent',
    UPDATE: '/ai/admin/agent/updateAiAgent',
    DELETE: '/ai/admin/agent/deleteAiAgent'
  },
  CHAT: {
    // 流式聊天（SSE）
    STREAM: '/ai/agent/chat_stream'
  },
  TASK: {
    LIST: '/ai/admin/agent/task/schedule/queryTaskScheduleList', // 如果实际不同，后续按接口修正
    ADD: '/ai/admin/agent/task/schedule/addTaskSchedule',
    UPDATE: '/ai/admin/agent/task/schedule/updateTaskSchedule',
    DELETE: '/ai/admin/agent/task/schedule/deleteTaskSchedule'
  },
  CLIENT_MODEL: {
    LIST: '/ai/admin/client/model/queryClientModelList',
    DETAIL: '/ai/admin/client/model/queryClientModelById',
    ADD: '/ai/admin/client/model/addClientModel',
    UPDATE: '/ai/admin/client/model/updateClientModel',
    DELETE: '/ai/admin/client/model/deleteClientModel'
  },
  CLIENT_TOOL: {
    LIST: '/ai/admin/client/tool/config/queryClientToolConfigList',
    DETAIL: '/ai/admin/client/tool/config/queryClientToolConfigById',
    ADD: '/ai/admin/client/tool/config/addClientToolConfig',
    UPDATE: '/ai/admin/client/tool/config/updateClientToolConfig',
    DELETE: '/ai/admin/client/tool/config/deleteClientToolConfig'
  },
  MCP: {
    LIST: '/ai/admin/client/tool/mcp/queryMcpList',
    DETAIL: '/ai/admin/client/tool/mcp/queryMcpById',
    ADD: '/ai/admin/client/tool/mcp/addMcp',
    UPDATE: '/ai/admin/client/tool/mcp/updateMcp',
    DELETE: '/ai/admin/client/tool/mcp/deleteMcp'
  },
  CLIENT_ADVISOR: {
    // 顾问管理
    LIST: '/ai/admin/client/advisor/queryClientAdvisorList',
    DETAIL: '/ai/admin/client/advisor/queryClientAdvisorById',
    ADD: '/ai/admin/client/advisor/addClientAdvisor',
    UPDATE: '/ai/admin/client/advisor/advisor/updateClientAdvisor',
    DELETE: '/ai/admin/client/advisor/deleteClientAdvisor'
  },
  CLIENT_ADVISOR_CONFIG: {
    LIST: '/ai/admin/client/advisor/config/queryClientAdvisorConfigList',
    DETAIL: '/ai/admin/client/advisor/config/queryClientAdvisorConfigById',
    ADD: '/ai/admin/client/advisor/config/addClientAdvisorConfig',
    UPDATE: '/ai/admin/client/advisor/config/updateClientAdvisorConfig',
    DELETE: '/ai/admin/client/advisor/config/deleteClientAdvisorConfig'
  },
  SYSTEM_PROMPT: {
    LIST: '/ai/admin/client/system/prompt/queryAllSystemPromptConfig',
    DETAIL: '/ai/admin/client/system/prompt/querySystemPromptById',
    ADD: '/ai/admin/client/system/prompt/addSystemPrompt',
    UPDATE: '/ai/admin/client/system/prompt/updateSystemPrompt',
    DELETE: '/ai/admin/client/system/prompt/deleteSystemPrompt'
  },
  CLIENT_MODEL_CONFIG: {
    LIST: '/ai/admin/client/model/config/queryClientModelConfigList',
    DETAIL: '/ai/admin/client/model/config/queryClientModelConfigById',
    ADD: '/ai/admin/client/model/config/addClientModelConfig',
    UPDATE: '/ai/admin/client/model/config/updateClientModelConfig',
    DELETE: '/ai/admin/client/model/config/deleteClientModelConfig'
  },
  RAG: {
    LIST: '/ai/admin/rag/queryAllValidRagOrder',
    DETAIL: '/ai/admin/rag/queryRagOrderById',
    ADD: '/ai/admin/rag/addRagOrder',
    UPDATE: '/ai/admin/rag/updateRagOrder',
    DELETE: '/ai/admin/rag/deleteRagOrder'
  }
}

export const getUrl = (path) => `${API_ENV.BASE_URL}${API_ENV.API_PREFIX}${path}`

export const api = axios.create({
  baseURL: `${API_ENV.BASE_URL}${API_ENV.API_PREFIX}`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
)
