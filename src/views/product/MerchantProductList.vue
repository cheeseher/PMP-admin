<!-- 商户产品列表页面 - 展示商户与产品关联信息 -->
<template>
  <div class="merchant-product-list-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="search-header">搜索</div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="search-form">
        <el-col :span="6">
          <div class="search-item">
            <span class="label">ID</span>
            <el-input v-model="searchForm.id" placeholder="请输入" clearable />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="search-item">
            <span class="label">商户账号</span>
            <el-input v-model="searchForm.merchantNo" placeholder="请输入" clearable />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="search-item">
            <span class="label">商户名称</span>
            <el-input v-model="searchForm.merchantName" placeholder="请输入" clearable />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="search-item">
            <span class="label">支付产品</span>
            <el-input v-model="searchForm.product" placeholder="请输入" clearable />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="search-form" style="margin-top: 10px;">
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch" class="search-btn">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset" plain class="reset-btn">重置</el-button>
        </el-col>
      </el-row>
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
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" sortable />
        <el-table-column prop="merchantNo" label="商户账号" min-width="120" align="center" />
        <el-table-column prop="merchantName" label="商户名称" min-width="150" align="center" />
        <el-table-column prop="productName" label="支付产品名称" min-width="150" align="center" />
        <el-table-column prop="productCode" label="支付产品编码" min-width="120" align="center" />
        <el-table-column prop="rate" label="商户费率" width="100" align="center">
          <template #default="scope">
            {{ scope.row.rate.toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="权重" width="80" align="center" />
        <el-table-column prop="remark" label="备注" min-width="150" align="left" :show-overflow-tooltip="true" />
      </el-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handleCurrentChange"
        :pager-count="7"
      >
        <template #jumper>
          <span class="page-info">
            到第
            <el-input v-model="jumpPage" class="page-jump-input" @keyup.enter="handleJumpPage" />
            页
          </span>
        </template>
        <template #total>
          <span class="total-info">共 {{ total }} 条</span>
        </template>
      </el-pagination>
      <div class="page-size-selector">
        <span>每页显示</span>
        <el-select v-model="pageSize" @change="handleSizeChange" class="page-size-select">
          <el-option :value="10" label="10条/页" />
          <el-option :value="20" label="20条/页" />
          <el-option :value="30" label="30条/页" />
          <el-option :value="50" label="50条/页" />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { merchantProductList } from '@/data/merchantProductData'

// 搜索表单
const searchForm = reactive({
  id: '',
  merchantNo: '',
  merchantName: '',
  product: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(30)
const total = ref(0)
const jumpPage = ref('')

// 获取数据
const fetchData = () => {
  loading.value = true
  // 模拟异步请求
  setTimeout(() => {
    // 过滤数据
    let filteredData = [...merchantProductList]
    
    if (searchForm.id) {
      filteredData = filteredData.filter(item => 
        item.id.toString().includes(searchForm.id))
    }
    
    if (searchForm.merchantNo) {
      filteredData = filteredData.filter(item => 
        item.merchantNo.includes(searchForm.merchantNo))
    }
    
    if (searchForm.merchantName) {
      filteredData = filteredData.filter(item => 
        item.merchantName.toLowerCase().includes(searchForm.merchantName.toLowerCase()))
    }
    
    if (searchForm.product) {
      filteredData = filteredData.filter(item => 
        item.productName.toLowerCase().includes(searchForm.product.toLowerCase()) ||
        item.productCode.toLowerCase().includes(searchForm.product.toLowerCase()))
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

// 跳转到指定页
const handleJumpPage = () => {
  if (!jumpPage.value) return
  
  const page = parseInt(jumpPage.value)
  if (isNaN(page) || page < 1 || page > Math.ceil(total.value / pageSize.value)) {
    ElMessage.warning('请输入有效页码')
    return
  }
  
  currentPage.value = page
  fetchData()
  jumpPage.value = ''
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.merchant-product-list-container {
  padding: 0;
  background-color: #f0f2f5;
}

.search-section {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-bottom: 16px;
  padding: 16px;
}

.search-header {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  align-items: center;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  min-width: 60px;
  text-align: right;
}

.search-btn {
  margin-left: 16px;
}

.reset-btn {
  margin-left: 8px;
}

.table-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 16px;
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 12px 16px;
}

.page-info {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.page-jump-input {
  width: 50px;
  margin: 0 8px;
}

.total-info {
  margin-left: 16px;
}

.page-size-selector {
  display: flex;
  align-items: center;
}

.page-size-select {
  width: 100px;
  margin-left: 8px;
}

:deep(.el-pagination) {
  justify-content: flex-start;
}

:deep(.el-pagination__sizes) {
  margin-right: 0;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-pagination__total) {
  margin-right: 0;
}
</style> 