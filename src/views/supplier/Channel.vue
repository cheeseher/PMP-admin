<!-- 供应商管理/供应商通道列表 - 管理供应商通道信息 -->
<template>
  <div class="supplier-channel-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="ID：">
            <el-input v-model="searchForm.id" placeholder="请输入ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="通道名称：">
            <el-input v-model="searchForm.channelName" placeholder="请输入通道名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="通道编码：">
            <el-input v-model="searchForm.channelCode" placeholder="请输入通道编码" style="width: 220px" clearable />
          </el-form-item>
        </div>
        
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">批量添加</el-button>
          <el-button type="success" :icon="Check" :disabled="selectedRows.length === 0" @click="handleBatchEnable">批量启用</el-button>
          <el-button type="danger" :icon="Close" :disabled="selectedRows.length === 0" @click="handleBatchDisable">批量禁用</el-button>
        </div>
        <div class="right">
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="fetchData" />
          </el-tooltip>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" prop="id" width="60" align="center" />
        <el-table-column label="通道名称" prop="channelName" min-width="120" />
        <el-table-column label="通道编码" prop="channelCode" width="100" align="center" />
        <el-table-column label="通道费率" width="90" align="right">
          <template #default="scope">
            <span class="rate-cell">{{ scope.row.rate.toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="上游通道名称" prop="supplier" min-width="120" />
        <el-table-column label="上游通道编码" prop="supplierCode" width="120" align="center" />
        <el-table-column label="支付类型" prop="payType" width="100" align="center" />
        <el-table-column label="分组" prop="category" width="100" align="center" />
        <el-table-column label="是否启用" width="80" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.enabled ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.enabled ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加通道' : '编辑通道'"
      v-model="dialogVisible"
      width="550px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="channelForm"
        :rules="rules"
        label-width="120px"
        class="channel-form"
      >
        <el-form-item label="通道名称" prop="channelName">
          <el-input v-model="channelForm.channelName" placeholder="请输入通道名称" />
        </el-form-item>
        <el-form-item label="通道编码" prop="channelCode">
          <el-input v-model="channelForm.channelCode" placeholder="请输入通道编码" />
        </el-form-item>
        <el-form-item label="通道费率" prop="rate">
          <el-input-number 
            v-model="channelForm.rate" 
            :precision="2" 
            :step="0.1" 
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="上游通道名称" prop="supplier">
          <el-select v-model="channelForm.supplier" placeholder="请选择上游通道" clearable style="width: 100%">
            <el-option
              v-for="item in supplierOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上游通道编码" prop="supplierCode">
          <el-input v-model="channelForm.supplierCode" placeholder="请输入上游通道编码" disabled />
        </el-form-item>
        <el-form-item label="支付类型" prop="payType">
          <el-select v-model="channelForm.payType" placeholder="请选择支付类型" clearable style="width: 100%">
            <el-option
              v-for="item in payTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分组" prop="category">
          <el-select v-model="channelForm.category" placeholder="请选择分组" clearable style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-switch
            v-model="channelForm.enabled"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Search, Refresh, Plus, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { channelList, payTypeOptions, categoryOptions } from '@/data/channelData'
import { supplierList } from '@/data/supplierData'

// 搜索表单
const searchForm = reactive({
  id: '',
  channelName: '',
  channelCode: ''
})

// 表格数据相关
const tableData = ref([])
const tableLoading = ref(false)
const selectedRows = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const formRef = ref(null)
const channelForm = reactive({
  id: '',
  channelName: '',
  channelCode: '',
  rate: 6.00,
  supplier: '',
  supplierCode: '',
  payType: '',
  category: '',
  enabled: true
})

// 表单验证规则
const rules = {
  channelName: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
  channelCode: [{ required: true, message: '请输入通道编码', trigger: 'blur' }],
  rate: [{ required: true, message: '请输入通道费率', trigger: 'blur' }],
  supplier: [{ required: true, message: '请选择上游通道名称', trigger: 'change' }],
  payType: [{ required: true, message: '请选择支付类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择分组', trigger: 'change' }]
}

// 上游选项
const supplierOptions = computed(() => {
  return supplierList.map(item => ({
    label: item.supplier,
    value: item.supplier,
    code: item.code
  }))
})

// 监听上游变化，自动填充上游编码
watch(() => channelForm.supplier, (newVal) => {
  if (newVal) {
    const selectedSupplier = supplierOptions.value.find(item => item.value === newVal)
    channelForm.supplierCode = selectedSupplier ? selectedSupplier.code : ''
  } else {
    channelForm.supplierCode = ''
  }
})

// 获取数据
const fetchData = () => {
  tableLoading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    let filteredData = [...channelList]
    
    if (searchForm.id) {
      filteredData = filteredData.filter(item => 
        item.id.toString().includes(searchForm.id))
    }
    
    if (searchForm.channelName) {
      filteredData = filteredData.filter(item => 
        item.channelName.includes(searchForm.channelName))
    }
    
    if (searchForm.channelCode) {
      filteredData = filteredData.filter(item => 
        item.channelCode.includes(searchForm.channelCode))
    }
    
    tableData.value = filteredData
    total.value = filteredData.length
    
    tableLoading.value = false
  }, 300)
}

