<!-- 数据统计/商户支付排行 - 展示商户交易排名数据 -->
<template>
  <div class="statistics-merchant-rank">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-card">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="商户ID">
            <el-input v-model="searchForm.merchantId" placeholder="请输入商户ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户名称">
            <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="支付类型">
            <el-select v-model="searchForm.payType" placeholder="请选择支付类型" style="width: 168px" clearable>
              <el-option label="支付宝" value="alipay" />
              <el-option label="微信支付" value="wechat" />
              <el-option label="银联" value="unionpay" />
              <el-option label="快捷支付" value="quick" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序方式">
            <el-select v-model="searchForm.sortBy" placeholder="请选择排序方式" style="width: 168px" clearable>
              <el-option label="交易金额" value="amount" />
              <el-option label="交易笔数" value="count" />
              <el-option label="成功率" value="rate" />
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
        <el-table-column type="index" label="排名" width="80">
          <template #default="scope">
            <el-tag 
              :type="getRankType(scope.$index + 1)" 
              effect="plain" 
              size="small"
            >
              {{ scope.$index + 1 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="merchantId" label="商户ID" width="120" />
        <el-table-column prop="merchantNo" label="商户号" width="120" />
        <el-table-column prop="merchantAccount" label="商户账号" width="150" />
        <el-table-column prop="merchantName" label="商户名称" width="150" />
        <el-table-column prop="successAmount" label="收款金额" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.successAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.fee) }}
          </template>
        </el-table-column>
        <el-table-column prop="netAmount" label="入账金额" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.netAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="成功单数/总笔数" width="150">
          <template #default="{ row }">
            <span>{{ formatNumber(row.successCount) }}/{{ formatNumber(row.orderCount) }}笔</span>
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

// 搜索表单数据
const searchForm = reactive({
  merchantId: '',
  merchantName: '',
  payType: '',
  sortBy: 'amount',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    merchantId: 'M2024031401',
    merchantNo: 'M001',
    merchantAccount: '6222021234567890123',
    merchantName: '优质商户A',
    orderCount: 1000,
    successCount: 980,
    successAmount: 49000.00,
    successRate: 0.98,
    fee: 245.00,
    netAmount: 48755.00
  },
  {
    merchantId: 'M2024031402',
    merchantNo: 'M002',
    merchantAccount: '6222021234567890124',
    merchantName: '优质商户B',
    orderCount: 850,
    successCount: 825,
    successAmount: 41250.00,
    successRate: 0.97,
    fee: 206.25,
    netAmount: 41043.75
  },
  {
    merchantId: 'M2024031403',
    merchantNo: 'M003',
    merchantAccount: '6222021234567890125',
    merchantName: '标准商户C',
    orderCount: 750,
    successCount: 720,
    successAmount: 36000.00,
    successRate: 0.96,
    fee: 180.00,
    netAmount: 35820.00
  },
  {
    merchantId: 'M2024031404',
    merchantNo: 'M004',
    merchantAccount: '6222021234567890126',
    merchantName: '标准商户D',
    orderCount: 600,
    successCount: 570,
    successAmount: 28500.00,
    successRate: 0.95,
    fee: 142.50,
    netAmount: 28357.50
  },
  {
    merchantId: 'M2024031405',
    merchantNo: 'M005',
    merchantAccount: '6222021234567890127',
    merchantName: '新商户E',
    orderCount: 500,
    successCount: 450,
    successAmount: 22500.00,
    successRate: 0.90,
    fee: 112.50,
    netAmount: 22387.50
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
  searchForm.merchantId = ''
  searchForm.merchantName = ''
  searchForm.payType = ''
  searchForm.sortBy = 'amount'
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

// 获取排名标签类型
const getRankType = (rank) => {
  if (rank === 1) return 'danger'
  if (rank === 2) return 'warning'
  if (rank === 3) return 'success'
  return 'info'
}
</script>

<style scoped>
.statistics-merchant-rank {
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