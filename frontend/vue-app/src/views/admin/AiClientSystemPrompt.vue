<template>
  <div class="page-wrapper">
    <el-card class="toolbar" shadow="never">
      <div class="toolbar-row">
        <el-input v-model="filters.promptName" placeholder="提示词名称" clearable style="max-width: 280px" @keyup.enter.native="fetchList" />
        <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
        <el-button type="success" :icon="Plus" @click="openForm()">新增提示词</el-button>
        <el-button :icon="Refresh" @click="resetAndFetch">重置</el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-empty v-if="error" description="加载失败">
        <el-button type="primary" @click="fetchList">重试</el-button>
      </el-empty>
      <el-table v-else v-loading="loading" :data="tableData" size="small" border style="width: 100%" empty-text="暂无数据">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="promptName" label="名称" min-width="160" />
        <el-table-column prop="promptContent" label="内容" min-width="260" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="openForm(row)">编辑</el-button>
            <el-button size="small" type="danger" text @click="confirmDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="!error && (pagination.pages > 1 || pagination.total > pageSize)">
        <el-pagination
          background
          layout="prev, pager, next, jumper, ->, total"
          :current-page="pageNum"
          :page-size="pageSize"
          :total="pagination.total"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="formVisible" :title="formTitle" width="700px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="提示词名称">
          <el-input v-model="form.promptName" />
        </el-form-item>
        <el-form-item label="提示词内容">
          <el-input v-model="form.promptContent" type="textarea" :rows="10" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 180px">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formVisible = false">取 消</el-button>
          <el-button type="primary" :loading="saving" @click="submit">保 存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { api, ENDPOINTS } from '@/utils/api'

const loading = ref(false)
const error = ref(false)
const tableData = ref([])

const pageNum = ref(1)
const pageSize = ref(10)
const pagination = reactive({ total: 0, pages: 0 })

const filters = reactive({ promptName: '' })

const formVisible = ref(false)
const formTitle = computed(() => (form.value.id ? '编辑系统提示词' : '新增系统提示词'))
const saving = ref(false)
const form = ref({ id: undefined, promptName: '', promptContent: '', status: 1 })

const onSearch = () => { pageNum.value = 1; fetchList() }
const resetAndFetch = () => { filters.promptName = ''; pageNum.value = 1; fetchList() }
const onPageChange = (p) => { pageNum.value = p; fetchList() }

const fetchList = async () => {
  loading.value = true
  error.value = false
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value, promptName: filters.promptName || undefined }
    const { data } = await api.post(ENDPOINTS.SYSTEM_PROMPT.LIST, params)
    const list = Array.isArray(data) ? data : []
    if (list[0]) { pagination.total = list[0].total || 0; pagination.pages = list[0].pages || 0 } else { pagination.total = 0; pagination.pages = 0 }
    tableData.value = list
  } catch (e) { error.value = true } finally { loading.value = false }
}

const openForm = async (row) => {
  if (row && row.id) {
    try { const { data } = await api.get(`${ENDPOINTS.SYSTEM_PROMPT.DETAIL}?id=${row.id}`); form.value = { id: data.id, promptName: data.promptName, promptContent: data.promptContent, status: data.status } }
    catch (e) { ElMessage.error('获取详情失败'); return }
  } else { form.value = { id: undefined, promptName: '', promptContent: '', status: 1 } }
  formVisible.value = true
}

const submit = async () => {
  if (!form.value.promptName) { ElMessage.warning('请输入提示词名称'); return }
  saving.value = true
  try {
    const payload = { promptName: form.value.promptName, promptContent: form.value.promptContent, status: form.value.status }
    if (form.value.id) { await api.post(ENDPOINTS.SYSTEM_PROMPT.UPDATE, { ...payload, id: form.value.id }); ElMessage.success('更新成功') }
    else { await api.post(ENDPOINTS.SYSTEM_PROMPT.ADD, payload); ElMessage.success('新增成功') }
    formVisible.value = false; fetchList()
  } catch (e) { ElMessage.error('保存失败') } finally { saving.value = false }
}

const confirmDelete = async (row) => {
  try { await ElMessageBox.confirm(`确定要删除 "${row.promptName}" 吗？`, '确认删除', { type: 'warning' }); await api.get(`${ENDPOINTS.SYSTEM_PROMPT.DELETE}?id=${row.id}`); ElMessage.success('删除成功'); fetchList() } catch (e) { }
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.page-wrapper { padding: 0; }
.toolbar { margin-bottom: 12px; }
.toolbar-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.table-card { min-height: 300px; }
.pagination { margin-top: 12px; display: flex; justify-content: flex-end; }

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
.table-card :deep(.el-card__body) { border-top: 3px solid #4e9cff22; }
</style>
