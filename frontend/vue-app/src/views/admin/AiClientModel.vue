<template>
  <div class="page-wrapper">
    <el-card class="toolbar" shadow="never">
      <div class="toolbar-row">
        <el-input v-model="filters.modelName" placeholder="模型名称" clearable style="max-width: 280px" @keyup.enter.native="fetchList" />
        <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
        <el-button type="success" :icon="Plus" @click="openForm()">新增模型</el-button>
        <el-button :icon="Refresh" @click="resetAndFetch">重置</el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-empty v-if="error" description="加载失败">
        <el-button type="primary" @click="fetchList">重试</el-button>
      </el-empty>
      <el-table v-else v-loading="loading" :data="tableData" size="small" border style="width: 100%" empty-text="暂无数据">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="modelName" label="模型名称" min-width="160" />
        <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column prop="updateTime" label="更新时间" min-width="180" />
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

    <el-dialog v-model="formVisible" :title="formTitle" width="560px" destroy-on-close :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="form.modelName" placeholder="请输入模型名称" clearable maxlength="60" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }" placeholder="用于说明该模型用途与特点" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
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

const filters = reactive({ modelName: '' })

const formVisible = ref(false)
const formTitle = computed(() => (form.value.id ? '编辑客户端模型' : '新增客户端模型'))
const saving = ref(false)
const form = ref({ id: undefined, modelName: '', description: '', status: 1 })
const formRef = ref()
const rules = reactive({
  modelName: [
    { required: true, message: '请输入模型名称', trigger: 'blur' },
    { min: 2, max: 60, message: '长度 2-60 个字符', trigger: 'blur' }
  ]
})

const onSearch = () => { pageNum.value = 1; fetchList() }
const resetAndFetch = () => { filters.modelName = ''; pageNum.value = 1; fetchList() }
const onPageChange = (p) => { pageNum.value = p; fetchList() }

const fetchList = async () => {
  loading.value = true
  error.value = false
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value, modelName: filters.modelName || undefined }
    const { data } = await api.post(ENDPOINTS.CLIENT_MODEL.LIST, params)
    const list = Array.isArray(data) ? data : []
    if (list[0]) { pagination.total = list[0].total || 0; pagination.pages = list[0].pages || 0 } else { pagination.total = 0; pagination.pages = 0 }
    tableData.value = list
  } catch (e) { error.value = true } finally { loading.value = false }
}

const openForm = async (row) => {
  if (row && row.id) {
    try {
      const { data } = await api.get(`${ENDPOINTS.CLIENT_MODEL.DETAIL}?id=${row.id}`)
      form.value = { id: data.id, modelName: data.modelName, description: data.description, status: data.status }
    } catch (e) { ElMessage.error('获取详情失败'); return }
  } else {
    form.value = { id: undefined, modelName: '', description: '', status: 1 }
  }
  formVisible.value = true
}

const submit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const payload = { modelName: form.value.modelName, description: form.value.description, status: form.value.status }
      if (form.value.id) { await api.post(ENDPOINTS.CLIENT_MODEL.UPDATE, { ...payload, id: form.value.id }); ElMessage.success('更新成功') }
      else { await api.post(ENDPOINTS.CLIENT_MODEL.ADD, payload); ElMessage.success('新增成功') }
      formVisible.value = false; fetchList()
    } catch (e) { ElMessage.error('保存失败') } finally { saving.value = false }
  })
}

const confirmDelete = async (row) => {
  try { await ElMessageBox.confirm(`确定要删除模型 "${row.modelName}" 吗？`, '确认删除', { type: 'warning' }); await api.get(`${ENDPOINTS.CLIENT_MODEL.DELETE}?id=${row.id}`); ElMessage.success('删除成功'); fetchList() } catch (e) { }
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.page-wrapper { padding: 0; }
.toolbar { margin-bottom: 12px; }
.toolbar-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.table-card { min-height: 300px; }
.pagination { margin-top: 12px; display: flex; justify-content: flex-end; }

/* 通用增强已抽离为全局样式，保留本页局部定制请写在此下 */
</style>

 
