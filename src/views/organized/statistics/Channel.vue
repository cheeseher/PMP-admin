<template>
  <div class="channel-report-container">
    <!-- 搜索筛选区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="商户：" v-if="subAccounts.length > 0">
            <el-select v-model="searchForm.merchantId" placeholder="全部" style="width: 150px" clearable>
              <el-option label="全部" value="" />
              <el-option 
                v-for="account in subAccounts" 
                :key="account.id" 
                :label="`${account.productName} (${account.id})`" 
                :value="account.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="支付通道：">
            <el-select 
              v-model="searchForm.channels" 
              multiple 
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择支付通道" 
              clearable 
              style="width: 220px"
              filterable
            >
              <el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="时间：">
            <div class="time-filter-container">
              <el-select v-model="searchForm.timeType" placeholder="选择时间类型" style="width: 120px">
                <el-option label="全部" value="all" />
                <el-option label="自定义时间" value="custom" />
                <el-option label="今日" value="today" />
                <el-option label="昨日" value="yesterday" />
                <el-option label="最近7天" value="last7days" />
                <el-option label="本月" value="month" />
              </el-select>
              <el-date-picker
                v-if="searchForm.timeType === 'custom'"
                v-model="searchForm.timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 240px; margin-left: 8px;"
              />
            </div>
          </el-form-item>
          
          <div class="filter-buttons">
            <el-button plain @click="handleReset">重置</el-button>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
        </div>
      </el-form>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <div class="left">
          <span class="date-display">统计日期: {{ displayDateRange }}</span>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="merchantName" label="商户名称" min-width="120" fixed="left" />

        <el-table-column prop="channelName" label="通道名称" min-width="150" />
        <el-table-column prop="channelCode" label="通道编码" min-width="120">
          <template #default="scope">
            <div class="copy-wrapper">
              <span>{{ scope.row.channelCode }}</span>
              <el-tooltip content="复制编码" placement="top">
                <el-icon class="copy-icon" @click="copyContent(scope.row.channelCode)"><CopyDocument /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="订单总金额" min-width="120" align="right">
          <template #default="scope">
            <span>¥{{ formatAmount(scope.row.orderAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="successAmount" label="成功总金额" min-width="120" align="right">
          <template #default="scope">
            <span :class="scope.row.successAmount ? 'success-amount' : ''">{{ scope.row.successAmount ? '¥' + formatAmount(scope.row.successAmount) : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="merchantIncome" label="商户总收入" min-width="120" align="right">
          <template #default="scope">
            <span :class="scope.row.merchantIncome ? 'income-amount' : ''">{{ scope.row.merchantIncome ? '¥' + formatAmount(scope.row.merchantIncome) : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="merchantFee" label="商户手续费" min-width="120" align="right">
          <template #default="scope">
            <span :class="scope.row.merchantFee ? 'fee-amount' : ''">{{ scope.row.merchantFee ? '¥' + formatAmount(scope.row.merchantFee) : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalOrders" label="总订单数" min-width="100" align="center" />
        <el-table-column prop="successOrders" label="成功订单数" min-width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.successOrders || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="successRate" label="订单成功率" min-width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.successRate ? scope.row.successRate + '%' : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundOrders" label="补单订单数" min-width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.refundOrders || '0' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="补单金额" min-width="120" align="right">
          <template #default="scope">
            <span>{{ scope.row.refundAmount ? '¥' + formatAmount(scope.row.refundAmount) : '¥0.00' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Download, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { productList } from '@/data/productData'

const route = useRoute()

// 商户筛选
const subAccounts = ref([])
const currentLoginMerchantId = ref('')

// 获取当前登录商户的子账户
const fetchSubAccounts = () => {
  const merchantId = route.query.merchant || '2'
  if (!merchantId) return

  currentLoginMerchantId.value = merchantId
  
  // 查找当前商户
  const currentMerchant = productList.find(p => String(p.id) === String(merchantId))
  
  if (currentMerchant && currentMerchant.subAccounts && currentMerchant.subAccounts.length > 0) {
    // 获取子账户详情
    const accounts = []
    currentMerchant.subAccounts.forEach(subId => {
      const sub = productList.find(p => p.id === subId)
      if (sub) {
        accounts.push(sub)
      }
    })
    subAccounts.value = accounts
  } else {
    subAccounts.value = []
  }
}

// 根据时间类型获取日期范围
const getDateRangeByType = (type) => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const formattedToday = `${year}-${month}-${day}`
  
  switch (type) {
    case 'all':
      return []
    case 'today':
      return [formattedToday, formattedToday]
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const yYear = yesterday.getFullYear()
      const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0')
      const yDay = String(yesterday.getDate()).padStart(2, '0')
      const formattedYesterday = `${yYear}-${yMonth}-${yDay}`
      return [formattedYesterday, formattedYesterday]
    }
    case 'last7days': {
      const lastWeek = new Date(today)
      lastWeek.setDate(today.getDate() - 6)
      const lYear = lastWeek.getFullYear()
      const lMonth = String(lastWeek.getMonth() + 1).padStart(2, '0')
      const lDay = String(lastWeek.getDate()).padStart(2, '0')
      const formattedLastWeek = `${lYear}-${lMonth}-${lDay}`
      return [formattedLastWeek, formattedToday]
    }
    case 'month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const fYear = firstDay.getFullYear()
      const fMonth = String(firstDay.getMonth() + 1).padStart(2, '0')
      const fDay = String(firstDay.getDate()).padStart(2, '0')
      const formattedFirstDay = `${fYear}-${fMonth}-${fDay}`
      return [formattedFirstDay, formattedToday]
    }
    default:
      return []
  }
}

// 搜索表单
const searchForm = ref({
  channels: [],
  timeType: 'all',
  timeRange: []
})

// 通道选项
const channelOptions = ref([
  { label: 'UID支付-小额', value: 'uid_small' },
  { label: 'UID支付-中额', value: 'uid_medium' },
  { label: 'UID支付-大额', value: 'uid_large' },
  { label: 'UID支付-超大额', value: 'uid_xlarge' }
])

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    channelName: 'UID支付-小额',
    channelCode: '1001',
    merchantName: '商户B',
    orderAmount: 35352.00,
    successAmount: 1700.00,
    merchantIncome: 1609.90,
    merchantFee: 90.10,
    totalOrders: 141,
    successOrders: 6,
    successRate: 4.26,
    refundOrders: 0,
    refundAmount: 0.00
  },
  {
    channelName: 'UID支付-中额',
    channelCode: '1002',
    merchantName: '商户E',
    orderAmount: 14800.00,
    successAmount: null,
    merchantIncome: null,
    merchantFee: null,
    totalOrders: 27,
    successOrders: null,
    successRate: null,
    refundOrders: null,
    refundAmount: null
  },
  {
    channelName: 'UID支付-大额',
    channelCode: '1003',
    orderAmount: 27100.00,
    successAmount: null,
    merchantIncome: null,
    merchantFee: null,
    totalOrders: 27,
    successOrders: null,
    successRate: null,
    refundOrders: null,
    refundAmount: null
  },
  {
    channelName: 'UID支付-超大额',
    channelCode: '1004',
    orderAmount: 142800.00,
    successAmount: 3000.00,
    merchantIncome: 2910.00,
    merchantFee: 90.00,
    totalOrders: 38,
    successOrders: 1,
    successRate: 2.63,
    refundOrders: 0,
    refundAmount: 0.00
  },

])

// 选中行
const selectedRows = ref([])

// 处理多选
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 显示的日期范围
const displayDateRange = computed(() => {
  if (searchForm.value.timeType === 'custom' && searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
    return `${searchForm.value.timeRange[0]} ~ ${searchForm.value.timeRange[1]}`
  } else {
    const dateRange = getDateRangeByType(searchForm.value.timeType)
    return `${dateRange[0]} ~ ${dateRange[1]}`
  }
})

// 格式化金额
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return amount.toFixed(2)
}

// 搜索
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    ElMessage.success('查询成功')
    loading.value = false
  }, 500)
  // 实际应用中这里应该调用API获取数据
}

// 重置
const handleReset = () => {
  searchForm.value = {
    channels: [],
    timeType: 'all',
    timeRange: []
  }
  handleSearch()
}

// 导出
const handleExport = () => {
  if (selectedRows.value.length > 0) {
    ElMessage.success(`已导出 ${selectedRows.value.length} 条记录`)
  } else {
    ElMessage.success('已导出全部数据')
  }
  // 实际应用中这里应该调用API导出数据
}

// 监听时间变化
watch(() => searchForm.value.timeType, (newType) => {
  if (newType !== 'custom') {
    searchForm.value.timeRange = getDateRangeByType(newType)
  } else {
    searchForm.value.timeRange = []
  }
})

// 页面加载时执行一次搜索
onMounted(() => {
  fetchSubAccounts()
  // Set default date range
  searchForm.value.dateRange = getDateRangeByType('today')
  handleSearch()
})

// 监听商户ID变化 (Removed redundant route declaration)
watch(() => route.query.merchant, (newId) => {
  if (newId) {
    console.log('Merchant ID changed:', newId)
    fetchSubAccounts() // Also refresh sub-accounts if context changes
    handleSearch()
  }
})

// 复制内容
const copyContent = (content) => {
  navigator.clipboard.writeText(content)
    .then(() => {
      ElMessage.success('已复制编码')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}
</script>

<style scoped>
.channel-report-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  width: 100%;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
}

.filter-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
}

.filter-form :deep(.el-form-item__label) {
  padding-right: 8px;
  font-weight: normal;
}

/* 时间筛选容器样式 */
.time-filter-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  gap: 12px;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.date-display {
  font-size: 14px;
  color: #606266;
}

.table-card {
  margin-bottom: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
}

.table-toolbar .right {
  display: flex;
  align-items: center;
}

.success-amount {
  color: #F56C6C;
}

.income-amount {
  color: #FF9900;
}

.fee-amount {
  color: #F56C6C;
}

.copy-wrapper {
  display: flex;
  align-items: center;
}

.copy-wrapper .copy-icon {
  margin-left: 8px;
  cursor: pointer;
}
</style> 