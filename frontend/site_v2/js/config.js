/**
 * 全局配置文件
 * 用于集中管理服务器地址等配置信息
 */
const ApiConfig = {
    // 服务器基础地址
    BASE_URL: 'http://192.168.1.104:8091',
    
    // API路径前缀
    API_PREFIX: '/ai-agent-station/api/v1',
    
    // 环境配置
    ENV: 'development', // development, test, production
    
    // 不同环境的配置
    ENVIRONMENTS: {
        development: {
            BASE_URL: 'http://192.168.1.104:8091',
            API_PREFIX: '/ai-agent-station/api/v1',
            TIMEOUT: 30000
        },
        test: {
            BASE_URL: 'http://test-server:8091',
            API_PREFIX: '/ai-agent-station/api/v1',
            TIMEOUT: 30000
        },
        production: {
            BASE_URL: 'https://api.yourdomain.com',
            API_PREFIX: '/api/v1',
            TIMEOUT: 30000
        }
    },
    
    // 获取当前环境配置
    getCurrentConfig: function() {
        return this.ENVIRONMENTS[this.ENV] || this.ENVIRONMENTS.development;
    },
    
    // 获取完整API URL
    getApiUrl: function(path) {
        const config = this.getCurrentConfig();
        return config.BASE_URL + config.API_PREFIX + path;
    },
    
    // 获取基础URL
    getBaseUrl: function() {
        return this.getCurrentConfig().BASE_URL;
    },
    
    // 获取API前缀
    getApiPrefix: function() {
        return this.getCurrentConfig().API_PREFIX;
    },
    
    // 获取请求超时时间
    getTimeout: function() {
        return this.getCurrentConfig().TIMEOUT;
    },
    
    // 设置环境
    setEnvironment: function(env) {
        if (this.ENVIRONMENTS[env]) {
            this.ENV = env;
            console.log(`环境已切换到: ${env}`);
        } else {
            console.error(`不支持的环境: ${env}`);
        }
    },
    
    // API端点配置
    ENDPOINTS: {
        // 聊天相关
        CHAT: {
            STREAM: '/ai/agent/chat_stream',
            HISTORY: '/ai/agent/chat_history'
        },
        
        // 知识库相关
        RAG: {
            LIST: '/ai/admin/rag/queryAllValidRagOrder',
            ADD: '/ai/admin/rag/addRagOrder',
            UPDATE: '/ai/admin/rag/updateRagOrder',
            DELETE: '/ai/admin/rag/deleteRagOrder',
            DETAIL: '/ai/admin/rag/queryRagOrderDetail',
            ANALYZE_GIT: '/rag/analyze_git_repository'
        },
        
        // AI代理相关
        AGENT: {
            LIST: '/ai/admin/agent/queryAiAgentList',
            LIST_BY_CHANNEL: '/ai/admin/agent/queryAllAgentConfigListByChannel',
            ADD: '/ai/admin/agent/addAiAgent',
            UPDATE: '/ai/admin/agent/updateAiAgent',
            DELETE: '/ai/admin/agent/deleteAiAgent',
            DETAIL: '/ai/admin/agent/queryAiAgentDetail'
        },
        
        // 客户端模型配置
        CLIENT_MODEL: {
            LIST: '/ai/admin/client/model/config/queryClientModelConfigList',
            ADD: '/ai/admin/client/model/config/addClientModelConfig',
            UPDATE: '/ai/admin/client/model/config/updateClientModelConfig',
            DELETE: '/ai/admin/client/model/config/deleteClientModelConfig',
            DETAIL: '/ai/admin/client/model/config/queryClientModelConfigDetail'
        },
        
        // 客户端工具配置
        CLIENT_TOOL: {
            LIST: '/ai/admin/client/tool/config/queryClientToolConfigList',
            ADD: '/ai/admin/client/tool/config/addClientToolConfig',
            UPDATE: '/ai/admin/client/tool/config/updateClientToolConfig',
            DELETE: '/ai/admin/client/tool/config/deleteClientToolConfig',
            DETAIL: '/ai/admin/client/tool/config/queryClientToolConfigDetail'
        },
        
        // MCP工具管理
        MCP: {
            LIST: '/ai/admin/client/tool/mcp/queryMcpList',
            ADD: '/ai/admin/client/tool/mcp/addMcp',
            UPDATE: '/ai/admin/client/tool/mcp/updateMcp',
            DELETE: '/ai/admin/client/tool/mcp/deleteMcp',
            DETAIL: '/ai/admin/client/tool/mcp/queryMcpDetail'
        },
        
        // 客户端顾问配置
        CLIENT_ADVISOR: {
            LIST: '/ai/admin/client/advisor/config/queryClientAdvisorConfigList',
            ADD: '/ai/admin/client/advisor/config/addClientAdvisorConfig',
            UPDATE: '/ai/admin/client/advisor/config/updateClientAdvisorConfig',
            DELETE: '/ai/admin/client/advisor/config/deleteClientAdvisorConfig',
            DETAIL: '/ai/admin/client/advisor/config/queryClientAdvisorConfigDetail'
        },
        
        // 系统提示词配置
        SYSTEM_PROMPT: {
            LIST: '/ai/admin/client/system/prompt/queryAllSystemPromptConfig',
            ADD: '/ai/admin/client/system/prompt/addSystemPromptConfig',
            UPDATE: '/ai/admin/client/system/prompt/updateSystemPromptConfig',
            DELETE: '/ai/admin/client/system/prompt/deleteSystemPromptConfig',
            DETAIL: '/ai/admin/client/system/prompt/querySystemPromptConfigDetail'
        },
        
        // 文件上传
        FILE: {
            UPLOAD: '/ai/agent/file/upload',
            DELETE: '/ai/agent/file/delete',
            LIST: '/ai/agent/file/list'
        }
    },
    
    // 获取API端点URL
    getEndpointUrl: function(category, action) {
        if (this.ENDPOINTS[category] && this.ENDPOINTS[category][action]) {
            return this.getApiUrl(this.ENDPOINTS[category][action]);
        }
        console.error(`未找到API端点: ${category}.${action}`);
        return null;
    },
    
    // 通用请求配置
    REQUEST_CONFIG: {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 30000
    },
    
    // 获取请求配置
    getRequestConfig: function(customConfig = {}) {
        return {
            ...this.REQUEST_CONFIG,
            timeout: this.getTimeout(),
            ...customConfig
        };
    }
};

// 防止被修改
Object.freeze(ApiConfig);