<!-- 支付配置/支付产品管理 - 配置支付产品和费率 -->
<template>
  <div class="payment-product">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="title">支付产品管理</div>
      <div class="description">管理系统支持的所有支付产品及费率配置</div>
    </div>

    <el-card class="search-card" shadow="never">
      <div class="search-form">
        <div class="search-item">
          <span class="search-label">ID</span>
          <el-input v-model="searchForm.id" placeholder="请输入" clearable style="width: 240px" />
        </div>
        <div class="search-item">
          <span class="search-label">支付产品名称</span>
          <el-input v-model="searchForm.productName" placeholder="请输入" clearable style="width: 240px" />
        </div>
        <div class="search-item">
          <span class="search-label">支付产品编码</span>
          <el-input v-model="searchForm.productCode" placeholder="请输入" clearable style="width: 240px" />
        </div>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>产品列表</span>
          <div class="header-operations">
            <el-button type="danger" :icon="Delete" @click="handleBatchDelete" :disabled="!selectedRows.length">批量删除</el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">添加</el-button>
            <el-button type="primary" @click="handleBatchApprove">产品一键开启</el-button>
            <el-button type="warning" @click="handleBatchReject">产品一键关闭</el-button>
            <el-button type="danger" @click="handleBatchRemove">下架一键关闭</el-button>
          </div>
        </div>
      </template>
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        border
        highlight-current-row
        stripe
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="productName" label="支付产品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="productCode" label="支付产品编码" min-width="150" show-overflow-tooltip />
        <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip />
        <el-table-column label="是否启用" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ONLINE' ? 'success' : 'info'" size="small">
              {{ scope.row.status === 'ONLINE' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button 
              link 
              :type="scope.row.status === 'ONLINE' ? 'danger' : 'success'"
              size="small"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'ONLINE' ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <el-dialog
      v-model="formDialogVisible"
      :title="formType === 'add' ? '新增产品' : '编辑产品'"
      width="550px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form 
        :model="productForm" 
        label-width="120px" 
        :rules="formRules"
        ref="productFormRef"
        status-icon
      >
        <el-form-item label="支付产品名称" prop="productName">
          <el-input v-model="productForm.productName" placeholder="请输入支付产品名称" />
        </el-form-item>
        <el-form-item label="支付产品编码" prop="productCode">
          <el-input 
            v-model="productForm.productCode" 
            placeholder="请输入支付产品编码"
            :disabled="formType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="productForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-radio-group v-model="productForm.status">
            <el-radio label="ONLINE">启用</el-radio>
            <el-radio label="OFFLINE">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleFormSubmit" :loading="submitLoading">确认</el-button>
        </span>
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

<style scoped lang="scss">
.payment-product {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .description {
      color: #606266;
      font-size: 14px;
    }
  }

  .search-card {
    margin-bottom: 20px;
  }

  .search-card :deep(.el-card__body) {
    padding: 15px 20px;
  }

  .search-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-item {
    display: flex;
    align-items: center;
  }

  .search-label {
    margin-right: 8px;
    font-size: 14px;
    white-space: nowrap;
  }

  .table-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-operations {
        display: flex;
        gap: 12px;
      }
    }
  }

  .action-bar {
    display: none;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style> 