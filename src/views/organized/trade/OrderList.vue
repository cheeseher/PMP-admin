<template>
  <div class="order-list-container">
    <!-- 搜索筛选区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" inline class="multi-line-filter-form">
        <div class="filter-line">
          <el-form-item label="商户订单号：">
            <el-input v-model="searchForm.merchantOrderNo" placeholder="请输入商户订单号" clearable style="width: 220px" />
          </el-form-item>

          <el-form-item label="平台订单号：">
            <el-input v-model="searchForm.systemOrderNo" placeholder="请输入平台订单号" clearable style="width: 220px" />
          </el-form-item>
          
          <el-form-item label="支付产品：">
            <el-select 
              v-model="searchForm.paymentChannel" 
              placeholder="请选择" 
              clearable 
              filterable
              multiple 
              collapse-tags 
              collapse-tags-tooltip 
              style="width: 180px"
            >
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
          <el-form-item label="订单创建时间：">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD HH:mm"
              format="YYYY-MM-DD HH:mm"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              @change="handleDateRangeChange"
              style="width: 380px"
            />
          </el-form-item>
          
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
        </div>
        
        <div class="filter-line">
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
          <!-- 删除查询日期显示 -->
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
        
        <el-table-column prop="paymentChannel" label="支付产品" min-width="150">
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
        
        <el-table-column label="入账金额" min-width="120" align="right">
          <template #default="scope">
            <span :class="{ 'highlight-amount': scope.row.orderStatus === 'success' }">
              {{ formatAmount(calculateNetAmount(scope.row.orderAmount, scope.row.fee)) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="remark" label="备注" min-width="150" />
        
        <el-table-column prop="createTime" label="订单创建时间" min-width="180" />
        
        <el-table-column prop="completeTime" label="订单完成时间" min-width="180" />
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
  { value: '1112', label: '支付产品A' },
  { value: '1114', label: '支付产品B' },
  { value: '1115', label: '支付产品C' },
  { value: '1111', label: '支付产品D' }
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

// 日期快捷选项
const dateShortcuts = [
  {
    text: '1分钟',
    value: () => {
      const now = dayjs()
      const start = now.subtract(1, 'minute')
      return [start.toDate(), now.toDate()]
    }
  },
  {
    text: '5分钟',
    value: () => {
      const now = dayjs()
      const start = now.subtract(5, 'minute')
      return [start.toDate(), now.toDate()]
    }
  },
  {
    text: '15分钟',
    value: () => {
      const now = dayjs()
      const start = now.subtract(15, 'minute')
      return [start.toDate(), now.toDate()]
    }
  },
  {
    text: '30分钟',
    value: () => {
      const now = dayjs()
      const start = now.subtract(30, 'minute')
      return [start.toDate(), now.toDate()]
    }
  },
  {
    text: '1小时',
    value: () => {
      const now = dayjs()
      const start = now.subtract(1, 'hour')
      return [start.toDate(), now.toDate()]
    }
  },
  {
    text: '今天',
    value: () => {
      const now = dayjs()
      return [now.startOf('day').toDate(), now.endOf('day').toDate()]
    }
  },
  {
    text: '昨天',
    value: () => {
      const yesterday = dayjs().subtract(1, 'day')
      return [yesterday.startOf('day').toDate(), yesterday.endOf('day').toDate()]
    }
  },
  {
    text: '前天',
    value: () => {
      const beforeYesterday = dayjs().subtract(2, 'day')
      return [beforeYesterday.startOf('day').toDate(), beforeYesterday.endOf('day').toDate()]
    }
  },
  {
    text: '近三天',
    value: () => {
      const now = dayjs()
      const start = now.subtract(2, 'day').startOf('day')
      return [start.toDate(), now.endOf('day').toDate()]
    }
  },
  {
    text: '近七天',
    value: () => {
      const now = dayjs()
      const start = now.subtract(6, 'day').startOf('day')
      return [start.toDate(), now.endOf('day').toDate()]
    }
  },
  {
    text: '本周',
    value: () => {
      const now = dayjs()
      return [now.startOf('week').toDate(), now.endOf('day').toDate()]
    }
  },
  {
    text: '本月',
    value: () => {
      const now = dayjs()
      return [now.startOf('month').toDate(), now.endOf('day').toDate()]
    }
  }
]

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
  merchantOrderNo: '',
  systemOrderNo: '',
  paymentChannel: [],
  orderStatus: '',
  dateRange: [],
  createStartTime: '',
  createEndTime: '',
  showCallbacks: '',
  amountOperator: '',
  orderAmount: ''
})

// 设置初始的时间过滤器
onMounted(() => {
  const now = dayjs()
  const todayStart = now.startOf('day')
  const todayEnd = now.endOf('day')
  
  searchForm.dateRange = [todayStart.toDate(), todayEnd.toDate()]
  searchForm.createStartTime = todayStart.format('YYYY-MM-DD HH:mm')
  searchForm.createEndTime = todayEnd.format('YYYY-MM-DD HH:mm')
})

