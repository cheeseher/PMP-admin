<!-- 数据统计/支付通道统计 - 统计分析支付通道数据 -->
<template>
  <div class="channel-stats-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="供应商通道ID：">
            <el-input v-model="searchForm.channelId" placeholder="请输入供应商通道ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="通道名称：">
            <el-input v-model="searchForm.channelName" placeholder="请输入通道名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="通道编码：">
            <el-select v-model="searchForm.payType" placeholder="请选择通道编码" style="width: 168px" clearable>
              <el-option label="支付宝" value="alipay" />
              <el-option label="微信支付" value="wechat" />
              <el-option label="银联" value="unionpay" />
              <el-option label="快捷支付" value="quick" />
            </el-select>
          </el-form-item>
        </div>
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
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">通道统计列表</span>
        </div>
        <div class="right">
          <el-button :icon="Printer" plain>打印</el-button>
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
        <el-table-column prop="channelId" label="供应商通道ID" width="120" align="center" />
        <el-table-column prop="channelName" label="通道名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="payType" label="通道编码" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="getPayTypeType(row.payType)">{{ row.payType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="successAmount" label="成功金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell income">{{ formatAmount(row.successAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="总金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.orderAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="通道成本" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell outcome">{{ formatAmount(row.fee) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="successCount" label="成功单数" width="100" align="center">
          <template #default="{ row }">
            <span>{{ formatNumber(row.successCount) }}笔</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="总笔数" width="100" align="center">
          <template #default="{ row }">
            <span>{{ formatNumber(row.orderCount) }}笔</span>
          </template>
        </el-table-column>
        <el-table-column prop="successRate" label="成功率" width="100" align="center">
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
import { ref, reactive, onMounted, watch } from 'vue'
import { Search, Refresh, Download, Printer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCleanup } from '@/composables/useCleanup'
import dayjs from 'dayjs'

// 获取清理工具
const { safeTimeout } = useCleanup()

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
  channelId: '',
  channelName: '',
  payType: '',
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
    channelId: '1001',
    channelName: '微信支付直连',
    payType: 'wechat',
    orderCount: 1000,
    orderAmount: 50000.00,
    successCount: 980,
    successAmount: 49000.00,
    successRate: 0.98,
    fee: 490.00
  },
  {
    date: '2024-03-14',
    channelId: '1002',
    channelName: '支付宝直连',
    payType: 'alipay',
    orderCount: 850,
    orderAmount: 42500.00,
    successCount: 825,
    successAmount: 41250.00,
    successRate: 0.97,
    fee: 412.50
  },
  {
    date: '2024-03-14',
    channelId: '1003',
    channelName: '银联直连',
    payType: 'unionpay',
    orderCount: 500,
    orderAmount: 75000.00,
    successCount: 485,
    successAmount: 72750.00,
    successRate: 0.97,
    fee: 727.50
  },
  {
    date: '2024-03-14',
    channelId: '1004',
    channelName: '快捷支付',
    payType: 'quick',
    orderCount: 200,
    orderAmount: 30000.00,
    successCount: 180,
    successAmount: 27000.00,
    successRate: 0.90,
    fee: 270.00
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 状态映射
const getStatusType = (status) => {
  const map = {
    normal: 'success',
    maintenance: 'warning',
    closed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    normal: '正常',
    maintenance: '维护中',
    closed: '已关闭'
  }
  return map[status] || '未知'
}

// 支付类型标签类型
const getPayTypeType = (type) => {
  const map = {
    alipay: 'primary',
    wechat: 'success',
    unionpay: 'warning',
    quick: 'info'
  }
  return map[type] || 'info'
}

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  loading.value = true
  // 使用安全的timeout，会自动清理
  safeTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 1000)
}

// 组件挂载时加载数据
onMounted(() => {
  handleSearch()
})

// 重置方法
const handleReset = () => {
  searchForm.channelId = ''
  searchForm.channelName = ''
  searchForm.payType = ''
  searchForm.timeType = 'today'
  searchForm.dateRange = getDateRangeByType('today')
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
  safeTimeout(() => {
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
.channel-stats-container {
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

.amount-cell.income {
  color: #67c23a;
}

.amount-cell.outcome {
  color: #f56c6c;
}
</style> 