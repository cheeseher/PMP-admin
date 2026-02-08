<template>
  <div class="page-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="ID：">
            <el-input v-model="filterForm.id" placeholder="请输入代付产品 ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="代付产品名称：">
            <el-input v-model="filterForm.productName" placeholder="请输入代付产品名称" style="width: 200px" clearable />
          </el-form-item>
          <el-form-item label="启用状态：">
            <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 150px">
              <el-option label="启用" value="ENABLED" />
              <el-option label="禁用" value="DISABLED" />
            </el-select>
          </el-form-item>
          <div class="filter-buttons">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="table-toolbar">
      <div class="left">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增代付产品</el-button>
        <el-button :icon="Check" plain @click="handleBatchEnable">产品一键开启</el-button>
        <el-button :icon="Close" plain @click="handleBatchDisable">产品一键关闭</el-button>
        <el-button :icon="Remove" plain @click="handleBatchOrderDisable">下单一键关闭</el-button>
        <el-button :icon="Delete" plain :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <div class="right">
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
        <el-tooltip content="刷新数据">
          <el-button :icon="Refresh" circle plain @click="fetchData" />
        </el-tooltip>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" fixed="left" />
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="productName" label="代付产品名称" min-width="150" />
      <el-table-column prop="productCode" label="代付产品编码" min-width="120" />
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="启用状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'ENABLED' ? 'success' : 'danger'">
            {{ scope.row.status === 'ENABLED' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right" align="center">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef" class="dialog-form">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入产品编码" />
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="ENABLED">启用</el-radio>
            <el-radio label="DISABLED">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Download, Refresh, Check, Close, Remove, Delete } from '@element-plus/icons-vue'
import { getPayoutProductList } from '@/data/payoutProductData.js'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选表单
const filterForm = reactive({
  id: '',
  productName: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = reactive({
  id: '',
  productName: '',
  productCode: '',
  status: 'ENABLED',
  remark: ''
})

const rules = {
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  productCode: [{ required: true, message: '请输入产品编码', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑代付产品' : '新增代付产品')

// 初始化数据
onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPayoutProductList({
      ...filterForm,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data
    pagination.total = res.total
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 筛选操作
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

const handleReset = () => {
  filterForm.id = ''
  filterForm.productName = ''
  filterForm.status = ''
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页操作
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}

// 弹窗操作
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除产品 "${row.productName}" 吗？`, '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

// 批量操作
const handleBatchEnable = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一个产品')
    return
  }
  ElMessageBox.confirm(`确定要开启选中的 ${selectedRows.value.length} 个产品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableData.value.forEach(item => {
      if (selectedRows.value.find(row => row.id === item.id)) {
        item.status = 'ENABLED'
      }
    })
    ElMessage.success('一键开启成功')
  })
}

const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一个产品')
    return
  }
  ElMessageBox.confirm(`确定要关闭选中的 ${selectedRows.value.length} 个产品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableData.value.forEach(item => {
      if (selectedRows.value.find(row => row.id === item.id)) {
        item.status = 'DISABLED'
      }
    })
    ElMessage.success('一键关闭成功')
  })
}

const handleBatchOrderDisable = () => {
  ElMessageBox.confirm('确定要将选中的所有产品一键关闭下单吗？', '确认关闭', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('下单一键关闭成功')
  })
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个记录吗？`, '批量删除', {
    type: 'danger'
  }).then(() => {
    ElMessage.success('批量删除成功')
  })
}

const resetForm = () => {
  Object.assign(form, {
    id: '',
    productName: '',
    productCode: '',
    status: 'ENABLED',
    remark: ''
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
    }
  })
}

const handleExport = () => {
  ElMessage.success('导出数据生成中...')
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-toolbar .left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.table-toolbar .right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-form {
  padding: 10px 20px;
}

:deep(.el-form-item) {
  margin-bottom: 18px; /* 弹窗内表单项保持间距 */
}

/* 覆盖筛选栏的 margin-bottom */
.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}
</style>