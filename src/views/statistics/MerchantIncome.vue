<!-- 数据统计/商户收款统计 - 统计商户收入数据 -->
<template>
  <div class="statistics-merchant-income">
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
          <el-form-item label="订单状态">
            <el-select v-model="searchForm.orderStatus" placeholder="请选择订单状态" style="width: 168px" clearable>
              <el-option label="支付成功" value="success" />
              <el-option label="支付失败" value="failed" />
              <el-option label="待支付" value="pending" />
              <el-option label="已退款" value="refunded" />
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

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总收款金额</span>
              <el-tag size="small" type="info">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ formatAmount(totalIncome) }}</span>
            <div class="trend">
              <span :class="{ 'up': incomeTrend > 0, 'down': incomeTrend < 0 }">
                {{ Math.abs(incomeTrend) }}%
              </span>
              <el-icon v-if="incomeTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总订单笔数</span>
              <el-tag size="small" type="info">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ formatNumber(totalOrders) }}笔</span>
            <div class="trend">
              <span :class="{ 'up': ordersTrend > 0, 'down': ordersTrend < 0 }">
                {{ Math.abs(ordersTrend) }}%
              </span>
              <el-icon v-if="ordersTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>成功订单数</span>
              <el-tag size="small" type="success">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ formatNumber(successOrders) }}笔</span>
            <span class="rate">成功率 {{ (successRate * 100).toFixed(2) }}%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>退款金额</span>
              <el-tag size="small" type="danger">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ formatAmount(refundAmount) }}</span>
            <span class="rate">退款率 {{ (refundRate * 100).toFixed(2) }}%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

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
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="merchantId" label="商户ID" width="120" />
        <el-table-column prop="merchantName" label="商户名称" width="150" />
        <el-table-column prop="payType" label="支付类型" width="120" />
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
        <el-table-column prop="refundAmount" label="退款金额" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.refundAmount) }}
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
import { ArrowUp, ArrowDown, Search, Refresh, Download, Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  merchantId: '',
  merchantName: '',
  payType: '',
  orderStatus: '',
  dateRange: []
})

// 统计数据
const totalIncome = ref(1000000.00)
const totalOrders = ref(5000)
const successOrders = ref(4800)
const refundAmount = ref(10000.00)
const incomeTrend = ref(15.8)
const ordersTrend = ref(-3.2)
const successRate = ref(0.96)
const refundRate = ref(0.02)

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    merchantId: 'M2024031401',
    merchantName: '优质商户A',
    payType: '支付宝',
    orderCount: 1000,
    orderAmount: 50000.00,
    successCount: 980,
    successAmount: 49000.00,
    successRate: 0.98,
    refundAmount: 1000.00,
    remark: ''
  },
  {
    date: '2024-03-14',
    merchantId: 'M2024031402',
    merchantName: '优质商户B',
    payType: '微信支付',
    orderCount: 850,
    orderAmount: 42500.00,
    successCount: 825,
    successAmount: 41250.00,
    successRate: 0.97,
    refundAmount: 500.00,
    remark: ''
  },
  {
    date: '2024-03-14',
    merchantId: 'M2024031403',
    merchantName: '标准商户C',
    payType: '银联',
    orderCount: 750,
    orderAmount: 37500.00,
    successCount: 720,
    successAmount: 36000.00,
    successRate: 0.96,
    refundAmount: 750.00,
    remark: '部分订单退款'
  },
  {
    date: '2024-03-14',
    merchantId: 'M2024031404',
    merchantName: '标准商户D',
    payType: '快捷支付',
    orderCount: 600,
    orderAmount: 30000.00,
    successCount: 570,
    successAmount: 28500.00,
    successRate: 0.95,
    refundAmount: 0.00,
    remark: ''
  },
  {
    date: '2024-03-13',
    merchantId: 'M2024031405',
    merchantName: '新商户E',
    payType: '支付宝',
    orderCount: 500,
    orderAmount: 25000.00,
    successCount: 450,
    successAmount: 22500.00,
    successRate: 0.90,
    refundAmount: 2500.00,
    remark: '系统故障导致用户重复支付，已退款'
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
  searchForm.orderStatus = ''
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
.statistics-merchant-income {
  padding: 15px;
}

.search-card {
  margin-bottom: 15px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.stat-cards {
  margin-bottom: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.rate {
  font-size: 14px;
  color: #909399;
}

.trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.up {
  color: #67c23a;
}

.down {
  color: #f56c6c;
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