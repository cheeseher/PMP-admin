<!-- 数据统计/产品跑量统计 - 统计分析产品交易数据 -->
<template>
  <div class="product-stats-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="时间筛选：">
            <div class="time-filter-container">
              <el-select v-model="searchForm.timeType" placeholder="选择时间类型" style="width: 120px">
                <el-option label="全部" value="all" />
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
          <el-form-item label="支付产品名称：">
            <el-input v-model="searchForm.productName" placeholder="请输入支付产品名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="商户：">
            <el-select 
              v-model="searchForm.merchantIds" 
              placeholder="请选择商户" 
              style="width: 168px;"
              clearable 
              multiple 
              collapse-tags 
              collapse-tags-tooltip
              filterable
            >
              <el-option v-for="item in merchantOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总成功收款金额</div>
          <div class="stat-body">
            <el-icon :size="22"><Money /></el-icon>
            <span class="stat-value">{{ formatAmount(totalSuccessAmount) }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总手续费</div>
          <div class="stat-body">
            <el-icon :size="22"><Discount /></el-icon>
            <span class="stat-value">{{ formatAmount(totalFeeAmount) }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总入账金额</div>
          <div class="stat-body">
            <el-icon :size="22"><Wallet /></el-icon>
            <span class="stat-value">{{ formatAmount(totalNetAmount) }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总成功单数/总笔数</div>
          <div class="stat-body">
            <el-icon :size="22"><Document /></el-icon>
            <span class="stat-value">{{ formatNumber(totalSuccessCount) }}/{{ formatNumber(totalOrderCount) }}笔</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">产品跑量列表</span>
          <el-tag type="info" size="small" effect="plain">{{ total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" />
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
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="productId" label="支付产品ID" width="90" align="center" />
        <el-table-column prop="productName" label="支付产品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="successAmount" label="成功收款金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.successAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="feeAmount" label="手续费" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.feeAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="netAmount" label="入账金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.netAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="成功单数/总笔数" width="150" align="center">
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
import { Search, Refresh, Download, Money, Discount, Wallet, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// 商户选项
const merchantOptions = [
  { label: '商户A', value: '1' },
  { label: '商户B', value: '2' },
  { label: '商户C', value: '3' }
]

// 根据时间类型获取日期范围
const getDateRangeByType = (type) => {
  const today = dayjs()
  
  switch (type) {
    case 'all':
      return []
    case 'today':
      return [today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
    case 'yesterday':
      const yesterday = today.subtract(1, 'day')
      return [yesterday.format('YYYY-MM-DD'), yesterday.format('YYYY-MM-DD')]
    case 'thisWeek':
      return [today.startOf('week').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
    case 'lastWeek':
      const lastWeekStart = today.subtract(1, 'week').startOf('week')
      const lastWeekEnd = lastWeekStart.endOf('week')
      return [lastWeekStart.format('YYYY-MM-DD'), lastWeekEnd.format('YYYY-MM-DD')]
    case 'thisMonth':
      return [today.startOf('month').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
    case 'lastMonth':
      const lastMonthStart = today.subtract(1, 'month').startOf('month')
      const lastMonthEnd = lastMonthStart.endOf('month')
      return [lastMonthStart.format('YYYY-MM-DD'), lastMonthEnd.format('YYYY-MM-DD')]
    case 'last7days':
      return [today.subtract(6, 'day').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
    case 'last30days':
      return [today.subtract(29, 'day').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
    default:
      return []
  }
}

// 搜索表单数据
const searchForm = reactive({
  productName: '',
  merchantIds: [],
  timeType: 'all',  // 默认为全部
  dateRange: [] // 初始化为空
})

// 监听时间类型变化，自动设置日期范围
watch(() => searchForm.timeType, (newType) => {
  if (newType !== 'custom') {
    searchForm.dateRange = getDateRangeByType(newType)
  } else {
    searchForm.dateRange = []
  }
})

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    productId: '1',
    productName: '支付产品A',
    merchantName: '商户A',
    orderCount: 1000,
    orderAmount: 50000.00,
    successCount: 980,
    successAmount: 49000.00,
    successRate: 0.98,
    feeAmount: 490.00,
    netAmount: 48510.00,
    remark: ''
  },
  {
    date: '2024-03-14',
    productId: '2',
    productName: '支付产品B',
    merchantName: '商户A',
    orderCount: 850,
    orderAmount: 42500.00,
    successCount: 825,
    successAmount: 41250.00,
    successRate: 0.97,
    feeAmount: 412.50,
    netAmount: 40837.50,
    remark: ''
  },
  {
    date: '2024-03-14',
    productId: '3',
    productName: '支付产品C',
    merchantName: '商户B',
    orderCount: 500,
    orderAmount: 75000.00,
    successCount: 485,
    successAmount: 72750.00,
    successRate: 0.97,
    feeAmount: 727.50,
    netAmount: 72022.50,
    remark: ''
  },
  {
    date: '2024-03-14',
    productId: '4',
    productName: '支付产品D',
    merchantName: '商户C',
    orderCount: 200,
    orderAmount: 30000.00,
    successCount: 180,
    successAmount: 27000.00,
    successRate: 0.90,
    feeAmount: 270.00,
    netAmount: 26730.00,
    remark: ''
  },
  {
    date: '2024-03-13',
    productId: '1',
    productName: '支付产品A',
    merchantName: '商户A',
    orderCount: 950,
    orderAmount: 47500.00,
    successCount: 920,
    successAmount: 46000.00,
    successRate: 0.97,
    feeAmount: 460.00,
    netAmount: 45540.00,
    remark: ''
  }
])

// 统计数据计算
const totalSuccessAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.successAmount, 0)
})

const totalFeeAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.feeAmount, 0)
})

const totalNetAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.netAmount, 0)
})

const totalSuccessCount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.successCount, 0)
})

const totalOrderCount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.orderCount, 0)
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
    
    // 在实际项目中，这里应该发送请求获取数据
    console.log('查询参数：', {
      ...searchForm,
      pageSize: pageSize.value,
      pageNum: currentPage.value,
      startDate: searchForm.dateRange && searchForm.dateRange[0],
      endDate: searchForm.dateRange && searchForm.dateRange[1]
    })
    
  }, 500)
}

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  loading.value = true
  // TODO: 调用接口获取数据
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置方法
const handleReset = () => {
  searchForm.productName = ''
  searchForm.merchantIds = []
  searchForm.timeType = 'all'
  searchForm.dateRange = []
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

// 获取成功率类型
const getSuccessRateType = (rate) => {
  if (rate >= 0.95) return 'success'
  if (rate >= 0.9) return 'warning'
  return 'danger'
}
</script>

<style scoped>
.product-stats-container {
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