/**
 * API客户端工具类
 * 统一处理API调用、错误处理和响应渲染
 */
class ApiClient {
    constructor() {
        this.defaultConfig = {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
    
    /**
     * 通用请求方法
     * @param {string} url 请求URL
     * @param {Object} options 请求选项
     * @returns {Promise} 请求Promise
     */
    async request(url, options = {}) {
        const config = {
            ...this.defaultConfig,
            ...options,
            headers: {
                ...this.defaultConfig.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            
            // 检查响应状态
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // 根据Content-Type处理响应
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }
    
    /**
     * GET请求
     * @param {string} url 请求URL
     * @param {Object} params 查询参数
     * @param {Object} options 请求选项
     * @returns {Promise} 请求Promise
     */
    async get(url, params = {}, options = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        
        return this.request(fullUrl, {
            method: 'GET',
            ...options
        });
    }
    
    /**
     * POST请求
     * @param {string} url 请求URL
     * @param {Object} data 请求数据
     * @param {Object} options 请求选项
     * @returns {Promise} 请求Promise
     */
    async post(url, data = {}, options = {}) {
        const isFormData = data instanceof FormData;
        
        return this.request(url, {
            method: 'POST',
            headers: isFormData ? {} : this.defaultConfig.headers,
            body: isFormData ? data : JSON.stringify(data),
            ...options
        });
    }
    
    /**
     * PUT请求
     * @param {string} url 请求URL
     * @param {Object} data 请求数据
     * @param {Object} options 请求选项
     * @returns {Promise} 请求Promise
     */
    async put(url, data = {}, options = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    }
    
    /**
     * DELETE请求
     * @param {string} url 请求URL
     * @param {Object} options 请求选项
     * @returns {Promise} 请求Promise
     */
    async delete(url, options = {}) {
        return this.request(url, {
            method: 'DELETE',
            ...options
        });
    }
    
    /**
     * 流式请求（SSE）
     * @param {string} url 请求URL
     * @param {Function} onMessage 消息处理函数
     * @param {Function} onError 错误处理函数
     * @param {Function} onComplete 完成处理函数
     * @returns {EventSource} EventSource对象
     */
    stream(url, onMessage, onError, onComplete) {
        const eventSource = new EventSource(url);
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('解析SSE数据失败:', error);
                onError(error);
            }
        };
        
        eventSource.onerror = (error) => {
            console.error('SSE连接错误:', error);
            onError(error);
        };
        
        eventSource.addEventListener('complete', () => {
            onComplete();
            eventSource.close();
        });
        
        return eventSource;
    }
}

/**
 * 响应处理器
 */
class ResponseHandler {
    /**
     * 处理API响应
     * @param {Object} response API响应
     * @param {Object} options 处理选项
     * @returns {Object} 处理后的数据
     */
    static handleResponse(response, options = {}) {
        const {
            showSuccessMessage = false,
            showErrorMessage = true,
            successMessage = '操作成功',
            errorMessage = '操作失败'
        } = options;
        
        // 检查响应格式
        if (response && typeof response === 'object') {
            // 标准响应格式
            if (response.code === '0000' || response.success === true) {
                if (showSuccessMessage) {
                    this.showMessage(successMessage, 'success');
                }
                return response.data || response.result || response;
            } else {
                const errorMsg = response.info || response.message || errorMessage;
                if (showErrorMessage) {
                    this.showMessage(errorMsg, 'error');
                }
                throw new Error(errorMsg);
            }
        }
        
        // 直接返回响应数据
        return response;
    }
    
    /**
     * 显示消息
     * @param {string} message 消息内容
     * @param {string} type 消息类型
     */
    static showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        messageEl.innerHTML = `
            <div class="flex items-center gap-2">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(messageEl);
        
        // 自动移除
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 5000);
    }
    
    /**
     * 显示加载状态
     * @param {string} message 加载消息
     * @returns {HTMLElement} 加载元素
     */
    static showLoading(message = '加载中...') {
        const loadingEl = document.createElement('div');
        loadingEl.id = 'api-loading';
        loadingEl.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loadingEl.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(loadingEl);
        return loadingEl;
    }
    
    /**
     * 隐藏加载状态
     */
    static hideLoading() {
        const loadingEl = document.getElementById('api-loading');
        if (loadingEl) {
            loadingEl.remove();
        }
    }
}

/**
 * 错误处理器
 */
class ErrorHandler {
    /**
     * 处理API错误
     * @param {Error} error 错误对象
     * @param {Object} options 处理选项
     */
    static handleError(error, options = {}) {
        const {
            showMessage = true,
            logError = true,
            fallbackMessage = '操作失败，请稍后重试'
        } = options;
        
        if (logError) {
            console.error('API错误:', error);
        }
        
        let errorMessage = fallbackMessage;
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = '网络连接失败，请检查网络设置';
        } else if (error.name === 'AbortError') {
            errorMessage = '请求超时，请稍后重试';
        }
        
        if (showMessage) {
            ResponseHandler.showMessage(errorMessage, 'error');
        }
        
        return errorMessage;
    }
}

/**
 * 创建API客户端实例
 */
const apiClient = new ApiClient();

/**
 * 便捷的API调用方法
 */
const ApiUtils = {
    /**
     * 获取知识库列表
     */
    async getRagList() {
        try {
            const response = await apiClient.post(ApiConfig.getEndpointUrl('RAG', 'LIST'));
            return ResponseHandler.handleResponse(response);
        } catch (error) {
            ErrorHandler.handleError(error);
            throw error;
        }
    },
    
    /**
     * 获取AI代理列表
     */
    async getAgentList(channel = 'chat_stream') {
        try {
            const response = await apiClient.post(ApiConfig.getEndpointUrl('AGENT', 'LIST_BY_CHANNEL'), 
                `channel=${channel}`, 
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            return ResponseHandler.handleResponse(response);
        } catch (error) {
            ErrorHandler.handleError(error);
            throw error;
        }
    },
    
    /**
     * 获取系统提示词列表
     */
    async getPromptList() {
        try {
            const response = await apiClient.post(ApiConfig.getEndpointUrl('SYSTEM_PROMPT', 'LIST'));
            return ResponseHandler.handleResponse(response);
        } catch (error) {
            ErrorHandler.handleError(error);
            throw error;
        }
    },
    
    /**
     * 上传文件
     */
    async uploadFile(formData) {
        try {
            ResponseHandler.showLoading('文件上传中...');
            const response = await apiClient.post(ApiConfig.getEndpointUrl('FILE', 'UPLOAD'), formData);
            ResponseHandler.hideLoading();
            return ResponseHandler.handleResponse(response, { 
                showSuccessMessage: true, 
                successMessage: '文件上传成功' 
            });
        } catch (error) {
            ResponseHandler.hideLoading();
            ErrorHandler.handleError(error);
            throw error;
        }
    },
    
    /**
     * 解析Git仓库
     */
    async analyzeGitRepository(repoUrl, userName, token) {
        try {
            ResponseHandler.showLoading('正在解析仓库...');
            const response = await apiClient.post(ApiConfig.getEndpointUrl('RAG', 'ANALYZE_GIT'), 
                `repoUrl=${encodeURIComponent(repoUrl)}&userName=${encodeURIComponent(userName)}&token=${encodeURIComponent(token)}`,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            ResponseHandler.hideLoading();
            return ResponseHandler.handleResponse(response, { 
                showSuccessMessage: true, 
                successMessage: '仓库解析成功' 
            });
        } catch (error) {
            ResponseHandler.hideLoading();
            ErrorHandler.handleError(error);
            throw error;
        }
    },
    
    /**
     * 开始流式聊天
     */
    startChatStream(aiAgentId, ragId, message, onMessage, onError, onComplete) {
        const ragIdParam = ragId || '0';
        const url = `${ApiConfig.getBaseUrl()}${ApiConfig.getApiPrefix()}/ai/agent/chat_stream?aiAgentId=${aiAgentId}&ragId=${ragIdParam}&message=${encodeURIComponent(message)}`;
        
        return apiClient.stream(url, onMessage, onError, onComplete);
    }
};

// 导出到全局
window.ApiClient = ApiClient;
window.ResponseHandler = ResponseHandler;
window.ErrorHandler = ErrorHandler;
window.apiClient = apiClient;
window.ApiUtils = ApiUtils;
