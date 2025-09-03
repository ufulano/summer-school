<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <span>AI代理任务调度</span>
        <el-button type="primary" size="small" @click="openCreate">
          <el-icon><Plus /></el-icon>
          <span class="btn-text">新增任务调度</span>
        </el-button>
      </div>
    </template>

    <div class="toolbar">
      <el-input
        v-model="searchForm.taskName"
        placeholder="任务名称"
        clearable
        class="search-input"
        @keyup.enter.native="handleSearch"
      />
      <el-button @click="handleSearch">搜索</el-button>
    </div>

    <div v-if="loadError" class="error-empty">
      <el-empty description="加载任务调度列表失败">
        <el-button type="primary" @click="loadList">重试</el-button>
      </el-empty>
    </div>

    <el-table v-else :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="taskName" label="任务名称" min-width="150" />
      <el-table-column prop="agentId" label="智能体ID" width="120" />
      <el-table-column prop="description" label="描述" min-width="200">
        <template #default="scope">{{ scope.row.description || '-' }}</template>
      </el-table-column>
      <el-table-column prop="taskParam" label="任务参数" min-width="200">
        <template #default="scope">{{ scope.row.taskParam || '-' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.updateTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-space wrap>
            <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(scope.row)">删除</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination" v-if="!loadError">
      <el-pagination
        background
        layout="prev, pager, next, jumper, ->, total"
        :total="total"
        :page-size="pageSize"
        :current-page="pageNum"
        @current-change="handlePageChange"
      />
    </div>
  </el-card>

  <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增任务调度' : '编辑任务调度'" width="620px">
    <el-form :model="form" label-width="120px">
      <el-form-item label="任务名称" required>
        <el-input v-model="form.taskName" />
      </el-form-item>
      <el-form-item label="智能体ID" required>
        <el-input v-model.number="form.agentId" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input type="textarea" v-model="form.description" :rows="3" />
      </el-form-item>
      <el-form-item label="任务参数">
        <el-input type="textarea" v-model="form.taskParam" :rows="3" placeholder="请输入任务参数" />
      </el-form-item>
      <el-form-item label="Cron表达式">
        <el-input v-model="form.cronExpression" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" style="width: 160px">
          <el-option :value="1" label="启用" />
          <el-option :value="0" label="禁用" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { api } from '@/utils/api'

const loading = ref(false)
const loadError = ref(false)
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({ taskName: '' })

const dialogVisible = ref(false)
const dialogMode = ref('create')
const saving = ref(false)
const form = reactive({
  id: undefined,
  taskName: '',
  agentId: undefined,
  description: '',
  taskParam: '',
  cronExpression: '',
  status: 1
})

const formatDate = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return '-'
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

const normalizeListResponse = (res) => {
  const data = res?.data ?? res
  if (Array.isArray(data)) {
    if (data[0]) total.value = Number(data[0].total || 0)
    return data
  }
  if (data && Array.isArray(data.list)) {
    total.value = Number(data.total || 0)
    return data.list
  }
  total.value = Number(data?.total || 0)
  return data?.list || []
}

const loadList = async () => {
  loading.value = true
  loadError.value = false
  try {
    const res = await api.post('/ai/admin/agent/task/queryTaskScheduleList', {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      taskName: searchForm.taskName || undefined
    })
    const list = normalizeListResponse(res)
    tableData.value = list
  } catch (e) {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageNum.value = 1
  loadList()
}

const handlePageChange = (p) => {
  pageNum.value = p
  loadList()
}

const resetForm = () => {
  form.id = undefined
  form.taskName = ''
  form.agentId = undefined
  form.description = ''
  form.taskParam = ''
  form.cronExpression = ''
  form.status = 1
}

const openCreate = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const openEdit = async (row) => {
  dialogMode.value = 'edit'
  try {
    const res = await api.get('/ai/admin/agent/task/queryTaskScheduleById', { params: { id: row.id } })
    const detail = res?.data ?? res
    form.id = detail.id
    form.taskName = detail.taskName
    form.agentId = detail.agentId
    form.description = detail.description || ''
    form.taskParam = detail.taskParam || ''
    form.cronExpression = detail.cronExpression || ''
    form.status = detail.status ?? 1
    dialogVisible.value = true
  } catch (e) {
    ElMessage.error('获取任务调度详情失败')
  }
}

const save = async () => {
  if (!form.taskName) return ElMessage.warning('请输入任务名称')
  if (!form.agentId) return ElMessage.warning('请输入智能体ID')
  saving.value = true
  try {
    const payload = {
      id: form.id,
      taskName: form.taskName,
      agentId: form.agentId,
      description: form.description,
      taskParam: form.taskParam,
      cronExpression: form.cronExpression,
      status: form.status
    }
    if (dialogMode.value === 'edit' && form.id) {
      const res = await api.post('/ai/admin/agent/task/updateTaskSchedule', payload)
      if (res?.data === false) throw new Error('更新失败')
      ElMessage.success('更新成功')
    } else {
      const res = await api.post('/ai/admin/agent/task/addTaskSchedule', payload)
      if (res?.data === false) throw new Error('新增失败')
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadList()
  } catch (e) {
    ElMessage.error(dialogMode.value === 'edit' ? '更新失败' : '新增失败')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务调度吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await api.get('/ai/admin/agent/task/deleteTaskSchedule', { params: { id: row.id } })
    if (res?.data === false) throw new Error('删除失败')
    ElMessage.success('删除成功')
    loadList()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.btn-text { margin-left: 6px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.search-input { max-width: 320px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 12px; }
.error-empty { padding: 24px 0; }
</style>
