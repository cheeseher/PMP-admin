<!-- 数据统计/平台分润统计 - 统计平台收益数据 -->
<template>
  <div class="platform-profit-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="时间筛选：">
            <div class="time-filter-container">
              <el-select v-model="searchForm.timeType" placeholder="选择时间类型" style="width: 120px">
                <el-option label="自定义时间" value="custom" />
                <el-option label="今日" value="today" />
                <el-option label="昨日" value="yesterday" />
                <el-option label="最近7天" value="last7days" />
              </el-select>
              <el-date-picker
                v-if="searchForm.timeType === 'custom'"
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 240px; margin-left: 8px;"
              />
            </div>
          </el-form-item>
        </div>
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch" :loading="loading">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总收款金额</div>
          <div class="stat-body">
            <el-icon :size="22"><Money /></el-icon>
            <span class="stat-value">{{ formatAmount(totalSuccessAmount) }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总通道成本</div>
          <div class="stat-body">
            <el-icon :size="22"><Discount /></el-icon>
            <span class="stat-value">{{ formatAmount(totalChannelCost) }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总利润</div>
          <div class="stat-body">
            <el-icon :size="22"><Wallet /></el-icon>
            <span class="stat-value">{{ formatAmount(totalProfit) }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总手续费</div>
          <div class="stat-body">
            <el-icon :size="22"><Money /></el-icon>
            <span class="stat-value">{{ formatAmount(totalFee) }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">平台分润列表</span>
          <el-tag type="info" size="small" effect="plain">{{ total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button :icon="Printer" plain>打印</el-button>
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" :loading="loading" />
          </el-tooltip>
        </div>
      </div>
      
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column prop="successAmount" label="成功收款金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.successAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="channelCost" label="通道成本" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.channelCost) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profitAfterChannel" label="除通道成本后利润" width="180" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.profitAfterChannel) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.fee) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="成功单数/总笔数" min-width="160" align="center">
          <template #default="{ row }">
            <span>{{ formatNumber(row.successCount) }}/{{ formatNumber(row.orderCount) }}笔</span>
          </template>
        </el-table-column>
        <el-table-column prop="successRate" label="成功率" width="100" align="center">
          <template #default="{ row }">
            <span>{{ (row.successRate * 100).toFixed(2) }}%</span>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { Search, Refresh, Download, Printer, Money, Discount, Wallet } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// 根据时间类型获取日期范围
const getDateRangeByType = (type) => {
  const today = dayjs()
  
  switch (type) {
    case 'today':
      return [today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
    case 'yesterday':
      const yesterday = today.subtract(1, 'day')
      return [yesterday.format('YYYY-MM-DD'), yesterday.format('YYYY-MM-DD')]
    case 'last7days':
      return [today.subtract(6, 'day').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
    default:
      return []
  }
}

// 搜索表单数据
const searchForm = reactive({
  timeType: 'today',
  dateRange: getDateRangeByType('today')
})

// 监听时间类型变化，自动设置日期范围
watch(() => searchForm.timeType, (newType) => {
  if (newType !== 'custom') {
    searchForm.dateRange = getDateRangeByType(newType)
  }
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

// 统计数据计算
const totalSuccessAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.successAmount, 0)
})

const totalChannelCost = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.channelCost, 0)
})

const totalProfit = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.profitAfterChannel, 0)
})

const totalFee = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.fee, 0)
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 初始化页面
onMounted(() => {
  fetchData()
})

// 获取数据
const fetchData = () => {
  loading.value = true
  // 这里是模拟请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置方法
const handleReset = () => {
  searchForm.timeType = 'today'
  searchForm.dateRange = getDateRangeByType('today')
  handleSearch()
}

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 导出数据
const handleExport = () => {
  ElMessageBox.confirm('确定要导出当前筛选条件下的数据吗?', '导出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('数据导出成功')
  }).catch(() => {})
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
.platform-profit-container {
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

/* 统计卡片样式 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  height: auto;
}

.stat-card :deep(.el-card__body) {
  padding: 10px;
}

.compact-card-content {
  display: flex;
  flex-direction: column;
}

.stat-header {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-body {
  display: flex;
  align-items: center;
}

.stat-body .el-icon {
  margin-right: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
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

.time-filter-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* 媒体查询，适配小屏幕 */
@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }
}
</style> 