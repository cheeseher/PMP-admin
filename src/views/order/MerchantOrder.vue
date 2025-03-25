<!-- 订单管理/商户订单管理 - 展示和管理商户的订单列表 -->
<template>
  <div class="order-merchant">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="multi-line-filter-form">
        <!-- 第一行筛选项 -->
        <div class="filter-line">
          <el-form-item label="日期范围：">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item label="今日：">
            <el-select v-model="searchForm.today" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部" value="all" />
              <el-option label="今日" value="today" />
              <el-option label="昨日" value="yesterday" />
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="平台单号：">
            <el-input v-model="searchForm.orderNo" placeholder="请输入平台单号" style="width: 220px" clearable />
          </el-form-item>
          
          <el-form-item label="商户单号：">
            <el-input v-model="searchForm.merchantOrderNo" placeholder="请输入商户单号" style="width: 220px" clearable />
          </el-form-item>
        </div>

        <!-- 第二行筛选项 -->
        <div class="filter-line">
          <el-form-item label="商户ID：">
            <el-input v-model="searchForm.merchantId" placeholder="请输入商户ID" style="width: 168px" clearable />
          </el-form-item>
          
          <el-form-item label="商户账号：">
            <el-input v-model="searchForm.merchantName" placeholder="请输入商户账号" style="width: 168px" clearable />
          </el-form-item>
          
          <el-form-item label="上游单号：">
            <el-input v-model="searchForm.upstreamOrderNo" placeholder="请输入上游单号" style="width: 220px" clearable />
          </el-form-item>
          
          <el-form-item label="上游通道名称：">
            <el-select v-model="searchForm.upstream" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部上游" value="all" />
              <el-option label="上游A" value="A" />
              <el-option label="上游B" value="B" />
              <el-option label="上游C" value="C" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 第三行筛选项 -->
        <div class="filter-line">
          <el-form-item label="上游通道编码：">
            <el-input v-model="searchForm.upstreamChannelCode" placeholder="请输入上游通道编码" style="width: 168px" clearable />
          </el-form-item>
          
          <el-form-item label="通道编码：">
            <el-input v-model="searchForm.channelCode" placeholder="请输入通道编码" style="width: 168px" clearable />
          </el-form-item>
          
          <el-form-item label="支付产品名称：">
            <el-select v-model="searchForm.productName" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部产品" value="all" />
              <el-option label="支付宝" value="alipay" />
              <el-option label="微信支付" value="wxpay" />
              <el-option label="银联" value="unionpay" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="支付产品编码：">
            <el-input v-model="searchForm.productCode" placeholder="请输入支付产品编码" style="width: 168px" clearable />
          </el-form-item>
        </div>

        <!-- 第四行筛选项 -->
        <div class="filter-line">
          <el-form-item label="推送状态：">
            <el-select v-model="searchForm.pushStatus" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部状态" value="all" />
              <el-option label="已推送" value="true" />
              <el-option label="未推送" value="false" />
            </el-select>
          </el-form-item>
          
          <!-- 操作按钮组，靠右对齐 -->
          <div class="filter-buttons">
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 统计信息区域 -->
    <div class="stat-tags">
      <el-tag type="success" effect="plain">总服务费：{{ formatAmount(5000) }}</el-tag>
      <el-tag type="success" effect="plain">成功笔数：5000</el-tag>
      <el-tag type="success" effect="plain">总利润金额：{{ formatAmount(5000) }}</el-tag>
      <el-tag type="success" effect="plain">总利润率：0.00%</el-tag>
      <el-tag type="success" effect="plain">成功总额：{{ formatAmount(5000) }}</el-tag>
      <el-tag type="success" effect="plain">成交笔数：5000</el-tag>
      <el-tag type="success" effect="plain">升序服务费：{{ formatAmount(5000) }}</el-tag>
      <el-tag type="success" effect="plain">升序利润：{{ formatAmount(5000) }}</el-tag>
      <el-tag type="success" effect="plain">下游渠道费：{{ formatAmount(5000) }}</el-tag>
      <el-tag type="success" effect="plain">上游渠道费：{{ formatAmount(0) }}</el-tag>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Plus">新增订单</el-button>
          <el-button :icon="Delete" plain :disabled="!hasSelected">批量删除</el-button>
          <el-button :icon="Download" plain @click="handleExport">导出</el-button>
          <el-button :icon="Printer" plain>打印</el-button>
        </div>
        <div class="right">
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" />
          </el-tooltip>
        </div>
      </div>

      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="merchantId" label="商户ID" width="80" fixed="left" />
        <el-table-column prop="merchantName" label="商户账号" width="120" />
        <el-table-column prop="upstream" label="上游通道名称" width="120" />
        <el-table-column prop="channelCode" label="通道编码" width="100" />
        <el-table-column prop="productName" label="支付产品名称" width="120" />
        <el-table-column prop="productCode" label="支付产品编码" width="100" />
        <el-table-column prop="orderAmount" label="订单金额" width="100" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ formatAmount(scope.row.orderAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="订单创建时间" width="150" />
        <el-table-column prop="completeTime" label="订单完成时间" width="150" />
        <el-table-column prop="pushStatus" label="推送状态" width="90" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.pushStatus ? 'success' : 'info'" 
              size="small"
            >
              {{ scope.row.pushStatus ? '已推送' : '未推送' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pushResult" label="推送结果" width="90" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.pushResult === 'success' ? 'success' : scope.row.pushResult === 'failed' ? 'danger' : 'info'" 
              size="small"
            >
              {{ scope.row.pushResult === 'success' ? '成功' : scope.row.pushResult === 'failed' ? '失败' : '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="平台单号" width="120" />
        <el-table-column prop="merchantOrderNo" label="商户单号" width="120" />
        <el-table-column prop="isNextDay" label="隔日补单" width="90" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.isNextDay ? 'warning' : 'info'" 
              size="small"
            >
              {{ scope.row.isNextDay ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="receiveAmount" label="入账金额" width="100" align="right">
          <template #default="scope">
            <span class="amount-cell income">{{ formatAmount(scope.row.receiveAmount || scope.row.orderAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="100" align="right">
          <template #default="scope">
            <span class="amount-cell outcome">{{ formatAmount(scope.row.fee || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="channelCost" label="通道成本" width="100" align="right">
          <template #default="scope">
            <span class="amount-cell outcome">{{ formatAmount(scope.row.channelCost || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="upstreamOrderNo" label="上游单号" width="120" />
        <el-table-column prop="upstreamChannelCode" label="上游通道编码" width="120" />
        <el-table-column prop="remarkInfo" label="备注" min-width="150" />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleOperate(scope.row)">操作</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, Printer, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  today: 'today',
  dateRange: ['2025-03-24', '2025-03-24'],
  orderNo: '',
  merchantOrderNo: '',
  merchantId: '',
  merchantName: '',
  upstreamOrderNo: '',
  productName: '',
  productCode: '',
  upstream: '',
  upstreamChannelCode: '',
  channelCode: '',
  pushStatus: ''
})

// 表格数据
const tableData = ref([
  {
    merchantId: '1',
    merchantName: '测试账号',
    upstream: '新吓你',
    channelCode: 'wx_h5',
    orderNo: '102',
    merchantOrderNo: 'MO20230314001',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '100.00',
    receiveAmount: '98.50',
    fee: '1.50',
    channelCost: '0.80',
    upstreamOrderNo: 'UP20230314001',
    upstreamChannelCode: 'wxpay_001',
    pushStatus: true,
    pushResult: 'success',
    isNextDay: false,
    orderStatus: 'success',
    createTime: '2023-03-14 17:31:32',
    completeTime: '2025-03-22 13:20:31',
    remarkInfo: '正常订单'
  },
  {
    merchantId: '2',
    merchantName: '商户二号',
    upstream: '通道A',
    channelCode: 'alipay_h5',
    orderNo: '103',
    merchantOrderNo: 'MO20240228001',
    productCode: '9999',
    productName: '支付宝产品',
    orderAmount: '200.00',
    receiveAmount: '196.00',
    fee: '4.00',
    channelCost: '2.60',
    upstreamOrderNo: 'UP20240228001',
    upstreamChannelCode: 'alipay_001',
    pushStatus: true,
    pushResult: 'failed',
    isNextDay: true,
    orderStatus: 'success',
    createTime: '2024-02-28 10:25:16',
    completeTime: '2024-02-28 10:30:45',
    remarkInfo: '补单'
  },
  {
    merchantId: '3',
    merchantName: '测试三号',
    upstream: '通道B',
    channelCode: 'union_qr',
    orderNo: '104',
    merchantOrderNo: 'MO20240331001',
    productCode: '7777',
    productName: '银联产品',
    orderAmount: '300.00',
    receiveAmount: '294.00',
    fee: '6.00',
    channelCost: '3.50',
    upstreamOrderNo: 'UP20240331001',
    upstreamChannelCode: 'union_002',
    pushStatus: false,
    pushResult: '',
    isNextDay: false,
    orderStatus: 'pending',
    createTime: '2024-03-31 14:22:10',
    completeTime: '',
    remarkInfo: '待处理'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 356
})

// 状态映射
const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    processing: 'info',
    success: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '待支付',
    processing: '处理中',
    success: '交易成功',
    failed: '交易失败'
  }
  return map[status] || '未知状态'
}

// 处理操作按钮点击
const handleOperate = (row) => {
  ElMessageBox.alert(`正在查看订单：${row.orderNo}`, '订单操作', {
    confirmButtonText: '确定'
  })
}

// 分页事件处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  // 这里应该调用获取数据的方法
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  // 这里应该调用获取数据的方法
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

// 处理导出功能
const handleExport = () => {
  ElMessage.success('订单数据导出中，请稍后...')
}

// 处理查询
const handleSearch = () => {
  ElMessage.success('正在查询数据，请稍后...')
  // 实际项目中这里应该调用API接口获取数据
}

// 重置搜索条件
const handleReset = () => {
  // 重置搜索表单
  Object.keys(searchForm).forEach(key => {
    if (key === 'today') {
      searchForm[key] = 'today'
    } else if (key === 'dateRange') {
      searchForm[key] = ['2025-03-24', '2025-03-24']
    } else {
      searchForm[key] = ''
    }
  })
  ElMessage.success('搜索条件已重置')
}

// 处理选择变化
const handleSelectionChange = (selectedRows) => {
  // 实现选择变化后的逻辑
}

// 处理刷新数据
const refreshData = () => {
  // 实现刷新数据的逻辑
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 16px;
}

.multi-line-filter-form .filter-line {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.multi-line-filter-form .filter-line:last-child {
  margin-bottom: 0;
}

.multi-line-filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.stat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-toolbar .left .el-button {
  margin-right: 8px;
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
}

.amount-cell.income {
  color: #67C23A;
}

.amount-cell.outcome {
  color: #F56C6C;
}
</style> 