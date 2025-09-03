<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <el-header class="chat-header" height="60px">
      <div class="header-content">
        <div class="header-left">
          <el-button 
            type="primary" 
            @click="createNewChat"
            :icon="Plus"
            class="new-chat-btn"
          >
            新建对话
          </el-button>
          <el-button 
            type="danger" 
            @click="clearAllChats"
            :icon="Delete"
            class="clear-chats-btn"
          >
            清空对话
          </el-button>
        </div>
        
        <div class="header-center">
          <el-select 
            v-model="selectedAgent" 
            placeholder="选择AI智能体"
            class="agent-select"
            @change="onAgentChange"
          >
            <el-option
              v-for="agent in aiAgents"
              :key="agent.value"
              :label="agent.label"
              :value="agent.value"
            />
          </el-select>
          
          <el-select 
            v-model="selectedKnowledge" 
            placeholder="选择知识库"
            class="knowledge-select"
            @change="onKnowledgeChange"
          >
            <el-option
              v-for="kb in knowledgeBases"
              :key="kb.value"
              :label="kb.label"
              :value="kb.value"
            />
          </el-select>
        </div>
        
        <div class="header-right">
          <el-tooltip content="帮助文档" placement="bottom">
            <el-icon class="help-icon" @click="goHelp">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
          <el-dropdown @command="handleUploadCommand" trigger="click">
            <el-button type="primary" :icon="Upload">
              上传知识
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="upload" :icon="Document">
                  上传文件
                </el-dropdown-item>
                <el-dropdown-item command="git" :icon="Link">
                  解析Git仓库
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <el-button 
            type="info" 
            @click="goToAdmin"
            :icon="Setting"
            class="admin-btn"
          >
            管理后台
          </el-button>
        </div>
      </div>
    </el-header>

    <div class="chat-main">
      <!-- 侧边栏 -->
      <el-aside width="280px" class="chat-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">
            <el-icon><ChatDotRound /></el-icon>
            对话列表
          </h3>
        </div>
        
        <div class="chat-list">
          <div
            v-for="chat in chatList"
            :key="chat.id"
            :class="['chat-item', { active: chat.id === activeChatId }]"
            @click="selectChat(chat.id)"
          >
            <div class="chat-item-content">
              <div class="chat-title">{{ chat.title }}</div>
              <div class="chat-time">{{ formatTime(chat.lastTime) }}</div>
            </div>
            <div class="chat-actions">
              <el-button 
                type="danger" 
                size="small" 
                :icon="Delete"
                circle
                @click.stop="deleteChat(chat.id)"
              />
            </div>
          </div>
        </div>
      </el-aside>

      <!-- 主聊天区域 -->
      <el-main class="chat-content">
        <div v-if="!activeChatId" class="welcome-screen">
          <el-card class="welcome-card" shadow="hover">
            <div class="welcome-content">
              <div class="welcome-icon">
                <el-icon size="80px" color="#006633"><ChatDotRound /></el-icon>
              </div>
              <h2 class="welcome-title">欢迎使用 AI 智能文档平台</h2>
              <p class="welcome-desc">选择一个知识库或开始一个新的对话</p>
              <el-button 
                type="primary" 
                size="large" 
                @click="createNewChat"
                :icon="Plus"
              >
                开始新对话
              </el-button>
            </div>
          </el-card>
        </div>

        <div v-else class="chat-messages">
          <div
            v-for="message in activeChatMessages"
            :key="message.id"
            :class="['message', message.type]"
          >
            <div class="message-avatar">
              <el-avatar 
                :icon="message.type === 'user' ? User : Service"
                :size="40"
                :color="message.type === 'user' ? '#006633' : '#4CAF50'"
              />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="renderMessage(message.content)" />
            </div>
          </div>
          
          <div v-if="isLoading" class="message ai">
            <div class="message-avatar">
              <el-avatar icon="Service" size="40" color="#4CAF50" />
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <el-card shadow="hover" class="input-card">
            <div class="input-header">
              <el-select 
                v-model="selectedPrompt" 
                placeholder="选择提示词模板"
                class="prompt-select"
                clearable
              >
                <el-option
                  v-for="prompt in promptTemplates"
                  :key="prompt.value"
                  :label="prompt.label"
                  :value="prompt.value"
                />
              </el-select>
            </div>
            
            <el-input
              v-model="messageInput"
              type="textarea"
              :rows="4"
              placeholder="输入您的问题或指令..."
              class="message-input"
              @keydown.ctrl.enter="sendMessage"
            />
            
            <div class="input-footer">
              <div class="input-tips">
                <el-text size="small" type="info">
                  按 Ctrl + Enter 快速发送
                </el-text>
              </div>
              <el-button 
                type="primary" 
                @click="sendMessage"
                :loading="isLoading"
                :icon="Promotion"
                size="large"
              >
                发送
              </el-button>
            </div>
          </el-card>
        </div>
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Delete, Upload, Setting, Document, Link, 
  ChatDotRound, User, Service, Promotion, ArrowDown, QuestionFilled 
} from '@element-plus/icons-vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'

