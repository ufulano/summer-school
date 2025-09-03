<template>
  <div class="git-container">
    <el-card class="git-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon size="24px" color="#409EFF"><Link /></el-icon>
          <span class="header-title">解析Git仓库</span>
        </div>
      </template>
      
      <div class="git-content">
        <el-form :model="gitForm" :rules="gitRules" ref="gitFormRef" label-width="120px">
          <el-form-item label="仓库类型" prop="repoType">
            <el-radio-group v-model="gitForm.repoType">
              <el-radio label="github">GitHub</el-radio>
              <el-radio label="gitlab">GitLab</el-radio>
              <el-radio label="gitee">Gitee</el-radio>
              <el-radio label="custom">自定义</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="仓库地址" prop="repoUrl">
            <el-input 
              v-model="gitForm.repoUrl" 
              placeholder="请输入Git仓库地址，如：https://github.com/username/repo"
              clearable
            >
              <template #prepend>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item v-if="gitForm.repoType === 'custom'" label="认证方式" prop="authType">
            <el-radio-group v-model="gitForm.authType">
              <el-radio label="none">无需认证</el-radio>
              <el-radio label="token">访问令牌</el-radio>
              <el-radio label="ssh">SSH密钥</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item v-if="gitForm.authType === 'token'" label="访问令牌" prop="accessToken">
            <el-input 
              v-model="gitForm.accessToken" 
              placeholder="请输入访问令牌"
              type="password"
              show-password
              clearable
            />
          </el-form-item>
          
          <el-form-item v-if="gitForm.authType === 'ssh'" label="SSH私钥" prop="sshKey">
            <el-input 
              v-model="gitForm.sshKey" 
              type="textarea"
              :rows="6"
              placeholder="请输入SSH私钥内容"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="分支选择" prop="branch">
            <el-select v-model="gitForm.branch" placeholder="选择要解析的分支" clearable>
              <el-option label="main" value="main" />
              <el-option label="master" value="master" />
              <el-option label="develop" value="develop" />
              <el-option label="dev" value="dev" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="解析选项">
            <el-checkbox-group v-model="gitForm.parseOptions">
              <el-checkbox label="code">代码文件</el-checkbox>
              <el-checkbox label="docs">文档文件</el-checkbox>
              <el-checkbox label="readme">README文件</el-checkbox>
              <el-checkbox label="config">配置文件</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          
          <el-form-item label="文件过滤">
            <el-input 
              v-model="gitForm.fileFilter" 
              placeholder="输入文件扩展名过滤，如：.py,.js,.md,.txt (留空表示所有文件)"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="知识库名称" prop="knowledgeName">
            <el-input 
              v-model="gitForm.knowledgeName" 
              placeholder="请输入知识库名称"
              clearable
            />
          </el-form-item>
        </el-form>
        
        <div class="git-actions">
          <el-button @click="goBack" :icon="Back">返回</el-button>
          <el-button 
            type="primary" 
            @click="testConnection"
            :loading="isTesting"
            :icon="Connection"
          >
            测试连接
          </el-button>
          <el-button 
            type="success" 
            @click="startParse"
            :loading="isParsing"
            :disabled="!isConnectionValid"
            :icon="Promotion"
          >
            开始解析
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 连接测试结果 -->
    <el-dialog v-model="testResultVisible" title="连接测试结果" width="500px">
      <div class="test-result">
        <div v-if="testResult.success" class="success-result">
          <el-icon size="48px" color="#67C23A"><CircleCheckFilled /></el-icon>
          <h3>连接成功！</h3>
          <p>仓库信息：</p>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="仓库名称">{{ testResult.repoName }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ testResult.description }}</el-descriptions-item>
            <el-descriptions-item label="语言">{{ testResult.language }}</el-descriptions-item>
            <el-descriptions-item label="星标数">{{ testResult.stars }}</el-descriptions-item>
            <el-descriptions-item label="分支数">{{ testResult.branches }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-else class="error-result">
          <el-icon size="48px" color="#F56C6C"><CircleCloseFilled /></el-icon>
          <h3>连接失败</h3>
          <p>{{ testResult.error }}</p>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="testResultVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 解析进度 -->
    <el-dialog 
      v-model="parseProgressVisible" 
      title="解析进度" 
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="parse-progress">
        <el-steps :active="currentStep" align-center>
          <el-step title="克隆仓库" description="正在下载代码" />
          <el-step title="分析结构" description="扫描文件结构" />
          <el-step title="解析内容" description="提取文档信息" />
          <el-step title="构建索引" description="生成知识库" />
          <el-step title="完成" description="解析完成" />
        </el-steps>
        
        <div class="progress-details">
          <div class="current-task">
            <h4>当前任务：{{ currentTask }}</h4>
            <el-progress 
              :percentage="taskProgress" 
              :status="taskProgress === 100 ? 'success' : undefined"
            />
          </div>
          
          <div class="file-stats">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-number">{{ fileStats.total }}</div>
                  <div class="stat-label">总文件数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-number">{{ fileStats.processed }}</div>
                  <div class="stat-label">已处理</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-number">{{ fileStats.success }}</div>
                  <div class="stat-label">成功</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-number">{{ fileStats.failed }}</div>
                  <div class="stat-label">失败</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button 
            v-if="!isParsing" 
            type="primary" 
            @click="parseProgressVisible = false"
          >
            完成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Link, Back, Connection, Promotion, CircleCheckFilled, CircleCloseFilled 
} from '@element-plus/icons-vue'

