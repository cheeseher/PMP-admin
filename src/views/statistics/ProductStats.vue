<!-- 数据统计/产品跑量统计 - 统计分析产品交易数据 -->
<template>
  <div class="statistics-product">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-card">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="产品ID">
            <el-input v-model="searchForm.productId" placeholder="请输入产品ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="产品名称">
            <el-input v-model="searchForm.productName" placeholder="请输入产品名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户">
            <el-select v-model="searchForm.merchant" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="请选择" value="" />
              <el-option v-for="item in merchantOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 360px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-header">
        <div class="left">
          <el-button-group>
            <el-button :icon="Refresh" @click="refreshData">刷新</el-button>
          </el-button-group>
        </div>
        <div class="right">
          <el-button-group>
            <el-button icon="Printer">打印</el-button>
            <el-button icon="Download" @click="handleExport">导出</el-button>
          </el-button-group>
        </div>
      </div>
      
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="productId" label="产品ID" width="80" />
        <el-table-column prop="productName" label="产品名称" width="150" />
        <el-table-column prop="merchantName" label="商户名称" width="150" />
        <el-table-column prop="orderCount" label="订单笔数" width="120">
          <template #default="{ row }">
            <span>{{ formatNumber(row.orderCount) }}笔</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="订单金额" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.orderAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="successCount" label="成功笔数" width="120">
          <template #default="{ row }">
            <span>{{ formatNumber(row.successCount) }}笔</span>
          </template>
        </el-table-column>
        <el-table-column prop="successAmount" label="成功金额" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.successAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="successRate" label="成功率" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="getSuccessRateType(row.successRate)"
              size="small"
            >
              {{ (row.successRate * 100).toFixed(2) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 商户选项
const merchantOptions = [
  { label: '测试商户', value: '1' },
  { label: '示例商户', value: '2' },
  { label: '新商户', value: '3' }
]

// 搜索表单数据
const searchForm = reactive({
  productId: '',
  productName: '',
  merchant: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    productId: '001',
    productName: '微信支付',
    merchantName: '测试商户',
    orderCount: 1000,
    orderAmount: 50000.00,
    successCount: 980,
    successAmount: 49000.00,
    successRate: 0.98,
    remark: ''
  },
  {
    date: '2024-03-14',
    productId: '002',
    productName: '支付宝',
    merchantName: '测试商户',
    orderCount: 850,
    orderAmount: 42500.00,
    successCount: 825,
    successAmount: 41250.00,
    successRate: 0.97,
    remark: ''
  },
  {
    date: '2024-03-14',
    productId: '003',
    productName: '银联支付',
    merchantName: '示例商户',
    orderCount: 500,
    orderAmount: 75000.00,
    successCount: 485,
    successAmount: 72750.00,
    successRate: 0.97,
    remark: ''
  },
  {
    date: '2024-03-14',
    productId: '004',
    productName: '快捷支付',
    merchantName: '新商户',
    orderCount: 200,
    orderAmount: 30000.00,
    successCount: 180,
    successAmount: 27000.00,
    successRate: 0.90,
    remark: ''
  },
  {
    date: '2024-03-13',
    productId: '001',
    productName: '微信支付',
    merchantName: '测试商户',
    orderCount: 950,
    orderAmount: 47500.00,
    successCount: 920,
    successAmount: 46000.00,
    successRate: 0.97,
    remark: ''
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 搜索方法
const handleSearch = () => {
  loading.value = true
  // TODO: 调用接口获取数据
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 1000)
}

// 重置方法
const handleReset = () => {
  searchForm.productId = ''
  searchForm.productName = ''
  searchForm.merchant = ''
  searchForm.dateRange = []
  handleSearch()
}

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

// 导出数据
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 500)
}

// 格式化金额
const formatAmount = (amount) => {
  return Number(amount).toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化数字
const formatNumber = (num) => {
  return num.toLocaleString('zh-CN')
}

// 获取成功率类型
const getSuccessRateType = (rate) => {
  if (rate >= 0.95) return 'success'
  if (rate >= 0.9) return 'warning'
  return 'danger'
}
</script>

<style scoped>
.statistics-product {
  padding: 15px;
}

.search-card {
  margin-bottom: 15px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.table-card {
  margin-bottom: 15px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-tag) {
  margin-right: 5px;
}

/* 修复表格内部标签居中问题 */
:deep(.el-table .cell) {
  display: flex;
  align-items: center;
}

:deep(.el-table .cell .el-tag) {
  margin: 0 auto;
}

/* 统一按钮组样式 */
:deep(.el-button-group) {
  margin-right: 10px;
}

:deep(.el-button-group:last-child) {
  margin-right: 0;
}

/* 统一表单项样式 */
:deep(.el-form-item) {
  margin-bottom: 18px;
  margin-right: 18px;
}

:deep(.el-form-item:last-child) {
  margin-right: 0;
}
</style> 