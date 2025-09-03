<template>
  <div class="upload-container">
    <el-card class="upload-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon size="24px" color="#409EFF"><Upload /></el-icon>
          <span class="header-title">上传知识文件</span>
        </div>
      </template>
      
      <div class="upload-content">
        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          multiple
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
          accept=".pdf,.doc,.docx,.txt,.md,.html,.py,.js,.ts,.java,.cpp,.c,.h,.sql,.json,.xml,.csv"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 PDF、Word、TXT、Markdown、代码文件等格式，单个文件不超过 50MB
            </div>
          </template>
        </el-upload>

        <div v-if="fileList.length > 0" class="file-list">
          <h4>待上传文件列表：</h4>
          <el-table :data="fileList" style="width: 100%">
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="size" label="大小" width="120">
              <template #default="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeFile(scope.$index)"
                  :icon="Delete"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="upload-options">
          <el-form :model="uploadOptions" label-width="120px">
            <el-form-item label="知识库名称">
              <el-input 
                v-model="uploadOptions.knowledgeName" 
                placeholder="请输入知识库名称"
                clearable
              />
            </el-form-item>
            
            <el-form-item label="文件处理方式">
              <el-radio-group v-model="uploadOptions.processType">
                <el-radio label="chunk">分块处理（推荐）</el-radio>
                <el-radio label="whole">整体处理</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="语言检测">
              <el-switch v-model="uploadOptions.autoLanguage" />
              <span class="option-desc">自动检测文档语言</span>
            </el-form-item>
            
            <el-form-item label="元数据提取">
              <el-switch v-model="uploadOptions.extractMetadata" />
              <span class="option-desc">提取文档标题、作者等信息</span>
            </el-form-item>
          </el-form>
        </div>

        <div class="upload-actions">
          <el-button @click="goBack" :icon="Back">返回</el-button>
          <el-button 
            type="primary" 
            @click="startUpload" 
            :loading="isUploading"
            :disabled="fileList.length === 0"
            :icon="Promotion"
          >
            {{ isUploading ? '上传中...' : '开始上传' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 上传进度对话框 -->
    <el-dialog 
      v-model="progressVisible" 
      title="上传进度" 
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <div v-for="file in fileList" :key="file.uid" class="progress-item">
          <div class="progress-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="progress-text">{{ file.progress || 0 }}%</span>
          </div>
          <el-progress 
            :percentage="file.progress || 0" 
            :status="getProgressStatus(file.status)"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button 
            v-if="!isUploading" 
            type="primary" 
            @click="progressVisible = false"
          >
            完成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Upload, UploadFilled, Delete, Back, Promotion 
} from '@element-plus/icons-vue'

const router = useRouter()
const uploadRef = ref()
const fileList = ref([])
const isUploading = ref(false)
const progressVisible = ref(false)

const uploadOptions = reactive({
  knowledgeName: '',
  processType: 'chunk',
  autoLanguage: true,
  extractMetadata: true
})

const handleFileChange = (file, fileList) => {
  // 检查文件大小
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error(`文件 ${file.name} 超过 50MB 限制`)
    return false
  }
  
  // 检查文件类型
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/html',
    'text/x-python',
    'text/javascript',
    'text/typescript',
    'text/x-java-source',
    'text/x-c++src',
    'text/x-csrc',
    'text/x-chdr',
    'text/x-sql',
    'application/json',
    'text/xml',
    'text/csv'
  ]
  
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error(`不支持的文件类型: ${file.name}`)
    return false
  }
  
  // 设置文件状态
  file.status = 'pending'
  file.progress = 0
  
  return true
}

const handleFileRemove = (file, fileList) => {
  const index = fileList.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.splice(index, 1)
  }
}

const removeFile = (index) => {
  fileList.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getStatusType = (status) => {
  const statusMap = {
    pending: 'info',
    uploading: 'warning',
    success: 'success',
    error: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待上传',
    uploading: '上传中',
    success: '成功',
    error: '失败'
  }
  return statusMap[status] || '未知'
}

const getProgressStatus = (status) => {
  if (status === 'error') return 'exception'
  if (status === 'success') return 'success'
  return undefined
}

const startUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }
  
  if (!uploadOptions.knowledgeName.trim()) {
    ElMessage.warning('请输入知识库名称')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要上传 ${fileList.value.length} 个文件到知识库 "${uploadOptions.knowledgeName}" 吗？`,
      '确认上传',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    isUploading.value = true
    progressVisible.value = true
    
    // 模拟上传过程
    for (let i = 0; i < fileList.value.length; i++) {
      const file = fileList.value[i]
      file.status = 'uploading'
      
      // 模拟进度更新
      for (let progress = 0; progress <= 100; progress += 10) {
        file.progress = progress
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      file.status = 'success'
    }
    
    isUploading.value = false
    ElMessage.success('所有文件上传成功！')
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('上传过程中出现错误')
    }
    isUploading.value = false
    progressVisible.value = false
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.upload-container {
  min-height: 100vh;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-card {
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

.upload-content {
  padding: 20px 0;
}

.upload-area {
  margin-bottom: 30px;
}

.file-list {
  margin-bottom: 30px;
}

.file-list h4 {
  margin-bottom: 16px;
  color: #303133;
  font-weight: 500;
}

.upload-options {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.option-desc {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.upload-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.progress-content {
  max-height: 300px;
  overflow-y: auto;
}

.progress-item {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.file-name {
  font-size: 14px;
  color: #303133;
  flex: 1;
  margin-right: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-text {
  font-size: 14px;
  color: #409EFF;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

.dialog-footer {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-container {
    padding: 20px;
  }
  
  .upload-card {
    margin: 0;
  }
  
  .upload-actions {
    flex-direction: column;
  }
  
  .upload-actions .el-button {
    width: 100%;
  }
}
</style>

