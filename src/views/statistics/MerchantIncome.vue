<!-- 数据统计/商户收款统计 - 统计商户收入数据 -->
<template>
  <div class="merchant-income-container">
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
          <el-form-item label="商户：">
            <el-select
              v-model="searchForm.merchantIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择商户"
              style="width: 220px"
              clearable
              filterable
            >
              <el-option
                v-for="item in merchantOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
          <div class="stat-header">总补单金额</div>
          <div class="stat-body">
            <el-icon :size="22"><Plus /></el-icon>
            <span class="stat-value">{{ formatAmount(totalSupplementAmount) }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总成功收款金额</div>
          <div class="stat-body">
            <el-icon :size="22"><Money /></el-icon>
            <span class="stat-value">{{ formatAmount(totalAmount) }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总手续费</div>
          <div class="stat-body">
            <el-icon :size="22"><Discount /></el-icon>
            <span class="stat-value">{{ formatAmount(totalFee) }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总入账金额</div>
          <div class="stat-body">
            <el-icon :size="22"><Wallet /></el-icon>
            <span class="stat-value">{{ formatAmount(totalAfterTaxAmount) }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="compact-card-content">
          <div class="stat-header">总成功单数</div>
          <div class="stat-body">
            <el-icon :size="22"><Document /></el-icon>
            <span class="stat-value">{{ formatNumber(totalSuccessCount) }}笔</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">商户收款列表</span>
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
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="merchantId" label="商户ID" width="120" align="center" />
        <el-table-column prop="merchantAccount" label="商户账户" width="150" align="center" />
        <el-table-column prop="merchantName" label="商户名称" min-width="150" show-overflow-tooltip align="center" />
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column prop="successAmount" label="成功收款金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.successAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="supplementAmount" label="补单金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.supplementAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总出款金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.fee) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="afterTaxAmount" label="入账金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.afterTaxAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="successCount" label="成功单数" width="120" align="center">
          <template #default="{ row }">
            <span>{{ formatNumber(row.successCount) }}笔</span>
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { Search, Refresh, Download, Money, Plus, Discount, Wallet, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

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
    case 'last7days':
      return [today.subtract(6, 'day').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
    default:
      return []
  }
}

// 商户选项数据
const merchantOptions = ref([
  { value: 'M001', label: '商户A' },
  { value: 'M002', label: '商户B' },
  { value: 'M003', label: '商户C' }
])

// 搜索表单数据
const searchForm = reactive({
  merchantIds: [],
  timeType: 'all',
  dateRange: []
})

// 监听时间类型变化，自动设置日期范围
watch(() => searchForm.timeType, (newType) => {
  if (newType !== 'custom') {
    searchForm.dateRange = getDateRangeByType(newType)
  } else {
    // 切换到自定义时，清空日期范围以便用户选择
    searchForm.dateRange = []
  }
})

// 表格数据
const tableData = ref([
  {
    merchantId: '1',
    merchantAccount: 'account001',
    merchantName: '商户A',
    date: '2024-03-14',
    successAmount: 50000.00,
    supplementAmount: 1000.00,
    totalAmount: 50000.00,
    fee: 255.00,
    afterTaxAmount: 50745.00,
    successCount: 980
  },
  {
    merchantId: '2',
    merchantAccount: 'account002',
    merchantName: '商户B',
    date: '2024-03-14',
    successAmount: 48000.00,
    supplementAmount: 800.00,
    totalAmount: 48000.00,
    fee: 244.00,
    afterTaxAmount: 48556.00,
    successCount: 940
  },
  {
    merchantId: '3',
    merchantAccount: 'account003',
    merchantName: '商户C',
    date: '2024-03-14',
    successAmount: 45000.00,
    supplementAmount: 500.00,
    totalAmount: 45000.00,
    fee: 227.50,
    afterTaxAmount: 45272.50,
    successCount: 880
  }
])

// 统计数据计算
const totalSuccessAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.successAmount, 0)
})

const totalSupplementAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.supplementAmount, 0)
})

const totalAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.totalAmount, 0)
})

const totalFee = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.fee, 0)
})

const totalAfterTaxAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.afterTaxAmount, 0)
})

const totalSuccessCount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.successCount, 0)
})

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 初始化表格数据
const initTableData = () => {
  // 模拟异步获取数据
  loading.value = true
  tableData.value = [
    // 这里是示例数据
    {
      date: '2024-03-14',
      merchantId: '1',
      merchantName: '商户A',
      payType: '支付宝',
      orderCount: 120,
      orderAmount: 56000,
      successCount: 115,
      successAmount: 53000,
      successRate: 0.958,
      fee: 265,
      remark: ''
    }
    // 更多数据...
  ]
  loading.value = false
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
  searchForm.merchantIds = []
  searchForm.timeType = 'all'
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
.merchant-income-container {
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
  grid-template-columns: repeat(5, 1fr);
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
@media (max-width: 1600px) {
  .stat-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

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