// 搜索方法
const handleSearch = () => {
  fetchData()
}

// 重置搜索条件
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  fetchData()
}

// 添加通道
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑通道
const handleEdit = (row) => {
  dialogType.value = 'edit'
  resetForm()
  
  // 填充表单数据
  Object.keys(channelForm).forEach(key => {
    if (key in row) {
      channelForm[key] = row[key]
    }
  })
  
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = (row) => {
  const newStatus = !row.enabled
  const action = newStatus ? '启用' : '禁用'
  
  ElMessageBox.confirm(
    `确认${action}通道 "${row.channelName}"?`,
    `${action}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟API调用
    row.enabled = newStatus
    ElMessage.success(`${action}成功`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 批量启用
const handleBatchEnable = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessageBox.confirm(
    `确认批量启用已选中的 ${selectedRows.value.length} 条记录?`,
    '批量启用',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟API调用
    const ids = selectedRows.value.map(item => item.id)
    tableData.value.forEach(item => {
      if (ids.includes(item.id)) {
        item.enabled = true
      }
    })
    ElMessage.success(`批量启用成功`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 批量禁用
const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessageBox.confirm(
    `确认批量禁用已选中的 ${selectedRows.value.length} 条记录?`,
    '批量禁用',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟API调用
    const ids = selectedRows.value.map(item => item.id)
    tableData.value.forEach(item => {
      if (ids.includes(item.id)) {
        item.enabled = false
      }
    })
    ElMessage.success(`批量禁用成功`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置为默认值
  Object.assign(channelForm, {
    id: '',
    channelName: '',
    channelCode: '',
    rate: 6.00,
    supplier: '',
    supplierCode: '',
    payType: '',
    category: '',
    enabled: true
  })
}

// 提交表单
const handleSubmitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加操作
        const newId = Math.max(...tableData.value.map(item => item.id), 0) + 1
        const newChannel = {
          ...channelForm,
          id: newId
        }
        tableData.value.push(newChannel)
        ElMessage.success('添加成功')
      } else {
        // 编辑操作
        const index = tableData.value.findIndex(item => item.id === channelForm.id)
        if (index !== -1) {
          tableData.value[index] = { ...channelForm }
          ElMessage.success('更新成功')
        }
      }
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

// 每页条数改变
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchData()
}

// 页码改变
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchData()
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.supplier-channel-container {
  padding: 16px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-direction: column;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filter-row .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-toolbar .left .el-button {
  margin-right: 8px;
}

.table-toolbar .right .el-button {
  margin-left: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.rate-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.channel-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}

:deep(.el-switch__label) {
  font-weight: 400;
}
</style> 