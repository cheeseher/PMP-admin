<!-- 支付配置/支付产品管理 - 管理系统支持的支付产品 -->
<template>
  <div class="payment-product">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="title">支付产品管理</div>
      <div class="description">管理所有支付通道产品并配置费率等信息</div>
    </div>

    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="产品ID：">
            <el-input v-model="searchForm.id" placeholder="请输入产品ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="产品名称：">
            <el-input v-model="searchForm.productName" placeholder="请输入产品名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="产品编码：">
            <el-input v-model="searchForm.productCode" placeholder="请输入产品编码" style="width: 220px" clearable />
          </el-form-item>
        </div>
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button :icon="Delete" plain :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
        </div>
        <div class="right">
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="fetchData" />
          </el-tooltip>
        </div>
      </div>

      <el-table 
        :data="tableData" 
        border 
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productName" label="产品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="productCode" label="产品编码" min-width="120" show-overflow-tooltip />
        <el-table-column prop="payType" label="支付类型" width="120">
          <template #default="scope">
            <el-tag 
              :type="scope.row.payType === 'ALIPAY' ? 'primary' : 
                    scope.row.payType === 'WECHAT' ? 'success' : 'info'">
              {{ scope.row.payType === 'ALIPAY' ? '支付宝' : 
                 scope.row.payType === 'WECHAT' ? '微信支付' : 
                 scope.row.payType === 'UNIONPAY' ? '银联支付' : scope.row.payType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="feeRate" label="费率" width="100">
          <template #default="scope">
            <span class="fee-rate">{{ (scope.row.feeRate * 100).toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ONLINE' ? 'success' : 'danger'">
              {{ scope.row.status === 'ONLINE' ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              link 
              :type="scope.row.status === 'ONLINE' ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)">
              {{ scope.row.status === 'ONLINE' ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="formType === 'add' ? '新增支付产品' : '编辑支付产品'"
      v-model="formDialogVisible"
      width="600px"
      destroy-on-close
    >
      <el-form 
        :model="productForm" 
        :rules="formRules" 
        ref="productFormRef" 
        label-width="100px"
        class="product-form"
      >
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="productForm.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品编码" prop="productCode">
          <el-input v-model="productForm.productCode" placeholder="请输入产品编码" />
        </el-form-item>
        <el-form-item label="支付类型" prop="payType">
          <el-select v-model="productForm.payType" placeholder="请选择支付类型" style="width: 100%">
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="微信支付" value="WECHAT" />
            <el-option label="银联支付" value="UNIONPAY" />
          </el-select>
        </el-form-item>
        <el-form-item label="费率" prop="feeRate">
          <el-input-number 
            v-model="productForm.feeRate" 
            :precision="4" 
            :step="0.001" 
            :min="0" 
            :max="1"
            style="width: 100%" />
          <div class="form-tip">费率为百分比的小数形式，如0.25%应填写0.0025</div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="productForm.status">
            <el-radio label="ONLINE">启用</el-radio>
            <el-radio label="OFFLINE">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="productForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleFormSubmit" 
            :loading="submitLoading">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Delete, Plus, Edit, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCleanup } from '@/utils/cleanupUtils'

const searchForm = reactive({
  id: '',
  productName: '',
  productCode: ''
})

const tableData = ref([
  {
    id: 1,
    productName: '演示产品',
    productCode: '8888',
    payType: 'ALIPAY',
    feeRate: 0.0025,
    status: 'ONLINE',
    remark: '这是演示产品的备注说明'
  },
  {
    id: 2,
    productName: '微信支付产品',
    productCode: 'WECHAT_PAY',
    payType: 'WECHAT',
    feeRate: 0.0030,
    status: 'ONLINE',
    remark: '微信支付通道产品'
  },
  {
    id: 3,
    productName: '银联支付产品',
    productCode: 'UNION_PAY',
    payType: 'UNIONPAY',
    feeRate: 0.0020,
    status: 'OFFLINE',
    remark: '银联支付通道产品，暂时下线维护'
  }
])

const selectedRows = ref([])
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const loading = ref(false)

const formDialogVisible = ref(false)
const formType = ref('add')
const productFormRef = ref(null)
const productForm = reactive({
  productName: '',
  productCode: '',
  payType: '',
  feeRate: 0,
  status: 'ONLINE',
  remark: ''
})

const submitLoading = ref(false)

const formRules = {
  productName: [
    { required: true, message: '请输入支付产品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  productCode: [
    { required: true, message: '请输入支付产品编码', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ]
}

const handleSearch = () => {
  loading.value = true
  
  setTimeout(() => {
    let filteredData = [...tableData.value]
    
    if (searchForm.id) {
      filteredData = filteredData.filter(item => 
        item.id.toString().includes(searchForm.id))
    }
    
    if (searchForm.productName) {
      filteredData = filteredData.filter(item => 
        item.productName.toLowerCase().includes(searchForm.productName.toLowerCase()))
    }
    
    if (searchForm.productCode) {
      filteredData = filteredData.filter(item => 
        item.productCode.toLowerCase().includes(searchForm.productCode.toLowerCase()))
    }
    
    tableData.value = filteredData
    loading.value = false
  }, 500)
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

const handleAdd = () => {
  formType.value = 'add'
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  
  productForm.productName = ''
  productForm.productCode = ''
  productForm.remark = ''
  productForm.status = 'ONLINE'
  
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  formType.value = 'edit'
  Object.keys(productForm).forEach(key => {
    productForm[key] = row[key] || ''
  })
  formDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认要删除产品"${row.productName}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现删除逻辑
    loading.value = true
    safeTimeout(() => {
      loading.value = false
      ElMessage.success('删除成功')
    }, 500)
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的产品')
    return
  }
  
  ElMessageBox.confirm(
    `确认要删除选中的${selectedRows.value.length}个产品吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现批量删除逻辑
    loading.value = true
    safeTimeout(() => {
      loading.value = false
      ElMessage.success('批量删除成功')
    }, 500)
  }).catch(() => {})
}

const handleBatchApprove = () => {
  // TODO: 实现产品一键开启逻辑
  loading.value = true
  safeTimeout(() => {
    loading.value = false
    ElMessage.success('产品一键开启成功')
  }, 500)
}

const handleBatchReject = () => {
  // TODO: 实现产品一键关闭逻辑
  loading.value = true
  safeTimeout(() => {
    loading.value = false
    ElMessage.success('产品一键关闭成功')
  }, 500)
}

const handleBatchRemove = () => {
  // TODO: 实现下架一键关闭逻辑
  loading.value = true
  safeTimeout(() => {
    loading.value = false
    ElMessage.success('下架一键关闭成功')
  }, 500)
}

const handleFormSubmit = () => {
  if (!productFormRef.value) return
  
  productFormRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      // TODO: 实现表单提交逻辑
      safeTimeout(() => {
        submitLoading.value = false
        ElMessage.success(formType.value === 'add' ? '添加成功' : '修改成功')
        formDialogVisible.value = false
        fetchData()
      }, 800)
    } else {
      return false
    }
  })
}

const handleToggleStatus = (row) => {
  const action = row.status === 'ONLINE' ? '禁用' : '启用'
  ElMessageBox.confirm(
    `确认要${action}该产品吗？`,
    `${action}确认`,
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现状态切换逻辑
    loading.value = true
    safeTimeout(() => {
      row.status = row.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE'
      loading.value = false
      ElMessage.success(`${action}成功`)
    }, 500)
  }).catch(() => {})
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 获取安全定时器
const { safeTimeout } = useCleanup()

// 初始化获取数据
onMounted(() => {
  fetchData()
})

// 获取数据
const fetchData = () => {
  loading.value = true
  safeTimeout(() => {
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.payment-product {
  padding: 16px;
}

.page-header {
  margin-bottom: 16px;
}

.page-header .title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.page-header .description {
  color: #606266;
  font-size: 14px;
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
  align-items: center;
  flex-wrap: wrap;
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

.fee-rate {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.product-form .el-form-item {
  margin-bottom: 20px;
}
</style> 