<!-- 商品管理/商品列表 - 管理商品信息 -->
<template>
  <div class="product-list-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="ID">
          <el-input v-model="searchForm.id" placeholder="请输入ID" clearable style="width: 168px" />
        </el-form-item>
        <el-form-item label="商户号">
          <el-input v-model="searchForm.productNo" placeholder="请输入商户号" clearable style="width: 168px" />
        </el-form-item>
        <el-form-item label="商户名称">
          <el-input v-model="searchForm.productName" placeholder="请输入商户名称" clearable style="width: 168px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 按钮操作区域 -->
    <div class="action-buttons">
      <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加商品
      </el-button>
      <el-button :disabled="!selectedRows.length" @click="handleBatchConfig">
        <el-icon><Setting /></el-icon>批量配置
      </el-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productNo" label="商品编号" min-width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column prop="balance" label="余额" min-width="120">
          <template #default="scope">
            {{ scope.row.balance.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="flow" label="流水" min-width="120">
          <template #default="scope">
            {{ scope.row.flow.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="verified" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.verified === 'Y' ? 'success' : 'danger'">
              {{ scope.row.verified === 'Y' ? '已验证' : '未验证' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" min-width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            <el-button size="small" type="primary" @click="handleConfig(scope.row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-form-item label="商品编号" prop="productNo">
          <el-input v-model="productForm.productNo" placeholder="请输入商品编号" />
        </el-form-item>
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="productForm.productName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品ID" prop="productId">
          <el-input v-model="productForm.productId" placeholder="请输入商品ID" />
        </el-form-item>
        <el-form-item label="状态" prop="verified">
          <el-select v-model="productForm.verified" placeholder="请选择状态" style="width: 168px">
            <el-option label="已验证" value="Y" />
            <el-option label="未验证" value="N" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量配置对话框 -->
    <el-dialog
      title="批量配置"
      v-model="batchConfigVisible"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="batchConfigFormRef"
        :model="batchConfigForm"
        label-width="100px"
      >
        <el-form-item label="状态">
          <el-select v-model="batchConfigForm.verified" placeholder="请选择状态" style="width: 168px">
            <el-option label="已验证" value="Y" />
            <el-option label="未验证" value="N" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchConfigVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchConfig">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Refresh, Delete, Plus, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productList } from '@/data/productData'

// 搜索表单
const searchForm = reactive({
  id: '',
  productNo: '',
  productName: ''
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
  setTimeout(() => {
    // 过滤数据
    let filteredData = [...productList]
    
    if (searchForm.id) {
      filteredData = filteredData.filter(item => 
        item.id.toString().includes(searchForm.id))
    }
    
    if (searchForm.productNo) {
      filteredData = filteredData.filter(item => 
        item.productNo.toLowerCase().includes(searchForm.productNo.toLowerCase()))
    }
    
    if (searchForm.productName) {
      filteredData = filteredData.filter(item => 
        item.productName.toLowerCase().includes(searchForm.productName.toLowerCase()))
    }
    
    total.value = filteredData.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    
    tableData.value = filteredData.slice(start, end)
    loading.value = false
  }, 300)
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

// 添加/编辑商品相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')
const productFormRef = ref(null)
const productForm = reactive({
  id: '',
  productNo: '',
  productName: '',
  productId: '',
  verified: 'N'
})

const productRules = {
  productNo: [{ required: true, message: '请输入商品编号', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  productId: [{ required: true, message: '请输入商品ID', trigger: 'blur' }]
}

const resetProductForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  Object.assign(productForm, {
    id: '',
    productNo: '',
    productName: '',
    productId: '',
    verified: 'N'
  })
}

const handleAdd = () => {
  resetProductForm()
  dialogTitle.value = '添加商品'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  resetProductForm()
  dialogTitle.value = '编辑商品'
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
          balance: 0,
          flow: 0,
          agentBalance: 0,
          agentFlow: 0,
          authIp: '',
          loginCount: 0,
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

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除商品 ${row.productName} 吗？`,
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

// 配置商品
const handleConfig = (row) => {
  ElMessage.info(`正在配置商品：${row.productName}`)
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
  padding: 20px;
}

.search-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.table-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style> 