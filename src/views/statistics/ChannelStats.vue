<!-- 数据统计/支付通道统计 - 统计分析支付通道数据 -->
<template>
  <div class="statistics-channel">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-card">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="通道ID">
            <el-input v-model="searchForm.channelId" placeholder="请输入通道ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="通道名称">
            <el-input v-model="searchForm.channelName" placeholder="请输入通道名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="支付类型">
            <el-select v-model="searchForm.payType" placeholder="请选择支付类型" style="width: 168px" clearable>
              <el-option label="支付宝" value="alipay" />
              <el-option label="微信支付" value="wechat" />
              <el-option label="银联" value="unionpay" />
              <el-option label="快捷支付" value="quick" />
            </el-select>
          </el-form-item>
          <el-form-item label="通道状态">
            <el-select v-model="searchForm.status" placeholder="请选择通道状态" style="width: 168px" clearable>
              <el-option label="正常" value="normal" />
              <el-option label="维护中" value="maintenance" />
              <el-option label="已关闭" value="closed" />
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

    <!-- 统计信息区域 -->
    <div class="stat-tags">
      <el-tag type="success" effect="plain">总通道数量：{{ formatNumber(20) }}</el-tag>
      <el-tag type="success" effect="plain">正常通道：{{ formatNumber(15) }}</el-tag>
      <el-tag type="success" effect="plain">维护通道：{{ formatNumber(3) }}</el-tag>
      <el-tag type="success" effect="plain">已关闭通道：{{ formatNumber(2) }}</el-tag>
      <el-tag type="success" effect="plain">总订单笔数：{{ formatNumber(1000) }}笔</el-tag>
      <el-tag type="success" effect="plain">成功订单金额：{{ formatAmount(4900000) }}</el-tag>
    </div>

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
        <el-table-column type="selection" width="55" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="channelId" label="通道ID" width="80" />
        <el-table-column prop="channelName" label="通道名称" width="150" />
        <el-table-column prop="payType" label="支付类型" width="120" />
        <el-table-column prop="status" label="通道状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
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
        <el-table-column prop="fee" label="手续费" width="130">
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
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Download, Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useCleanup } from '@/utils/cleanupUtils'

// 获取清理工具
const { safeTimeout } = useCleanup()

// 搜索表单数据
const searchForm = reactive({
  channelId: '',
  channelName: '',
  payType: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    channelId: '001',
    channelName: '支付宝直连',
    payType: '支付宝',
    status: 'normal',
    orderCount: 1000,
    orderAmount: 50000.00,
    successCount: 980,
    successAmount: 49000.00,
    successRate: 0.98,
    fee: 245.00,
    remark: ''
  },
  {
    date: '2024-03-14',
    channelId: '002',
    channelName: '微信支付',
    payType: '微信支付',
    status: 'normal',
    orderCount: 850,
    orderAmount: 42500.00,
    successCount: 825,
    successAmount: 41250.00,
    successRate: 0.97,
    fee: 206.25,
    remark: ''
  },
  {
    date: '2024-03-14',
    channelId: '003',
    channelName: '银联渠道',
    payType: '银联',
    status: 'maintenance',
    orderCount: 500,
    orderAmount: 75000.00,
    successCount: 485,
    successAmount: 72750.00,
    successRate: 0.97,
    fee: 363.75,
    remark: '系统维护中，预计恢复时间20:00'
  },
  {
    date: '2024-03-14',
    channelId: '004',
    channelName: '快捷支付',
    payType: '快捷支付',
    status: 'closed',
    orderCount: 200,
    orderAmount: 30000.00,
    successCount: 180,
    successAmount: 27000.00,
    successRate: 0.90,
    fee: 135.00,
    remark: '通道暂时关闭'
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

// 搜索方法
const handleSearch = () => {
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
  searchForm.status = ''
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
.statistics-channel {
  padding: 15px;
}

.search-card {
  margin-bottom: 15px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.stat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
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