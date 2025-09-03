<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <span>AI智能体管理</span>
        <el-button type="primary" size="small" @click="openCreate">
          <el-icon><Plus /></el-icon>
          <span class="btn-text">新增智能体</span>
        </el-button>
      </div>
    </template>

    <div class="toolbar">
      <el-input
        v-model="searchForm.agentName"
        placeholder="智能体名称"
        clearable
        class="search-input"
        @keyup.enter.native="handleSearch"
      />
      <el-button @click="handleSearch">搜索</el-button>
    </div>

    <div v-if="loadError" class="error-empty">
      <el-empty description="加载智能体列表失败">
        <el-button type="primary" @click="loadList">重试</el-button>
      </el-empty>
    </div>

    <el-table v-else :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="agentName" label="智能体名称" min-width="160" />
      <el-table-column prop="description" label="描述" min-width="200">
        <template #default="scope">{{ scope.row.description || '-' }}</template>
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
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="scope">
          <el-space wrap>
            <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(scope.row)">删除</el-button>
            <el-button size="small" type="info" @click="preheat(scope.row)">预热</el-button>
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

  <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增智能体' : '编辑智能体'" width="520px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="智能体名称" required>
        <el-input v-model="form.agentName" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input type="textarea" v-model="form.description" :rows="3" />
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
import { api, ENDPOINTS, getUrl } from '@/utils/api'

const loading = ref(false)
const loadError = ref(false)
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  agentName: ''
})

const dialogVisible = ref(false)
const dialogMode = ref('create') // 'create' | 'edit'
const saving = ref(false)
const form = reactive({
  id: undefined,
  agentName: '',
  description: '',
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
    // 旧站点：分页字段混在第一条
    if (data[0]) {
      total.value = Number(data[0].total || 0)
    }
    return data
  }
  // 常见格式：{ list, total }
  if (data && Array.isArray(data.list)) {
    total.value = Number(data.total || 0)
    return data.list
  }
  // 兜底
  total.value = Number(data?.total || 0)
  return data?.list || []
}

const loadList = async () => {
  loading.value = true
  loadError.value = false
  try {
    const res = await api.post(ENDPOINTS.AGENT.LIST, {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      agentName: searchForm.agentName || undefined
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
  form.agentName = ''
  form.description = ''
  form.status = 1
}

const openCreate = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const fetchDetail = async (id) => {
  // 优先使用配置的 DETAIL，如失败可降级尝试旧路径
  try {
    const res = await api.get(`${ENDPOINTS.AGENT.DETAIL}`, { params: { id } })
    return res?.data ?? res
  } catch (e) {
    try {
      const res = await api.get(`/ai/admin/agent/queryAiAgentById`, { params: { id } })
      return res?.data ?? res
    } catch (e2) {
      throw e2
    }
  }
}

const openEdit = async (row) => {
  dialogMode.value = 'edit'
  try {
    const detail = await fetchDetail(row.id)
    form.id = detail.id
    form.agentName = detail.agentName
    form.description = detail.description || ''
    form.status = detail.status ?? 1
    dialogVisible.value = true
  } catch (e) {
    ElMessage.error('获取智能体详情失败')
  }
}

const save = async () => {
  if (!form.agentName) {
    ElMessage.warning('请输入智能体名称')
    return
  }
  saving.value = true
  try {
    if (dialogMode.value === 'edit' && form.id) {
      const payload = { id: form.id, agentName: form.agentName, description: form.description, status: form.status }
      const res = await api.post(ENDPOINTS.AGENT.UPDATE, payload)
      if (res?.data === false) throw new Error('更新失败')
      ElMessage.success('更新成功')
    } else {
      const payload = { agentName: form.agentName, description: form.description, status: form.status }
      const res = await api.post(ENDPOINTS.AGENT.ADD, payload)
      if (res?.data === false) throw new Error('添加失败')
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadList()
  } catch (e) {
    ElMessage.error(dialogMode.value === 'edit' ? '更新智能体失败' : '新增智能体失败')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除智能体 "${row.agentName}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await api.get(ENDPOINTS.AGENT.DELETE, { params: { id: row.id } })
    if (res?.data === false) throw new Error('删除失败')
    ElMessage.success('删除成功')
    loadList()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除智能体失败')
    }
  }
}

const preheat = async (row) => {
  try {
    const res = await api.get(getUrl('/ai/agent/preheat'), { params: { aiAgentId: row.id } })
    const data = res?.data ?? res
    if (data && (data.code === '0000' || data.success)) {
      ElMessage.success('预热成功')
    } else {
      ElMessage.warning(`预热失败：${data?.info || '未知错误'}`)
    }
  } catch (e) {
    ElMessage.error('预热失败：网络或服务器异常')
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
.btn-text {
  margin-left: 6px;
}
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.search-input {
  max-width: 320px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.error-empty {
  padding: 24px 0;
}
</style>
