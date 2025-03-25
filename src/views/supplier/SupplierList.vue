<!-- 供应商管理/供应商列表 - 管理供应商列表信息 -->
<template>
  <div class="supplier-list-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>筛选查询</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </template>
      <el-form :model="searchForm" label-width="100px" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="ID">
              <el-input v-model="searchForm.id" placeholder="请输入ID" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="上游名称">
              <el-input v-model="searchForm.supplierName" placeholder="请输入上游名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="上游编码">
              <el-input v-model="searchForm.supplierCode" placeholder="请输入上游编码" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 168px;">
                <el-option label="全部" value="" />
                <el-option label="启用" value="enabled" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>数据列表</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增
            </el-button>
            <el-button type="success" :disabled="selectedRows.length === 0" @click="handleBatchEnable">
              <el-icon><Check /></el-icon>批量启用
            </el-button>
            <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDisable">
              <el-icon><Close /></el-icon>批量禁用
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 表格 -->
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        style="width: 100%"
        border
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="上游" prop="supplier" min-width="120" />
        <el-table-column label="编码" prop="code" width="120" />
        <el-table-column label="商户号" prop="merchantNo" width="180" />
        <el-table-column label="余额" prop="amount" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">{{ formatAmount(scope.row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="冻结" prop="freeze" width="120" align="right">
          <template #default="scope">
            <span class="freeze-text">{{ formatAmount(scope.row.freeze || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提醒阈值" prop="alertThreshold" width="120" align="right">
          <template #default="scope">
            <span class="threshold-text">{{ formatAmount(scope.row.alertThreshold || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="150">
          <template #default="scope">
            <el-tooltip :content="scope.row.remark" placement="top" :disabled="!scope.row.remark">
              <span>{{ scope.row.remark || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="是否启用" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.enabled ? 'success' : 'danger'"
              effect="light"
              size="small"
            >
              {{ scope.row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
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
            <el-button
              type="primary"
              link
              size="small"
              @click="handleDetail(scope.row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加上游管理' : '编辑上游管理'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="supplierForm"
        :rules="rules"
        label-width="120px"
        style="max-width: 500px; margin: 0 auto;"
      >
        <el-form-item label="上游通道名称" prop="supplier">
          <el-input v-model="supplierForm.supplier" placeholder="请输入上游通道名称" />
        </el-form-item>
        <el-form-item label="上游通道编码" prop="code">
          <el-input v-model="supplierForm.code" placeholder="请输入上游通道编码" />
        </el-form-item>
        <el-form-item label="商户号" prop="merchantNo">
          <el-input v-model="supplierForm.merchantNo" placeholder="请输入商户号" />
        </el-form-item>
        <el-form-item label="余额">
          <el-input-number v-model="supplierForm.amount" :precision="2" :min="0" :controls="false" style="width: 168px" />
        </el-form-item>
        <el-form-item label="冻结">
          <el-input-number v-model="supplierForm.freeze" :precision="2" :min="0" :controls="false" style="width: 168px" />
        </el-form-item>
        <el-form-item label="提醒阈值">
          <el-input-number v-model="supplierForm.alertThreshold" :precision="2" :min="0" :controls="false" style="width: 168px" />
        </el-form-item>
        <el-form-item label="API密钥">
          <el-input v-model="supplierForm.apiKey" placeholder="请输入API密钥" />
        </el-form-item>
        <el-form-item label="应用APPID">
          <el-input v-model="supplierForm.appId" placeholder="请输入应用APPID" />
        </el-form-item>
        <el-form-item label="安全密钥">
          <el-input v-model="supplierForm.securityKey" placeholder="请输入安全密钥" />
        </el-form-item>
        <el-form-item label="网关地址" prop="gatewayUrl">
          <el-input v-model="supplierForm.gatewayUrl" placeholder="请输入网关地址" />
        </el-form-item>
        <el-form-item label="商户私钥">
          <el-input v-model="supplierForm.privateKey" placeholder="请输入商户私钥" />
        </el-form-item>
        <el-form-item label="平台公钥">
          <el-input v-model="supplierForm.publicKey" placeholder="请输入平台公钥" />
        </el-form-item>
        <el-form-item label="页面跳转网址">
          <el-input v-model="supplierForm.returnUrl" placeholder="请输入页面跳转网址" />
        </el-form-item>
        <el-form-item label="异步通知网址" prop="notifyUrl">
          <el-input v-model="supplierForm.notifyUrl" placeholder="请输入异步通知网址" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="supplierForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="回调白名单">
          <el-input v-model="supplierForm.whiteList" placeholder="请输入回调白名单" />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select v-model="supplierForm.enabled" placeholder="请选择状态" style="width: 168px">
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查看详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="供应商详情"
      direction="rtl"
      size="400px"
    >
      <div class="detail-container" v-if="currentSupplier">
        <div class="detail-item">
          <span class="detail-label">ID：</span>
          <span class="detail-value">{{ currentSupplier.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">上游通道名称：</span>
          <span class="detail-value">{{ currentSupplier.supplier }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">上游通道编码：</span>
          <span class="detail-value">{{ currentSupplier.code }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">商户号：</span>
          <span class="detail-value">{{ currentSupplier.merchantNo }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">余额：</span>
          <span class="detail-value">{{ formatAmount(currentSupplier.amount) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">冻结：</span>
          <span class="detail-value">{{ formatAmount(currentSupplier.freeze || 0) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">提醒阈值：</span>
          <span class="detail-value">{{ formatAmount(currentSupplier.alertThreshold || 5000) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">API密钥：</span>
          <span class="detail-value">{{ currentSupplier.apiKey || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">应用APPID：</span>
          <span class="detail-value">{{ currentSupplier.appId || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">网关地址：</span>
          <span class="detail-value">{{ currentSupplier.gatewayUrl || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">异步通知网址：</span>
          <span class="detail-value">{{ currentSupplier.notifyUrl || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">页面跳转网址：</span>
          <span class="detail-value">{{ currentSupplier.returnUrl || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">回调白名单：</span>
          <span class="detail-value">{{ currentSupplier.whiteList || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">备注：</span>
          <span class="detail-value">{{ currentSupplier.remark || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态：</span>
          <el-tag
            :type="currentSupplier.enabled ? 'success' : 'danger'"
            effect="light"
          >
            {{ currentSupplier.enabled ? '启用' : '禁用' }}
          </el-tag>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { supplierList } from '@/data/supplierData'

// 搜索表单
const searchForm = reactive({
  id: '',
  supplierName: '',
  supplierCode: '',
  status: ''
})

// 表格数据
const tableData = ref([])
const tableLoading = ref(false)

// 选中的行
const selectedRows = ref([])
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const formRef = ref(null)
const supplierForm = reactive({
  id: '',
  supplier: '',
  code: '',
  merchantNo: '',
  apiKey: '',
  appId: '',
  securityKey: '',
  gatewayUrl: '',
  privateKey: '',
  publicKey: '',
  returnUrl: '',
  notifyUrl: '',
  whiteList: '',
  remark: '',
  enabled: true,
  amount: 0,
  freeze: 0,
  alertThreshold: 5000,
  flow: 0
})
const rules = {
  supplier: [{ required: true, message: '请输入上游通道名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入上游通道编码', trigger: 'blur' }],
  merchantNo: [{ required: true, message: '请输入商户号', trigger: 'blur' }],
  gatewayUrl: [{ required: true, message: '请输入网关地址', trigger: 'blur' }],
  notifyUrl: [{ required: true, message: '请输入异步通知网址', trigger: 'blur' }]
}

// 详情抽屉相关
const drawerVisible = ref(false)
const currentSupplier = ref(null)

// 格式化金额
const formatAmount = (amount) => {
  return amount.toLocaleString('zh-CN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

// 搜索方法
const handleSearch = () => {
  tableLoading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    let filteredData = [...supplierList]
    
    if (searchForm.id) {
      filteredData = filteredData.filter(item => 
        item.id.toString().includes(searchForm.id))
    }
    
    if (searchForm.supplierName) {
      filteredData = filteredData.filter(item => 
        item.supplier.includes(searchForm.supplierName))
    }
    
    if (searchForm.supplierCode) {
      filteredData = filteredData.filter(item => 
        item.code.toLowerCase().includes(searchForm.supplierCode.toLowerCase()))
    }
    
    if (searchForm.status) {
      const isEnabled = searchForm.status === 'enabled'
      filteredData = filteredData.filter(item => item.enabled === isEnabled)
    }
    
    tableData.value = filteredData
    total.value = filteredData.length
    
    tableLoading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置搜索条件
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
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

// 切换状态
const handleToggleStatus = (row) => {
  const newStatus = !row.enabled
  const action = newStatus ? '启用' : '禁用'
  
  ElMessageBox.confirm(
    `确认${action}供应商 "${row.supplier}"?`,
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

// 添加供应商
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑供应商
const handleEdit = (row) => {
  dialogType.value = 'edit'
  resetForm()
  
  // 填充表单数据
  Object.keys(supplierForm).forEach(key => {
    if (key in row) {
      supplierForm[key] = row[key]
    }
  })
  
  dialogVisible.value = true
}

// 查看详情
const handleDetail = (row) => {
  currentSupplier.value = { ...row }
  drawerVisible.value = true
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  Object.assign(supplierForm, {
    id: '',
    supplier: '',
    code: '',
    merchantNo: '',
    apiKey: '',
    appId: '',
    securityKey: '',
    gatewayUrl: '',
    privateKey: '',
    publicKey: '',
    returnUrl: '',
    notifyUrl: '',
    whiteList: '',
    remark: '',
    enabled: true,
    amount: 0,
    freeze: 0,
    alertThreshold: 5000,
    flow: 0
  })
}

// 提交表单
const handleSubmitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加操作
        const newId = Math.max(...tableData.value.map(item => item.id), 0) + 1
        const newSupplier = {
          ...supplierForm,
          id: newId,
          amount: 0,
          flow: 0
        }
        tableData.value.push(newSupplier)
        ElMessage.success('添加成功')
      } else {
        // 编辑操作
        const index = tableData.value.findIndex(item => item.id === supplierForm.id)
        if (index !== -1) {
          // 保留原有金额和流转数据
          const { amount, flow } = tableData.value[index]
          tableData.value[index] = {
            ...supplierForm,
            amount,
            flow
          }
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
  handleSearch()
}

// 页码改变
const handleCurrentChange = (page) => {
  currentPage.value = page
  handleSearch()
}

// 页面加载时获取数据
onMounted(() => {
  // 模拟从服务器获取数据
  tableLoading.value = true
  setTimeout(() => {
    tableData.value = supplierList
    total.value = supplierList.length
    tableLoading.value = false
  }, 500)
})
</script>

<style scoped>
.supplier-list-container {
  padding: 20px;
}

.search-card, .table-card {
  margin-bottom: 20px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-top: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.amount-text, .flow-text {
  font-family: Arial, sans-serif;
  color: #606266;
}

.detail-container {
  padding: 20px;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
}

.detail-label {
  width: 100px;
  color: #909399;
}

.detail-value {
  color: #303133;
  flex: 1;
}
</style> 