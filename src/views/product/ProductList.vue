<!-- 商户管理/商户列表 - 管理商户信息 -->
<template>
  <div class="product-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <!-- 第一行筛选项 -->
        <div class="filter-row">
          <el-form-item label="ID：">
            <el-input v-model="searchForm.id" placeholder="请输入ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户账户：">
            <el-input v-model="searchForm.productId" placeholder="请输入商户账户" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="商户名称：">
            <el-input v-model="searchForm.productName" placeholder="请输入商户名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="商户号：">
            <el-input v-model="searchForm.productNo" placeholder="请输入商户号" style="width: 168px" clearable />
          </el-form-item>
        </div>
        
        <!-- 第二行筛选项 -->
        <div class="filter-row">
          <el-form-item label="角色：">
            <el-select v-model="searchForm.role" placeholder="请选择角色" style="width: 168px" clearable>
              <el-option label="超级管理员" value="admin" />
              <el-option label="普通用户" value="user" />
              <el-option label="商户" value="merchant" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态：">
            <el-select v-model="searchForm.verified" placeholder="请选择状态" style="width: 168px" clearable>
              <el-option label="已验证" value="Y" />
              <el-option label="未验证" value="N" />
            </el-select>
          </el-form-item>
          <el-form-item label="谷歌认证：">
            <el-select v-model="searchForm.googleAuth" placeholder="请选择状态" style="width: 168px" clearable>
              <el-option label="已绑定" :value="true" />
              <el-option label="未绑定" :value="false" />
            </el-select>
          </el-form-item>
        </div>
        
        <!-- 按钮区域 -->
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
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增商户</el-button>
          <el-button :icon="Delete" plain :disabled="!selectedRows.length" @click="handleBatchDelete">批量删除</el-button>
          <el-button :icon="Setting" plain :disabled="!selectedRows.length" @click="handleBatchConfig">批量配置</el-button>
        </div>
        <div class="right">
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="fetchData" />
          </el-tooltip>
        </div>
      </div>
      
      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productId" label="商户账户" min-width="120" />
        <el-table-column prop="productName" label="商户名称" min-width="150" />
        <el-table-column prop="productNo" label="商户号" min-width="120" />
        <el-table-column prop="balance" label="余额" width="100" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ formatAmount(scope.row.balance) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="freeze" label="冻结金额" width="100" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ formatAmount(scope.row.freeze || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="agentBalance" label="代付余额" width="100" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ formatAmount(scope.row.agentBalance || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="agentFreeze" label="代付冻结" width="100" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ formatAmount(scope.row.agentFreeze || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="authIp" label="上次登录IP" width="140" />
        <el-table-column prop="loginCount" label="登录次数" width="100" />
        <el-table-column prop="googleAuth" label="谷歌认证" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.googleAuth ? 'success' : 'info'"
              size="small"
            >
              {{ scope.row.googleAuth ? '已绑定' : '未绑定' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quickLogin" label="一键登录" width="90">
          <template #default="scope">
            <el-button link type="primary" @click="handleQuickLogin(scope.row)">登录</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100" />
        <el-table-column prop="verified" label="状态" width="90">
          <template #default="scope">
            <el-tag
              :type="scope.row.verified === 'Y' ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.verified === 'Y' ? '已验证' : '未验证' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="primary" @click="handleConfig(scope.row)">配置</el-button>
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

    <!-- 添加/编辑商户对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="550px"
      destroy-on-close
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
        class="product-form"
      >
        <el-form-item label="商户账户" prop="productId">
          <el-input v-model="productForm.productId" placeholder="请输入商户账户" />
        </el-form-item>
        <el-form-item label="商户名称" prop="productName">
          <el-input v-model="productForm.productName" placeholder="请输入商户名称" />
        </el-form-item>
        <el-form-item label="商户号" prop="productNo">
          <el-input v-model="productForm.productNo" placeholder="请输入商户号" />
        </el-form-item>
        <el-form-item label="余额">
          <el-input-number v-model="productForm.balance" :precision="2" :min="0" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="productForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="商户" value="merchant" />
          </el-select>
        </el-form-item>
        <el-form-item label="验证状态">
          <el-radio-group v-model="productForm.verified">
            <el-radio label="Y">已验证</el-radio>
            <el-radio label="N">未验证</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 批量配置对话框 -->
    <el-dialog
      title="批量配置"
      v-model="batchConfigVisible"
      width="400px"
      destroy-on-close
    >
      <el-form
        ref="batchConfigFormRef"
        :model="batchConfigForm"
        label-width="100px"
      >
        <el-form-item label="验证状态">
          <el-radio-group v-model="batchConfigForm.verified">
            <el-radio label="Y">已验证</el-radio>
            <el-radio label="N">未验证</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchConfigVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchConfig">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Delete, Setting, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productList } from '@/data/productData'

// 搜索表单
const searchForm = reactive({
  id: '',
  productId: '',
  productName: '',
  productNo: '',
  role: '',
  verified: '',
  googleAuth: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取数据
const fetchData = () => {
  loading.value = true
  
  // 模拟异步请求
  setTimeout(() => {
    let filteredData = [...productList]
    
    if (searchForm.id) {
      filteredData = filteredData.filter(item => 
        item.id.toString().includes(searchForm.id))
    }
    
    if (searchForm.productId) {
      filteredData = filteredData.filter(item => 
        item.productId && item.productId.toLowerCase().includes(searchForm.productId.toLowerCase()))
    }
    
    if (searchForm.productName) {
      filteredData = filteredData.filter(item => 
        item.productName.toLowerCase().includes(searchForm.productName.toLowerCase()))
    }
    
    if (searchForm.productNo) {
      filteredData = filteredData.filter(item => 
        item.productNo.toLowerCase().includes(searchForm.productNo.toLowerCase()))
    }
    
    if (searchForm.role) {
      filteredData = filteredData.filter(item => 
        item.role === searchForm.role)
    }
    
    if (searchForm.verified) {
      filteredData = filteredData.filter(item => 
        item.verified === searchForm.verified)
    }
    
    if (searchForm.googleAuth !== '') {
      const isGoogleAuth = searchForm.googleAuth === true || searchForm.googleAuth === 'true'
      filteredData = filteredData.filter(item => 
        item.googleAuth === isGoogleAuth)
    }
    
    total.value = filteredData.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    
    tableData.value = filteredData.slice(start, end)
    loading.value = false
  }, 300)
}

// 格式化金额
const formatAmount = (amount) => {
  return amount?.toFixed(2) || '0.00'
}

// 搜索与重置
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  // 重置搜索表单
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  fetchData()
}

// 表格选择
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 添加/编辑商户相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加商户')
const productFormRef = ref(null)
const productForm = reactive({
  id: '',
  productNo: '',
  productName: '',
  productId: '',
  verified: 'N'
})

const productRules = {
  productId: [{ required: true, message: '请输入商户账户', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
  productNo: [{ required: true, message: '请输入商户号', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const resetProductForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  Object.assign(productForm, {
    id: '',
    productId: '',
    productName: '',
    productNo: '',
    balance: 0,
    freeze: 0,
    agentBalance: 0,
    agentFreeze: 0,
    role: 'merchant',
    googleAuth: false,
    verified: 'N'
  })
}

const handleAdd = () => {
  resetProductForm()
  dialogTitle.value = '添加商户'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  resetProductForm()
  dialogTitle.value = '编辑商户'
  Object.assign(productForm, { ...row })
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.validate()
    
    loading.value = true
    setTimeout(() => {
      // 模拟提交
      if (productForm.id) {
        // 编辑
        const index = productList.findIndex(item => item.id === productForm.id)
        if (index !== -1) {
          Object.assign(productList[index], productForm)
          ElMessage.success('编辑成功')
        }
      } else {
        // 添加
        const newProduct = {
          ...productForm,
          id: productList.length + 1,
          authIp: '',
          loginCount: 0,
          freeze: productForm.freeze || 0,
          agentBalance: productForm.agentBalance || 0,
          agentFreeze: productForm.agentFreeze || 0,
          registerTime: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(/\//g, '-')
        }
        productList.unshift(newProduct)
        ElMessage.success('添加成功')
      }
      
      dialogVisible.value = false
      fetchData()
      loading.value = false
    }, 300)
    
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 删除商户
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除商户 ${row.productName} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = productList.findIndex(item => item.id === row.id)
      if (index !== -1) {
        productList.splice(index, 1)
        ElMessage.success('删除成功')
        fetchData()
      }
      loading.value = false
    }, 300)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      const ids = selectedRows.value.map(row => row.id)
      let deleteCount = 0
      
      for (let i = productList.length - 1; i >= 0; i--) {
        if (ids.includes(productList[i].id)) {
          productList.splice(i, 1)
          deleteCount++
        }
      }
      
      ElMessage.success(`成功删除 ${deleteCount} 条记录`)
      fetchData()
      loading.value = false
    }, 300)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 配置商户
const handleConfig = (row) => {
  ElMessage.info(`正在配置商户：${row.productName}`)
}

// 一键登录
const handleQuickLogin = (row) => {
  ElMessage.success(`正在登录商户账户：${row.productId}`)
  // 实际登录逻辑这里仅作演示
}

// 批量配置
const batchConfigVisible = ref(false)
const batchConfigFormRef = ref(null)
const batchConfigForm = reactive({
  verified: ''
})

const handleBatchConfig = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  batchConfigForm.verified = ''
  batchConfigVisible.value = true
}

const submitBatchConfig = () => {
  if (!batchConfigForm.verified) {
    ElMessage.warning('请选择状态')
    return
  }
  
  loading.value = true
  setTimeout(() => {
    const ids = selectedRows.value.map(row => row.id)
    let updateCount = 0
    
    productList.forEach(item => {
      if (ids.includes(item.id)) {
        item.verified = batchConfigForm.verified
        updateCount++
      }
    })
    
    ElMessage.success(`成功更新 ${updateCount} 条记录`)
    batchConfigVisible.value = false
    fetchData()
    loading.value = false
  }, 300)
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.product-list-container {
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
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
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

.amount-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.product-form .el-form-item {
  margin-bottom: 20px;
}
</style> 
