<template>
  <div class="order-list-container">
    <!-- 搜索筛选区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" inline class="multi-line-filter-form">
        <div class="filter-line">
          <el-form-item label="商户/序列订单号：">
            <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable style="width: 220px" />
          </el-form-item>
          
          <el-form-item label="支付通道：">
            <el-select v-model="searchForm.paymentChannel" placeholder="请选择" clearable multiple collapse-tags collapse-tags-tooltip style="width: 180px">
              <el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="订单状态：">
            <el-select v-model="searchForm.orderStatus" placeholder="请选择" clearable style="width: 150px">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        
        <div class="filter-line">
          <el-form-item label="创建开始时间：">
            <el-date-picker
              v-model="searchForm.createStartTime"
              type="datetime"
              placeholder="选择日期时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          
          <el-form-item label="创建结束时间：">
            <el-date-picker
              v-model="searchForm.createEndTime"
              type="datetime"
              placeholder="选择日期时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          
          <el-form-item label="支付开始时间：">
            <el-date-picker
              v-model="searchForm.payStartTime"
              type="datetime"
              placeholder="选择日期时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          
          <el-form-item label="支付结束时间：">
            <el-date-picker
              v-model="searchForm.payEndTime"
              type="datetime"
              placeholder="选择日期时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              clearable
              style="width: 180px"
            />
          </el-form-item>
        </div>
        
        <div class="filter-line">
          <el-form-item label="订单金额：">
            <el-select v-model="searchForm.amountOperator" placeholder="请选择" clearable style="width: 100px">
              <el-option v-for="item in amountOperators" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-input v-model="searchForm.orderAmount" placeholder="请输入金额" clearable style="width: 120px; margin-left: 10px" />
          </el-form-item>
          
          <el-form-item label="隔日补单：">
            <el-select v-model="searchForm.showCallbacks" placeholder="请选择" clearable style="width: 100px">
              <el-option label="是" value="yes" />
              <el-option label="否" value="no" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="时间过滤：">
            <el-select v-model="searchForm.timeFilter" style="width: 100px" @change="handleTimeFilterChange">
              <el-option label="1分钟" value="1min" />
              <el-option label="5分钟" value="5min" />
              <el-option label="15分钟" value="15min" />
              <el-option label="30分钟" value="30min" />
              <el-option label="1小时" value="1hour" />
              <el-option label="今天" value="today" />
              <el-option label="昨天" value="yesterday" />
              <el-option label="前天" value="beforeYesterday" />
              <el-option label="近三天" value="last3days" />
              <el-option label="近七天" value="last7days" />
              <el-option label="本周" value="thisWeek" />
              <el-option label="本月" value="thisMonth" />
            </el-select>
          </el-form-item>
          
          <div class="filter-buttons">
            <el-button plain @click="handleReset">重置</el-button>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
        </div>
      </el-form>
    </el-card>
    
    <!-- 统计数据区域 -->
    <div class="summary-area">
      <div class="summary-item blue">
        <span class="label">订单总数233</span>
      </div>
      <div class="summary-item green">
        <span class="label">成功订单7</span>
      </div>
      <div class="summary-item orange">
        <span class="label">成功金额4700.00</span>
      </div>
      <div class="summary-item purple">
        <span class="label">商户手续费180.10</span>
      </div>
      <div class="summary-item cyan">
        <span class="label">商户收入4519.90</span>
      </div>
      <div class="summary-item red">
        <span class="label">成功率3.00%</span>
      </div>
    </div>
    
    <!-- 订单表格区域 -->
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <div class="left">
          <span class="date-display">查询日期: {{ displayDateRange }}</span>
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
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="merchantOrderNo" label="商户订单号" min-width="180">
          <template #default="scope">
            <div class="copy-cell">
              <span>{{ scope.row.merchantOrderNo }}</span>
              <el-tooltip content="复制" placement="top">
                <el-icon class="copy-icon" @click="copyContent(scope.row.merchantOrderNo)"><CopyDocument /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="systemOrderNo" label="平台订单号" min-width="180">
          <template #default="scope">
            <div class="copy-cell">
              <span>{{ scope.row.systemOrderNo }}</span>
              <el-tooltip content="复制" placement="top">
                <el-icon class="copy-icon" @click="copyContent(scope.row.systemOrderNo)"><CopyDocument /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="paymentChannel" label="支付通道" min-width="150">
          <template #default="scope">
            <div class="channel-cell">
              <el-tag type="info" size="small">{{ scope.row.paymentChannelCode }}</el-tag> 
              {{ scope.row.paymentChannel }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="orderAmount" label="订单金额" min-width="120" align="right">
          <template #default="scope">
            <span :class="{ 'highlight-amount': scope.row.orderStatus === 'success' }">
              {{ formatAmount(scope.row.orderAmount) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="orderStatus" label="订单状态" min-width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.orderStatus)" size="small">
              {{ statusOptions.find(item => item.value === scope.row.orderStatus)?.label || scope.row.orderStatus }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="isLateOrder" label="隔日补单" min-width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isLateOrder ? 'warning' : 'info'" size="small">
              {{ scope.row.isLateOrder ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="feeRate" label="商户费率" min-width="100" align="center" />
        
        <el-table-column prop="fee" label="手续费" min-width="100" align="right">
          <template #default="scope">
            <span>{{ formatAmount(scope.row.fee, false) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="remark" label="备注" min-width="150" />
        
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        
        <el-table-column prop="payTime" label="支付时间" min-width="180" />
        
        <el-table-column prop="paySuccessTime" label="支付成功时间" min-width="180" />
        
        <el-table-column prop="completeTime" label="完成时间" min-width="180" />
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, CopyDocument } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// 加载状态
const loading = ref(false)
// 选中的行
const selectedRows = ref([])

// 支付通道选项
const channelOptions = ref([
  { value: '1112', label: 'uid小额' },
  { value: '1114', label: 'uid大额' },
  { value: '1115', label: 'uid超大' },
  { value: '1111', label: '数字人民币' }
])

// 订单状态选项
const statusOptions = ref([
  { value: 'created', label: '订单创建' },
  { value: 'success', label: '交易成功' },
  { value: 'pending', label: '待付款' },
  { value: 'failed', label: '下单失败' },
  { value: 'canceled', label: '交易撤销' },
  { value: 'reorder_success', label: '补单成功' },
  { value: 'closed', label: '交易关闭' }
])

// 根据时间类型获取日期范围
const getDateRangeByType = (type) => {
  const now = dayjs()
  
  switch (type) {
    case '1min':
      return [now.subtract(1, 'minute').format('YYYY-MM-DD HH:mm'), now.format('YYYY-MM-DD HH:mm')]
    case '5min':
      return [now.subtract(5, 'minute').format('YYYY-MM-DD HH:mm'), now.format('YYYY-MM-DD HH:mm')]
    case '15min':
      return [now.subtract(15, 'minute').format('YYYY-MM-DD HH:mm'), now.format('YYYY-MM-DD HH:mm')]
    case '30min':
      return [now.subtract(30, 'minute').format('YYYY-MM-DD HH:mm'), now.format('YYYY-MM-DD HH:mm')]
    case '1hour':
      return [now.subtract(1, 'hour').format('YYYY-MM-DD HH:mm'), now.format('YYYY-MM-DD HH:mm')]
    case 'today':
      return [now.format('YYYY-MM-DD 00:00'), now.format('YYYY-MM-DD 23:59')]
    case 'yesterday': {
      const yesterday = now.subtract(1, 'day')
      return [yesterday.format('YYYY-MM-DD 00:00'), yesterday.format('YYYY-MM-DD 23:59')]
    }
    case 'beforeYesterday': {
      const beforeYesterday = now.subtract(2, 'day')
      return [beforeYesterday.format('YYYY-MM-DD 00:00'), beforeYesterday.format('YYYY-MM-DD 23:59')]
    }
    case 'last3days': {
      const threeDay = now.subtract(2, 'day')
      return [threeDay.format('YYYY-MM-DD 00:00'), now.format('YYYY-MM-DD 23:59')]
    }
    case 'last7days': {
      const sevenDay = now.subtract(6, 'day')
      return [sevenDay.format('YYYY-MM-DD 00:00'), now.format('YYYY-MM-DD 23:59')]
    }
    case 'thisWeek': {
      const firstDay = now.startOf('week')
      return [firstDay.format('YYYY-MM-DD 00:00'), now.format('YYYY-MM-DD 23:59')]
    }
    case 'thisMonth': {
      const firstDay = now.startOf('month')
      return [firstDay.format('YYYY-MM-DD 00:00'), now.format('YYYY-MM-DD 23:59')]
    }
    default:
      return ['', '']
  }
}

// 搜索表单
// 金额比较操作符选项
const amountOperators = ref([
  { value: '=', label: '等于' },
  { value: '>', label: '大于' },
  { value: '<', label: '小于' },
  { value: '>=', label: '大于等于' },
  { value: '<=', label: '小于等于' }
])

const searchForm = reactive({
  orderNo: '',
  paymentChannel: [],
  orderStatus: '',
  createStartTime: '',
  createEndTime: '',
  payStartTime: '',
  payEndTime: '',
  showCallbacks: '',
  timeFilter: 'today',
  amountOperator: '',
  orderAmount: ''
})

// 设置初始的时间过滤器
onMounted(() => {
  const [start, end] = getDateRangeByType('today')
  searchForm.createStartTime = start
  searchForm.createEndTime = end
  searchForm.timeFilter = 'today'
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 233
})

// 表格数据
const tableData = ref([
  {
    merchantOrderNo: 'MORD202406030001',
    systemOrderNo: 'PAY2024060300918273',
    paymentChannel: '数字人民币',
    paymentChannelCode: '1111',
    orderAmount: 200.00,
    orderStatus: 'pending',
    isLateOrder: true,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '',
    createTime: '2024-06-03 10:15:20',
    payTime: '',
    paySuccessTime: '',
    completeTime: ''
  },
  {
    merchantOrderNo: 'MORD202406030002',
    systemOrderNo: 'PAY2024060300918274',
    paymentChannel: '支付宝小额包',
    paymentChannelCode: '1117',
    orderAmount: 200.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '超时关闭',
    createTime: '2024-06-03 10:18:30',
    payTime: '',
    paySuccessTime: '',
    completeTime: '2024-06-03 10:48:30'
  },
  {
    merchantOrderNo: 'MORD202406030003',
    systemOrderNo: 'PAY2024060300918275',
    paymentChannel: '口令红包',
    paymentChannelCode: '1119',
    orderAmount: 300.00,
    orderStatus: 'success',
    isLateOrder: true,
    feeRate: '5.30%',
    fee: 15.90,
    remark: '',
    createTime: '2024-06-03 10:20:12',
    payTime: '2024-06-03 10:21:03',
    paySuccessTime: '2024-06-03 10:21:10',
    completeTime: '2024-06-03 10:21:11'
  },
  {
    merchantOrderNo: 'P202503280951...',
    systemOrderNo: 'MM03280951...',
    paymentChannelCode: '[1112]',
    paymentChannel: 'uid小额',
    orderAmount: 200.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '-',
    createTime: '2025/03/28 09:51:39',
    payTime: '-',
    paySuccessTime: '-',
    completeTime: '2025/03/28 10:21:39'
  },
  {
    merchantOrderNo: 'P202503280949...',
    systemOrderNo: 'MM03280949...',
    paymentChannelCode: '[1112]',
    paymentChannel: 'uid小额',
    orderAmount: 300.00,
    orderStatus: 'success',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 15.90,
    remark: '-',
    createTime: '2025/03/28 09:49:17',
    payTime: '2025/03/28 09:50:50',
    paySuccessTime: '1分31.890秒',
    completeTime: '2025/03/28 09:51:00'
  },
  {
    merchantOrderNo: 'P202503280947...',
    systemOrderNo: 'MM03280947...',
    paymentChannelCode: '[1112]',
    paymentChannel: 'uid小额',
    orderAmount: 300.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 15.90,
    remark: '-',
    createTime: '2025/03/28 09:47:03',
    payTime: '-',
    paySuccessTime: '-',
    completeTime: '2025/03/28 10:17:03'
  },
  {
    merchantOrderNo: 'P202503280936...',
    systemOrderNo: 'MM03280936...',
    paymentChannelCode: '[1112]',
    paymentChannel: 'uid小额',
    orderAmount: 200.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '-',
    createTime: '2025/03/28 09:36:18',
    payTime: '-',
    paySuccessTime: '-',
    completeTime: '2025/03/28 10:06:18'
  },
  {
    merchantOrderNo: 'P202503280908...',
    systemOrderNo: 'MM03280908...',
    paymentChannelCode: '[1114]',
    paymentChannel: 'uid大额',
    orderAmount: 800.00,
    orderStatus: 'created',
    isLateOrder: false,
    feeRate: '3.20%',
    fee: 25.60,
    remark: '-',
    createTime: '2025/03/28 09:08:33',
    payTime: '-',
    paySuccessTime: '-',
    completeTime: '-'
  },
  {
    merchantOrderNo: 'P202503280905...',
    systemOrderNo: 'MM03280905...',
    paymentChannelCode: '[1112]',
    paymentChannel: 'uid小额',
    orderAmount: 200.00,
    orderStatus: 'success',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '-',
    createTime: '2025/03/28 09:05:38',
    payTime: '2025/03/28 09:06:42',
    paySuccessTime: '59.982秒',
    completeTime: '2025/03/28 09:07:00'
  },
  {
    merchantOrderNo: 'MORD202406030004',
    systemOrderNo: 'PAY2024060300918276',
    paymentChannel: '支付宝小额包',
    paymentChannelCode: '1117',
    orderAmount: 300.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 15.90,
    remark: '手动关闭',
    createTime: '2024-06-03 10:22:30',
    payTime: '',
    paySuccessTime: '',
    completeTime: '2024-06-03 10:28:30'
  },
  {
    merchantOrderNo: 'MORD202406030005',
    systemOrderNo: 'PAY2024060300918277',
    paymentChannel: 'uid中额',
    paymentChannelCode: '1113',
    orderAmount: 200.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '超时关闭',
    createTime: '2024-06-03 10:25:18',
    payTime: '',
    paySuccessTime: '',
    completeTime: '2024-06-03 10:55:18'
  },
  {
    merchantOrderNo: 'MORD202406030006',
    systemOrderNo: 'PAY2024060300918278',
    paymentChannel: '云闪付',
    paymentChannelCode: '1128',
    orderAmount: 800.00,
    orderStatus: 'created',
    isLateOrder: false,
    feeRate: '3.20%',
    fee: 25.60,
    remark: '',
    createTime: '2024-06-03 10:28:45',
    payTime: '',
    paySuccessTime: '',
    completeTime: ''
  },
  {
    merchantOrderNo: 'MORD202406030007',
    systemOrderNo: 'PAY2024060300918279',
    paymentChannel: '零花钱',
    paymentChannelCode: '119',
    orderAmount: 200.00,
    orderStatus: 'success',
    isLateOrder: true,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '',
    createTime: '2024-06-03 10:30:20',
    payTime: '2024-06-03 10:31:05',
    paySuccessTime: '2024-06-03 10:31:12',
    completeTime: '2024-06-03 10:31:15'
  }
])

// 显示的日期范围
const displayDateRange = computed(() => {
  if (searchForm.createStartTime && searchForm.createEndTime) {
    return `${searchForm.createStartTime.split(' ')[0]} ~ ${searchForm.createEndTime.split(' ')[0]}`
  }
  return ''
})

// 处理选中行变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 处理时间过滤器变化
const handleTimeFilterChange = (value) => {
  const [start, end] = getDateRangeByType(value)
  searchForm.createStartTime = start
  searchForm.createEndTime = end
}

// 格式化金额
const formatAmount = (amount, includeCurrency = true) => {
  if (amount === null || amount === undefined) return includeCurrency ? '¥0.00' : '0.00'
  const formattedAmount = Number(amount).toFixed(2)
  return includeCurrency ? `¥${formattedAmount}` : formattedAmount
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    'created': 'info',
    'success': 'success',
    'pending': 'warning',
    'failed': 'danger',
    'canceled': 'info',
    'reorder_success': 'success',
    'closed': 'info'
  }
  return typeMap[status] || 'info'
}

// 复制内容
const copyContent = (content) => {
  try {
    navigator.clipboard.writeText(content)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
    console.error('复制失败:', error)
  }
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
  const timeFilter = searchForm.timeFilter
  Object.keys(searchForm).forEach(key => {
    if (key !== 'timeFilter') {
      if (Array.isArray(searchForm[key])) {
        searchForm[key] = []
      } else if (key === 'minAmount' || key === 'maxAmount') {
        searchForm[key] = null
      } else {
        searchForm[key] = ''
      }
    }
  })
  searchForm.timeFilter = timeFilter
  searchForm.showCallbacks = ''
  searchForm.amountOperator = ''
  searchForm.orderAmount = ''
  
  // 重置时间
  const [start, end] = getDateRangeByType(timeFilter)
  searchForm.createStartTime = start
  searchForm.createEndTime = end
}

// 导出
const handleExport = () => {
  if (selectedRows.value.length > 0) {
    ElMessage.success(`导出 ${selectedRows.value.length} 条记录`)
  } else {
    ElMessage.success('导出全部数据')
  }
  // 实际应用中这里应该调用API导出数据
}

// 分页
const handleSizeChange = (val) => {
  pagination.pageSize = val
  // 这里应该重新获取数据
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  // 这里应该重新获取数据
}
</script>

<style scoped>
.order-list-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.multi-line-filter-form {
  width: 100%;
}

.multi-line-filter-form .filter-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
  row-gap: 12px;
}

.multi-line-filter-form .filter-line:last-child {
  margin-bottom: 0;
}

.multi-line-filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 16px;
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
  margin-left: auto;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

/* 统计区域样式 */
.summary-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.summary-item {
  padding: 10px 15px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  flex: 1;
  min-width: 150px;
  text-align: center;
}

.summary-item.blue {
  background-color: #409EFF;
}

.summary-item.green {
  background-color: #67C23A;
}

.summary-item.orange {
  background-color: #E6A23C;
}

.summary-item.purple {
  background-color: #9370DB;
}

.summary-item.cyan {
  background-color: #00CED1;
}

.summary-item.red {
  background-color: #F56C6C;
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

.date-display {
  font-size: 14px;
  color: #606266;
}

.copy-cell {
  display: flex;
  align-items: center;
}

.copy-icon {
  margin-left: 5px;
  font-size: 14px;
  color: #909399;
  cursor: pointer;
}

.copy-icon:hover {
  color: #409EFF;
}

.channel-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.highlight-amount {
  color: #67C23A;
  font-weight: bold;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