// 处理日期范围变化
const handleDateRangeChange = (val) => {
  if (val) {
    searchForm.createStartTime = dayjs(val[0]).format('YYYY-MM-DD HH:mm')
    searchForm.createEndTime = dayjs(val[1]).format('YYYY-MM-DD HH:mm')
  } else {
    searchForm.createStartTime = ''
    searchForm.createEndTime = ''
  }
}

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
    paymentChannel: '支付产品D',
    paymentChannelCode: '1111',
    orderAmount: 200.00,
    orderStatus: 'pending',
    isLateOrder: true,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '',
    createTime: '2024-06-03 10:15:20',
    completeTime: ''
  },
  {
    merchantOrderNo: 'MORD202406030002',
    systemOrderNo: 'PAY2024060300918274',
    paymentChannel: '支付产品H',
    paymentChannelCode: '1117',
    orderAmount: 200.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '超时关闭',
    createTime: '2024-06-03 10:18:30',
    completeTime: '2024-06-03 10:48:30'
  },
  {
    merchantOrderNo: 'MORD202406030003',
    systemOrderNo: 'PAY2024060300918275',
    paymentChannel: '支付产品I',
    paymentChannelCode: '1119',
    orderAmount: 300.00,
    orderStatus: 'success',
    isLateOrder: true,
    feeRate: '5.30%',
    fee: 15.90,
    remark: '',
    createTime: '2024-06-03 10:20:12',
    completeTime: '2024-06-03 10:21:11'
  },
  {
    merchantOrderNo: 'P202503280951...',
    systemOrderNo: 'MM03280951...',
    paymentChannelCode: '[1112]',
    paymentChannel: '支付产品A',
    orderAmount: 200.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '-',
    createTime: '2025/03/28 09:51:39',
    completeTime: '2025/03/28 10:21:39'
  },
  {
    merchantOrderNo: 'P202503280949...',
    systemOrderNo: 'MM03280949...',
    paymentChannelCode: '[1112]',
    paymentChannel: '支付产品A',
    orderAmount: 300.00,
    orderStatus: 'success',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 15.90,
    remark: '-',
    createTime: '2025/03/28 09:49:17',
    completeTime: '2025/03/28 09:51:00'
  },
  {
    merchantOrderNo: 'P202503280947...',
    systemOrderNo: 'MM03280947...',
    paymentChannelCode: '[1112]',
    paymentChannel: '支付产品A',
    orderAmount: 300.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 15.90,
    remark: '-',
    createTime: '2025/03/28 09:47:03',
    completeTime: '2025/03/28 10:17:03'
  },
  {
    merchantOrderNo: 'P202503280936...',
    systemOrderNo: 'MM03280936...',
    paymentChannelCode: '[1112]',
    paymentChannel: '支付产品A',
    orderAmount: 200.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '-',
    createTime: '2025/03/28 09:36:18',
    completeTime: '2025/03/28 10:06:18'
  },
  {
    merchantOrderNo: 'P202503280908...',
    systemOrderNo: 'MM03280908...',
    paymentChannelCode: '[1114]',
    paymentChannel: '支付产品B',
    orderAmount: 800.00,
    orderStatus: 'created',
    isLateOrder: false,
    feeRate: '3.20%',
    fee: 25.60,
    remark: '-',
    createTime: '2025/03/28 09:08:33',
    completeTime: '-'
  },
  {
    merchantOrderNo: 'P202503280905...',
    systemOrderNo: 'MM03280905...',
    paymentChannelCode: '[1112]',
    paymentChannel: '支付产品A',
    orderAmount: 200.00,
    orderStatus: 'success',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '-',
    createTime: '2025/03/28 09:05:38',
    completeTime: '2025/03/28 09:07:00'
  },
  {
    merchantOrderNo: 'MORD202406030004',
    systemOrderNo: 'PAY2024060300918276',
    paymentChannel: '支付产品H',
    paymentChannelCode: '1117',
    orderAmount: 300.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 15.90,
    remark: '手动关闭',
    createTime: '2024-06-03 10:22:30',
    completeTime: '2024-06-03 10:28:30'
  },
  {
    merchantOrderNo: 'MORD202406030005',
    systemOrderNo: 'PAY2024060300918277',
    paymentChannel: '支付产品E',
    paymentChannelCode: '1113',
    orderAmount: 200.00,
    orderStatus: 'closed',
    isLateOrder: false,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '超时关闭',
    createTime: '2024-06-03 10:25:18',
    completeTime: '2024-06-03 10:55:18'
  },
  {
    merchantOrderNo: 'MORD202406030006',
    systemOrderNo: 'PAY2024060300918278',
    paymentChannel: '支付产品G',
    paymentChannelCode: '1128',
    orderAmount: 800.00,
    orderStatus: 'created',
    isLateOrder: false,
    feeRate: '3.20%',
    fee: 25.60,
    remark: '',
    createTime: '2024-06-03 10:28:45',
    completeTime: ''
  },
  {
    merchantOrderNo: 'MORD202406030007',
    systemOrderNo: 'PAY2024060300918279',
    paymentChannel: '支付产品F',
    paymentChannelCode: '119',
    orderAmount: 200.00,
    orderStatus: 'success',
    isLateOrder: true,
    feeRate: '5.30%',
    fee: 10.60,
    remark: '',
    createTime: '2024-06-03 10:30:20',
    completeTime: '2024-06-03 10:31:15'
  }
])

// 处理选中行变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
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

// 计算入账金额
const calculateNetAmount = (orderAmount, fee) => {
  if (orderAmount === null || orderAmount === undefined || fee === null || fee === undefined) {
    return 0
  }
  return Number(orderAmount) - Number(fee)
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
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = []
    } else if (key === 'minAmount' || key === 'maxAmount') {
      searchForm[key] = null
    } else {
      searchForm[key] = ''
    }
  })
  searchForm.showCallbacks = ''
  searchForm.amountOperator = ''
  searchForm.orderAmount = ''
  
  // 设置默认时间为今天
  const now = dayjs()
  const todayStart = now.startOf('day')
  const todayEnd = now.endOf('day')
  
  searchForm.dateRange = [todayStart.toDate(), todayEnd.toDate()]
  searchForm.createStartTime = todayStart.format('YYYY-MM-DD HH:mm')
  searchForm.createEndTime = todayEnd.format('YYYY-MM-DD HH:mm')
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
