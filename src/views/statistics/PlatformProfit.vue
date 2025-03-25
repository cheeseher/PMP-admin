<!-- 数据统计/平台分润统计 - 统计平台收益数据 -->
<template>
  <div class="statistics-platform-profit">
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
          <el-form-item label="结算状态">
            <el-select v-model="searchForm.settleStatus" placeholder="请选择结算状态" style="width: 168px" clearable>
              <el-option label="待结算" value="pending" />
              <el-option label="已结算" value="settled" />
              <el-option label="结算失败" value="failed" />
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
        <el-table-column prop="date" label="日期（天）" width="120" />
        <el-table-column prop="successAmount" label="成功收款金额" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.successAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="channelCost" label="通道成本" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.channelCost) }}
          </template>
        </el-table-column>
        <el-table-column prop="profitAfterChannel" label="除通道成本后利润" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.profitAfterChannel) }}
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.fee) }}
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
  settleStatus: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    successAmount: 50000.00,
    channelCost: 250.00,
    profitAfterChannel: 49750.00,
    fee: 250.00,
    orderCount: 1000,
    successCount: 980,
    successRate: 0.98
  },
  {
    date: '2024-03-13',
    successAmount: 48000.00,
    channelCost: 240.00,
    profitAfterChannel: 47760.00,
    fee: 240.00,
    orderCount: 960,
    successCount: 940,
    successRate: 0.98
  },
  {
    date: '2024-03-12',
    successAmount: 45000.00,
    channelCost: 225.00,
    profitAfterChannel: 44775.00,
    fee: 225.00,
    orderCount: 900,
    successCount: 880,
    successRate: 0.98
  },
  {
    date: '2024-03-11',
    successAmount: 42000.00,
    channelCost: 210.00,
    profitAfterChannel: 41790.00,
    fee: 210.00,
    orderCount: 840,
    successCount: 820,
    successRate: 0.98
  },
  {
    date: '2024-03-10',
    successAmount: 40000.00,
    channelCost: 200.00,
    profitAfterChannel: 39800.00,
    fee: 200.00,
    orderCount: 800,
    successCount: 780,
    successRate: 0.98
  }
])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 结算状态映射
const getSettleStatusType = (status) => {
  const map = {
    pending: 'warning',
    settled: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getSettleStatusText = (status) => {
  const map = {
    pending: '待结算',
    settled: '已结算',
    failed: '结算失败'
  }
  return map[status] || '未知'
}

// 获取成功率类型
const getSuccessRateType = (rate) => {
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
  searchForm.payType = ''
  searchForm.settleStatus = ''
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
const formatNumber = (number) => {
  return number.toLocaleString('zh-CN')
}
</script>

<style scoped>
.statistics-platform-profit {
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