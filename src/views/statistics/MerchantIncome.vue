<!-- 数据统计/商户收款统计 - 统计商户收入数据 -->
<template>
  <div class="merchant-income-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="商户ID：">
            <el-input v-model="searchForm.merchantId" placeholder="请输入商户ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户名称：">
            <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="支付类型：">
            <el-select v-model="searchForm.payType" placeholder="请选择支付类型" style="width: 168px" clearable>
              <el-option label="支付宝" value="alipay" />
              <el-option label="微信支付" value="wechat" />
              <el-option label="银联" value="unionpay" />
              <el-option label="快捷支付" value="quick" />
            </el-select>
          </el-form-item>
          <el-form-item label="订单状态：">
            <el-select v-model="searchForm.orderStatus" placeholder="请选择订单状态" style="width: 168px" clearable>
              <el-option label="支付成功" value="success" />
              <el-option label="支付失败" value="failed" />
              <el-option label="待支付" value="pending" />
              <el-option label="已退款" value="refunded" />
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
          <el-button type="primary" :icon="Search" @click="handleSearch" :loading="loading">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">商户收款列表</span>
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
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="merchantId" label="商户ID" width="120" align="center" />
        <el-table-column prop="merchantAccount" label="商户账户" width="150" align="center" />
        <el-table-column prop="merchantName" label="商户名" min-width="150" show-overflow-tooltip align="center" />
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column prop="successAmount" label="成功收款金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell income">{{ formatAmount(row.successAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="supplementAmount" label="补单金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell income">{{ formatAmount(row.supplementAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总收款" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell income">{{ formatAmount(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell outcome">{{ formatAmount(row.fee) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="afterTaxAmount" label="税后金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell income">{{ formatAmount(row.afterTaxAmount) }}</span>
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
import { ref, reactive, watch } from 'vue'
import { Search, Refresh, Download, Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
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
  merchantId: '',
  merchantName: '',
  payType: '',
  orderStatus: '',
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
    merchantId: 'M001',
    merchantAccount: 'test001',
    merchantName: '测试商户',
    date: '2024-03-14',
    successAmount: 50000.00,
    supplementAmount: 1000.00,
    totalAmount: 51000.00,
    fee: 255.00,
    afterTaxAmount: 50745.00,
    successCount: 980
  },
  {
    merchantId: 'M002',
    merchantAccount: 'test002',
    merchantName: '示例商户',
    date: '2024-03-14',
    successAmount: 48000.00,
    supplementAmount: 800.00,
    totalAmount: 48800.00,
    fee: 244.00,
    afterTaxAmount: 48556.00,
    successCount: 940
  },
  {
    merchantId: 'M003',
    merchantAccount: 'test003',
    merchantName: '演示商户',
    date: '2024-03-14',
    successAmount: 45000.00,
    supplementAmount: 500.00,
    totalAmount: 45500.00,
    fee: 227.50,
    afterTaxAmount: 45272.50,
    successCount: 880
  }
])

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
      merchantId: 'M001',
      merchantName: '测试商户',
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
  searchForm.merchantId = ''
  searchForm.merchantName = ''
  searchForm.payType = ''
  searchForm.orderStatus = ''
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