const router = useRouter()

// 响应式数据
const selectedAgent = ref('')
const selectedKnowledge = ref('')
const selectedPrompt = ref('')
const messageInput = ref('')
const activeChatId = ref(null)
const isLoading = ref(false)

// 模拟数据
const aiAgents = ref([
  { label: '通用AI助手', value: 'general' },
  { label: '代码专家', value: 'code' },
  { label: '文档专家', value: 'document' }
])

const knowledgeBases = ref([
  { label: '默认知识库', value: 'default' },
  { label: '技术文档', value: 'tech' },
  { label: '项目代码', value: 'project' }
])

const promptTemplates = ref([
  { label: '请解释一下...', value: 'explain' },
  { label: '如何实现...', value: 'howto' },
  { label: '总结一下...', value: 'summary' }
])

const chatList = ref([
  { id: 1, title: '关于Vue.js的问题', lastTime: Date.now() - 3600000 },
  { id: 2, title: 'Element Plus使用指南', lastTime: Date.now() - 7200000 }
])

const chatMessages = reactive({
  1: [
    { id: 1, type: 'user', content: 'Vue.js有什么优势？', time: Date.now() - 3600000 },
    { id: 2, type: 'ai', content: 'Vue.js具有以下优势：\n\n1. **渐进式框架**：可以逐步采用，从简单的视图层到完整的应用\n2. **响应式数据绑定**：数据变化自动更新视图\n3. **组件化开发**：可复用的组件系统\n4. **轻量级**：体积小，性能好\n5. **易学易用**：学习曲线平缓，文档完善', time: Date.now() - 3500000 }
  ],
  2: [
    { id: 1, type: 'user', content: 'Element Plus怎么安装？', time: Date.now() - 7200000 },
    { id: 2, type: 'ai', content: '安装Element Plus的方法：\n\n```bash\nnpm install element-plus\n```\n\n然后在main.js中引入：\n\n```javascript\nimport ElementPlus from \'element-plus\'\nimport \'element-plus/dist/index.css\'\n\napp.use(ElementPlus)\n```', time: Date.now() - 7100000 }
  ]
})

// 计算属性
const activeChatMessages = computed(() => {
  return chatMessages[activeChatId.value] || []
})

// 方法
const createNewChat = () => {
  const newChatId = Date.now()
  const newChat = {
    id: newChatId,
    title: '新对话',
    lastTime: Date.now()
  }
  chatList.value.unshift(newChat)
  chatMessages[newChatId] = []
  activeChatId.value = newChatId
  ElMessage.success('创建新对话成功')
}

const selectChat = (chatId) => {
  activeChatId.value = chatId
}

const deleteChat = async (chatId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个对话吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = chatList.value.findIndex(chat => chat.id === chatId)
    if (index > -1) {
      chatList.value.splice(index, 1)
    }
    delete chatMessages[chatId]
    
    if (activeChatId.value === chatId) {
      activeChatId.value = chatList.value.length > 0 ? chatList.value[0].id : null
    }
    
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const clearAllChats = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有对话吗？此操作不可恢复！', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    chatList.value = []
    Object.keys(chatMessages).forEach(key => delete chatMessages[key])
    activeChatId.value = null
    ElMessage.success('已清空所有对话')
  } catch {
    // 用户取消清空
  }
}

const sendMessage = async () => {
  if (!messageInput.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  
  if (!activeChatId.value) {
    createNewChat()
  }
  
  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: messageInput.value,
    time: Date.now()
  }
  
  // 添加用户消息
  if (!chatMessages[activeChatId.value]) {
    chatMessages[activeChatId.value] = []
  }
  chatMessages[activeChatId.value].push(userMessage)
  
  // 更新聊天列表标题
  const chat = chatList.value.find(c => c.id === activeChatId.value)
  if (chat && chat.title === '新对话') {
    chat.title = messageInput.value.substring(0, 20) + (messageInput.value.length > 20 ? '...' : '')
  }
  
  const inputContent = messageInput.value
  messageInput.value = ''
  
  // 模拟AI回复
  isLoading.value = true
  setTimeout(() => {
    const aiMessage = {
      id: Date.now(),
      type: 'ai',
      content: `我收到了您的消息："${inputContent}"\n\n这是一个模拟的AI回复。在实际应用中，这里会调用后端API获取真实的AI响应。`,
      time: Date.now()
    }
    chatMessages[activeChatId.value].push(aiMessage)
    isLoading.value = false
  }, 2000)
}

const handleUploadCommand = (command) => {
  if (command === 'upload') {
    router.push('/upload')
  } else if (command === 'git') {
    router.push('/git')
  }
}

const goToAdmin = () => {
  router.push('/admin')
}

const goHelp = () => {
  router.push('/help')
}

const onAgentChange = (value) => {
  console.log('选择AI智能体:', value)
}

const onKnowledgeChange = (value) => {
  console.log('选择知识库:', value)
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()
}

