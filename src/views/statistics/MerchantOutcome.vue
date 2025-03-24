<!-- 数据统计/商户出款统计 - 统计商户出款数据 -->
<template>
  <div class="statistics-merchant-outcome">
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
          <el-form-item label="出款类型">
            <el-select v-model="searchForm.outcomeType" placeholder="请选择出款类型" style="width: 168px" clearable>
              <el-option label="提现" value="withdraw" />
              <el-option label="退款" value="refund" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="searchForm.auditStatus" placeholder="请选择审核状态" style="width: 168px" clearable>
              <el-option label="待审核" value="pending" />
              <el-option label="审核通过" value="approved" />
              <el-option label="审核拒绝" value="rejected" />
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
              <span>总出款金额</span>
              <el-tag size="small" type="info">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ formatAmount(totalOutcome) }}</span>
            <div class="trend">
              <span :class="{ 'up': outcomeTrend > 0, 'down': outcomeTrend < 0 }">
                {{ Math.abs(outcomeTrend) }}%
              </span>
              <el-icon v-if="outcomeTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总笔数</span>
              <el-tag size="small" type="info">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ formatNumber(totalCount) }}笔</span>
            <div class="trend">
              <span :class="{ 'up': countTrend > 0, 'down': countTrend < 0 }">
                {{ Math.abs(countTrend) }}%
              </span>
              <el-icon v-if="countTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待审核金额</span>
              <el-tag size="small" type="warning">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ formatAmount(pendingAmount) }}</span>
            <span class="count">{{ formatNumber(pendingCount) }}笔</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>已审核金额</span>
              <el-tag size="small" type="success">累计</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ formatAmount(approvedAmount) }}</span>
            <span class="count">{{ formatNumber(approvedCount) }}笔</span>
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
        <el-table-column prop="outcomeType" label="出款类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getOutcomeTypeTag(row.outcomeType)" size="small">
              {{ getOutcomeTypeText(row.outcomeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="申请笔数" width="120">
          <template #default="{ row }">
            <span>{{ formatNumber(row.orderCount) }}笔</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="申请金额" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.orderAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="approvedCount" label="通过笔数" width="120">
          <template #default="{ row }">
            <span>{{ formatNumber(row.approvedCount) }}笔</span>
          </template>
        </el-table-column>
        <el-table-column prop="approvedAmount" label="通过金额" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.approvedAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="approvalRate" label="通过率" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="getApprovalRateType(row.approvalRate)"
              size="small"
            >
              {{ (row.approvalRate * 100).toFixed(2) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.fee) }}
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
  outcomeType: '',
  auditStatus: '',
  dateRange: []
})

// 统计数据
const totalOutcome = ref(500000.00)
const totalCount = ref(2000)
const pendingAmount = ref(100000.00)
const pendingCount = ref(500)
const approvedAmount = ref(400000.00)
const approvedCount = ref(1500)
const outcomeTrend = ref(-8.5)
const countTrend = ref(12.3)

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    merchantId: 'M2024031401',
    merchantName: '优质商户A',
    outcomeType: 'withdraw',
    orderCount: 100,
    orderAmount: 50000.00,
    approvedCount: 95,
    approvedAmount: 47500.00,
    approvalRate: 0.95,
    fee: 237.50,
    remark: ''
  },
  {
    date: '2024-03-14',
    merchantId: 'M2024031402',
    merchantName: '优质商户B',
    outcomeType: 'withdraw',
    orderCount: 80,
    orderAmount: 40000.00,
    approvedCount: 78,
    approvedAmount: 39000.00,
    approvalRate: 0.98,
    fee: 195.00,
    remark: ''
  },
  {
    date: '2024-03-14',
    merchantId: 'M2024031403',
    merchantName: '标准商户C',
    outcomeType: 'refund',
    orderCount: 50,
    orderAmount: 25000.00,
    approvedCount: 45,
    approvedAmount: 22500.00,
    approvalRate: 0.90,
    fee: 112.50,
    remark: '部分金额需人工审核'
  },
  {
    date: '2024-03-13',
    merchantId: 'M2024031404',
    merchantName: '标准商户D',
    outcomeType: 'withdraw',
    orderCount: 60,
    orderAmount: 30000.00,
    approvedCount: 58,
    approvedAmount: 29000.00,
    approvalRate: 0.97,
    fee: 145.00,
    remark: ''
  },
  {
    date: '2024-03-13',
    merchantId: 'M2024031405',
    merchantName: '新商户E',
    outcomeType: 'other',
    orderCount: 30,
    orderAmount: 15000.00,
    approvedCount: 25,
    approvedAmount: 12500.00,
    approvalRate: 0.83,
    fee: 62.50,
    remark: '首次大额提现，需特殊审核'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 出款类型映射
const getOutcomeTypeTag = (type) => {
  const map = {
    withdraw: 'primary',
    refund: 'warning',
    other: 'info'
  }
  return map[type] || 'info'
}

const getOutcomeTypeText = (type) => {
  const map = {
    withdraw: '提现',
    refund: '退款',
    other: '其他'
  }
  return map[type] || '未知'
}

// 通过率类型
const getApprovalRateType = (rate) => {
  if (rate >= 0.95) return 'success'
  if (rate >= 0.9) return 'warning'
  return 'danger'
}

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
  searchForm.outcomeType = ''
  searchForm.auditStatus = ''
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
</script>

<style scoped>
.statistics-merchant-outcome {
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

.count {
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