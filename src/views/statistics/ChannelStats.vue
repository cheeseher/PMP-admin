<!-- 数据统计/支付通道统计 - 统计分析支付通道数据 -->
<template>
  <div class="channel-stats-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="multi-line-filter-form">
        <div class="filter-grid">
          <el-form-item label="时间筛选：">
            <div class="time-filter-container">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="datetimerange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 420px"
                :shortcuts="dateShortcuts"
              />
            </div>
          </el-form-item>
          <el-form-item label="供应商通道ID：">
            <el-input v-model="searchForm.channelId" placeholder="请输入供应商通道ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="通道名称：">
            <el-input v-model="searchForm.channelName" placeholder="请输入通道名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="通道编码：">
            <el-input v-model="searchForm.payType" placeholder="请输入通道编码" style="width: 168px" clearable />
          </el-form-item>
          <div class="filter-buttons">
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
          </div>
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
          <div class="stat-header">总通道成本</div>
          <div class="stat-body">
            <el-icon :size="22"><Discount /></el-icon>
            <span class="stat-value">{{ formatAmount(totalFee) }}</span>
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
          <span class="table-title">通道统计列表</span>
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
        <el-table-column prop="channelId" label="供应商通道ID" width="120" align="center" />
        <el-table-column prop="channelName" label="通道名称" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.supplier }}|{{ row.channelName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payType" label="通道编码" width="100" align="center" />
        <el-table-column prop="successAmount" label="成功收款金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.successAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="通道成本" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.fee) }}</span>
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
import { Search, Refresh, Download, Money, Discount, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCleanup } from '@/composables/useCleanup'
import dayjs from 'dayjs'

// 获取清理工具
const { safeTimeout } = useCleanup()

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今日',
    value: () => {
      const today = new Date()
      const start = new Date(today.setHours(0, 0, 0, 0))
      const end = new Date()
      return [start, end]
    }
  },
  {
    text: '昨日',
    value: () => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      const start = new Date(yesterday.setHours(0, 0, 0, 0))
      const end = new Date(yesterday.setHours(23, 59, 59, 999))
      return [start, end]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      return [start, end]
    }
  },
  {
    text: '5分钟',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 60 * 1000 * 5)
      return [start, end]
    }
  },
  {
    text: '10分钟',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 60 * 1000 * 10)
      return [start, end]
    }
  },
  {
    text: '30分钟',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 60 * 1000 * 30)
      return [start, end]
    }
  },
  {
    text: '1小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000)
      return [start, end]
    }
  },
  {
    text: '3小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 3)
      return [start, end]
    }
  },
  {
    text: '24小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 24)
      return [start, end]
    }
  }
]

// 搜索表单数据
const searchForm = reactive({
  channelId: '',
  channelName: '',
  payType: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    channelId: '1',
    supplier: '渠道A',
    channelName: '通道A',
    payType: 'channel_a',
    successCount: 980,
    orderCount: 1000,
    successAmount: 49000.00,
    successRate: 0.98,
    fee: 490.00
  },
  {
    channelId: '2',
    supplier: '渠道B',
    channelName: '通道B',
    payType: 'channel_b',
    successCount: 825,
    orderCount: 850,
    successAmount: 41250.00,
    successRate: 0.97,
    fee: 412.50
  },
  {
    channelId: '3',
    supplier: '渠道C',
    channelName: '通道C',
    payType: 'channel_c',
    successCount: 485,
    orderCount: 500,
    successAmount: 72750.00,
    successRate: 0.97,
    fee: 727.50
  },
  {
    channelId: '4',
    supplier: '渠道D',
    channelName: '通道D',
    payType: 'channel_d',
    successCount: 180,
    orderCount: 200,
    successAmount: 27000.00,
    successRate: 0.90,
    fee: 270.00
  }
])

// 统计数据计算
const totalSuccessAmount = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.successAmount, 0)
})

const totalFee = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.fee, 0)
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
</script>

<style scoped>
.channel-stats-container {
  padding: 16px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.filter-container {
  overflow: hidden;
}

.multi-line-filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 0;
  display: flex;
  align-items: center;
}

.multi-line-filter-form .el-form-item__label {
  line-height: 32px;
  white-space: nowrap;
  width: auto !important;
  padding-right: 6px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

/* 统计卡片样式 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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