// marked + highlight.js + DOMPurify
marked.setOptions({
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true
})

const renderMessage = (raw) => {
  // 预处理：将常见“命令/导入/代码片段”自动包裹为代码块
  const autoFence = (text) => {
    const lines = String(text || '').split(/\r?\n/)
    const out = []
    let inFence = false
    let fenceLang = ''
    let buffer = []

    const flush = () => {
      if (buffer.length) {
        if (inFence) {
          out.push('```' + fenceLang)
          out.push(...buffer)
          out.push('```')
        } else {
          out.push(...buffer)
        }
      }
      buffer = []
    }

    const isBashStart = (l) => /^(?:\$\s*)?npm\s+|^(?:yarn|pnpm)\s+|^curl\s+|^git\s+/.test(l)
    const isJsStart = (l) => /^import\s|^export\s|^const\s|^let\s|^var\s|^app\.use|^createApp\(|;\s*$/.test(l)

    for (const line of lines) {
      if (!inFence && (isBashStart(line) || isJsStart(line))) {
        flush()
        inFence = true
        fenceLang = isBashStart(line) ? 'bash' : 'javascript'
        buffer.push(line)
        continue
      }
      if (inFence) {
        if (line.trim() === '') { // 空行视为代码块结束
          flush()
          inFence = false
          fenceLang = ''
          continue
        }
      }
      buffer.push(line)
    }
    flush()
    return out.join('\n')
  }

  const preprocessed = autoFence(raw)
  const unsafe = marked.parse(preprocessed)
  return DOMPurify.sanitize(unsafe)
}

onMounted(() => {
  // 组件挂载后的初始化逻辑
  if (chatList.value.length > 0) {
    activeChatId.value = chatList.value[0].id
  }
})
</script>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(1200px 600px at 100% -20%, rgba(0,102,51,0.08), transparent 60%),
              radial-gradient(1200px 700px at -10% 110%, rgba(255,204,0,0.10), transparent 60%);
}

/* 主题色覆盖：Element Plus 主按钮改为品牌绿 */
:deep(.el-button--primary) {
  background-color: #006633 !important;
  border-color: #006633 !important;
}
:deep(.el-button--primary:hover),
:deep(.el-button--primary:focus) {
  background-color: #005026 !important;
  border-color: #005026 !important;
}

.chat-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.header-left, .header-center, .header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.help-icon {
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease;
}
.help-icon:hover {
  color: #006633;
}

.agent-select, .knowledge-select {
  width: 160px;
}

.chat-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.chat-sidebar {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 2px 0 18px rgba(0, 102, 51, 0.08);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.chat-list {
  padding: 20px;
}

.chat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.chat-item:hover {
  background: rgba(255, 204, 0, 0.12);
  border-color: rgba(0, 102, 51, 0.25);
}

.chat-item.active {
  background: rgba(255, 204, 0, 0.18);
  border-left: 4px solid #006633;
}

.chat-item-content {
  flex: 1;
  min-width: 0;
}

.chat-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 12px;
  color: #6b7280;
}

.chat-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chat-item:hover .chat-actions {
  opacity: 1;
}

.chat-content {
  display: flex;
  flex-direction: column;
  background:rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
}

.welcome-content {
  text-align: center;
  padding: 20px;
}

.welcome-icon {
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.welcome-desc {
  font-size: 16px;
  color: #374151;
  margin-bottom: 32px;
  line-height: 1.6;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  display: flex;
  margin-bottom: 24px;
  animation: messageSlideIn 0.3s ease-out;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 12px;
}

.message-content {
  /* 默认使用自适应 + 上限，具体宽度由不同消息类型覆盖 */
  width: auto;
  max-width: 70%;
  min-width: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 10px 16px; /* 上下更窄，左右适中 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.message.user .message-content {
  background: #f3f4f6; /* 灰色用户气泡 */
  color: #1f2937;
  border-color: #e5e7eb; /* 更贴近示例的浅灰边框 */
}

/* 宽度规则：用户消息自适应，AI 回复更宽 */
.message.user .message-content {
  width: auto;
  max-width: 60%;
  min-width: 0;
  display: inline-block;
}
.message.ai .message-content {
  width: 68%;
  max-width: 820px;
  min-width: 420px;
}

.message-text {
  line-height: 1.6;
  margin-bottom: 8px;
}

.message-time {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
}

/* 移除时间显示后，此规则不再需要 */

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-10px); opacity: 1; }
}

.chat-input {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.input-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
}

.input-header {
  margin-bottom: 16px;
}

.prompt-select {
  width: 200px;
}

.message-input {
  margin-bottom: 16px;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-tips {
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    padding: 10px;
  }
  
  .header-center {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  
  .chat-sidebar {
    position: fixed;
    left: -280px;
    top: 60px;
    height: calc(100vh - 60px);
    z-index: 1000;
    transition: left 0.3s ease;
  }
  
  .chat-sidebar.open {
    left: 0;
  }
  
  .message-content,
  .message.user .message-content,
  .message.ai .message-content {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }
}
</style>


