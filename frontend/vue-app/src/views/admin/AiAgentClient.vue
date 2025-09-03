<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <span>智能体客户端关联</span>
        <el-button type="primary" size="small" @click="openCreate">
          <el-icon><Plus /></el-icon>
          <span class="btn-text">新增关联</span>
        </el-button>
      </div>
    </template>

    <div class="toolbar">
      <el-select v-model="searchForm.type" style="width: 160px">
        <el-option label="全部" value="all" />
        <el-option label="按智能体ID" value="agent" />
        <el-option label="按客户端ID" value="client" />
      </el-select>
      <el-input v-model="searchForm.value" placeholder="请输入ID" clearable class="search-input" @keyup.enter.native="handleSearch" />
      <el-button @click="handleSearch">搜索</el-button>
    </div>

    <div v-if="loadError" class="error-empty">
      <el-empty description="加载关联列表失败">
        <el-button type="primary" @click="loadList">重试</el-button>
      </el-empty>
    </div>

    <el-table v-else :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="agentId" label="智能体ID" width="140" />
      <el-table-column prop="clientId" label="客户端ID" width="140" />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.createTime) }}</template>
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

    <div class="pagination" v-if="showPagination && !loadError">
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

  <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增智能体客户端关联' : '编辑智能体客户端关联'" width="520px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="智能体ID" required>
        <el-input v-model.number="form.agentId" />
      </el-form-item>
      <el-form-item label="客户端ID" required>
        <el-input v-model.number="form.clientId" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { api } from '@/utils/api'

const loading = ref(false)
const loadError = ref(false)
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({ type: 'all', value: '' })
const showPagination = computed(() => searchForm.type === 'all')

const dialogVisible = ref(false)
const dialogMode = ref('create')
const saving = ref(false)
const form = reactive({ id: undefined, agentId: undefined, clientId: undefined })

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

const loadAll = async () => {
  const res = await api.post('/ai/admin/agent/client/queryAgentClientList', {
    pageNum: pageNum.value,
    pageSize: pageSize.value
  })
  return normalizeListResponse(res)
}

const loadByAgentId = async (agentId) => {
  const res = await api.get('/ai/admin/agent/client/queryAgentClientByAgentId', { params: { agentId } })
  total.value = 0
  return (res?.data ?? res) || []
}

const loadByClientId = async (clientId) => {
  const res = await api.get('/ai/admin/agent/client/queryAgentClientByClientId', { params: { clientId } })
  total.value = 0
  return (res?.data ?? res) || []
}

const loadList = async () => {
  loading.value = true
  loadError.value = false
  try {
    let list = []
    if (searchForm.type === 'agent' && searchForm.value) {
      list = await loadByAgentId(searchForm.value)
    } else if (searchForm.type === 'client' && searchForm.value) {
      list = await loadByClientId(searchForm.value)
    } else {
      list = await loadAll()
    }
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
  form.agentId = undefined
  form.clientId = undefined
}

const openCreate = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const openEdit = async (row) => {
  dialogMode.value = 'edit'
  try {
    const res = await api.get('/ai/admin/agent/client/queryAgentClientById', { params: { id: row.id } })
    const detail = res?.data ?? res
    form.id = detail.id
    form.agentId = detail.agentId
    form.clientId = detail.clientId
    dialogVisible.value = true
  } catch (e) {
    ElMessage.error('获取关联详情失败')
  }
}

const save = async () => {
  if (!form.agentId) return ElMessage.warning('请输入智能体ID')
  if (!form.clientId) return ElMessage.warning('请输入客户端ID')
  saving.value = true
  try {
    if (dialogMode.value === 'edit' && form.id) {
      const res = await api.post('/ai/admin/agent/client/updateAgentClient', { id: form.id, agentId: form.agentId, clientId: form.clientId })
      if (res?.data === false) throw new Error('更新失败')
      ElMessage.success('更新成功')
    } else {
      const res = await api.post('/ai/admin/agent/client/addAgentClient', { agentId: form.agentId, clientId: form.clientId })
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
    await ElMessageBox.confirm('确定要删除这个智能体客户端关联吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await api.get('/ai/admin/agent/client/deleteAgentClient', { params: { id: row.id } })
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-text { margin-left: 6px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.search-input { max-width: 240px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 12px; }
.error-empty { padding: 24px 0; }

/* 统一色彩与交互增强（无标题底色） */
:deep(.el-button--primary) {
  background-image: linear-gradient(135deg, #409eff, #34d399);
  border: none;
}
:deep(.el-button--primary:hover),
:deep(.el-button--primary:focus) { filter: brightness(1.05); }
:deep(.el-input__wrapper.is-focus),
:deep(.is-focus .el-textarea__inner) { box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) inset; }
:deep(.el-tag--success) { background-color: #e8fff5; color: #0da36f; border-color: #c6f6e6; }
:deep(.el-tag--danger) { background-color: #ffecec; color: #d03050; border-color: #ffd0d5; }
:deep(.el-form-item__label) { color: #3c4a5b; }
</style>