const router = useRouter()
const gitFormRef = ref()

// 表单数据
const gitForm = reactive({
  repoType: 'github',
  repoUrl: '',
  authType: 'none',
  accessToken: '',
  sshKey: '',
  branch: 'main',
  parseOptions: ['code', 'docs', 'readme'],
  fileFilter: '',
  knowledgeName: ''
})

// 表单验证规则
const gitRules = {
  repoUrl: [
    { required: true, message: '请输入仓库地址', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  knowledgeName: [
    { required: true, message: '请输入知识库名称', trigger: 'blur' }
  ],
  accessToken: [
    { required: true, message: '请输入访问令牌', trigger: 'blur' }
  ],
  sshKey: [
    { required: true, message: '请输入SSH私钥', trigger: 'blur' }
  ]
}

// 状态管理
const isTesting = ref(false)
const isParsing = ref(false)
const isConnectionValid = ref(false)
const testResultVisible = ref(false)
const parseProgressVisible = ref(false)

// 测试结果
const testResult = reactive({
  success: false,
  repoName: '',
  description: '',
  language: '',
  stars: 0,
  branches: 0,
  error: ''
})

// 解析进度
const currentStep = ref(0)
const currentTask = ref('')
const taskProgress = ref(0)
const fileStats = reactive({
  total: 0,
  processed: 0,
  success: 0,
  failed: 0
})

// 测试连接
const testConnection = async () => {
  try {
    await gitFormRef.value.validate()
    
    isTesting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟成功结果
    testResult.success = true
    testResult.repoName = 'vue-project'
    testResult.description = 'A Vue.js project with Element Plus'
    testResult.language = 'JavaScript'
    testResult.stars = 128
    testResult.branches = 3
    testResult.error = ''
    
    isConnectionValid.value = true
    testResultVisible.value = true
    ElMessage.success('连接测试成功！')
    
  } catch (error) {
    if (error === 'validation failed') {
      ElMessage.error('请检查表单输入')
    } else {
      // 模拟失败结果
      testResult.success = false
      testResult.error = '无法连接到仓库，请检查地址和认证信息'
      testResultVisible.value = true
      ElMessage.error('连接测试失败')
    }
  } finally {
    isTesting.value = false
  }
}

// 开始解析
const startParse = async () => {
  try {
    await gitFormRef.value.validate()
    
    isParsing.value = true
    parseProgressVisible.value = true
    currentStep.value = 0
    taskProgress.value = 0
    
    // 重置文件统计
    fileStats.total = 156
    fileStats.processed = 0
    fileStats.success = 0
    fileStats.failed = 0
    
    // 模拟解析过程
    await simulateParseProcess()
    
    isParsing.value = false
    ElMessage.success('仓库解析完成！')
    
  } catch (error) {
    ElMessage.error('解析过程中出现错误')
    isParsing.value = false
    parseProgressVisible.value = false
  }
}

// 模拟解析过程
const simulateParseProcess = async () => {
  // 步骤1：克隆仓库
  currentStep.value = 0
  currentTask.value = '正在克隆仓库...'
  for (let i = 0; i <= 100; i += 10) {
    taskProgress.value = i
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // 步骤2：分析结构
  currentStep.value = 1
  currentTask.value = '正在分析文件结构...'
  taskProgress.value = 0
  for (let i = 0; i <= 100; i += 20) {
    taskProgress.value = i
    await new Promise(resolve => setTimeout(resolve, 150))
  }
  
  // 步骤3：解析内容
  currentStep.value = 2
  currentTask.value = '正在解析文件内容...'
  taskProgress.value = 0
  for (let i = 0; i <= 100; i += 5) {
    taskProgress.value = i
    fileStats.processed = Math.floor((i / 100) * fileStats.total)
    fileStats.success = Math.floor(fileStats.processed * 0.95)
    fileStats.failed = fileStats.processed - fileStats.success
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  // 步骤4：构建索引
  currentStep.value = 3
  currentTask.value = '正在构建知识库索引...'
  taskProgress.value = 0
  for (let i = 0; i <= 100; i += 15) {
    taskProgress.value = i
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // 步骤5：完成
  currentStep.value = 4
  currentTask.value = '解析完成！'
  taskProgress.value = 100
  fileStats.processed = fileStats.total
  fileStats.success = fileStats.total
  fileStats.failed = 0
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.git-container {
  min-height: 100vh;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.git-card {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.git-content {
  padding: 20px 0;
}

.git-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}

.test-result {
  text-align: center;
  padding: 20px 0;
}

.success-result h3 {
  color: #67C23A;
  margin: 16px 0;
}

.error-result h3 {
  color: #F56C6C;
  margin: 16px 0;
}

.parse-progress {
  padding: 20px 0;
}

.progress-details {
  margin-top: 30px;
}

.current-task {
  margin-bottom: 30px;
}

.current-task h4 {
  margin-bottom: 16px;
  color: #303133;
}

.file-stats {
  margin-top: 30px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.dialog-footer {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .git-container {
    padding: 20px;
  }
  
  .git-card {
    margin: 0;
  }
  
  .git-actions {
    flex-direction: column;
  }
  
  .git-actions .el-button {
    width: 100%;
  }
}
</style>

