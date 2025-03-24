<!-- 订单管理/商户订单管理 - 展示和管理商户的订单列表 -->
<template>
  <div class="merchant-order">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-card">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="今日">
            <el-select v-model="searchForm.today" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部" value="all" />
              <el-option label="今日" value="today" />
              <el-option label="昨日" value="yesterday" />
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
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
          <el-form-item label="平台单号">
            <el-input v-model="searchForm.platformOrderNo" placeholder="请输入平台单号" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户ID">
            <el-input v-model="searchForm.merchantId" placeholder="请输入商户ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户名称">
            <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户类型">
            <el-input v-model="searchForm.merchantType" placeholder="请输入商户类型" style="width: 168px" clearable />
          </el-form-item>
        </el-form>
      </div>
      <div class="second-row">
        <el-form :model="searchForm" inline>
          <el-form-item label="上游单号">
            <el-input v-model="searchForm.upstreamOrderNo" placeholder="请输入上游单号" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="产品">
            <el-select v-model="searchForm.product" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部产品" value="all" />
              <el-option label="支付宝" value="alipay" />
              <el-option label="微信支付" value="wxpay" />
              <el-option label="银联" value="unionpay" />
            </el-select>
          </el-form-item>
          <el-form-item label="产品编码">
            <el-input v-model="searchForm.productCode" placeholder="请输入产品编码" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="上游">
            <el-select v-model="searchForm.upstream" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部上游" value="all" />
              <el-option label="上游A" value="A" />
              <el-option label="上游B" value="B" />
              <el-option label="上游C" value="C" />
            </el-select>
          </el-form-item>
          <el-form-item label="上游通道">
            <el-select v-model="searchForm.upstreamChannel" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部通道" value="all" />
              <el-option label="通道1" value="1" />
              <el-option label="通道2" value="2" />
              <el-option label="通道3" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="通道编码">
            <el-input v-model="searchForm.channelCode" placeholder="请输入通道编码" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="通道状态">
            <el-select v-model="searchForm.channelStatus" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部状态" value="all" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failed" />
              <el-option label="处理中" value="processing" />
            </el-select>
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
    <el-card shadow="never" class="table-card">
      <div class="table-header">
        <div class="left">
          <el-button-group>
            <el-button type="primary" :icon="Search">查询</el-button>
            <el-button :icon="Refresh">刷新</el-button>
          </el-button-group>
        </div>
        <div class="right">
          <el-button-group>
            <el-button icon="Printer">打印</el-button>
            <el-button icon="Download" @click="handleExport">导出</el-button>
            <el-button icon="Refresh">刷新</el-button>
          </el-button-group>
        </div>
      </div>

      <el-table
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="merchantId" label="商户ID" width="80" />
        <el-table-column prop="merchantName" label="商户名称" width="120" />
        <el-table-column prop="upstream" label="上游" width="100" />
        <el-table-column prop="orderNo" label="平台单号" width="120" />
        <el-table-column prop="productCode" label="产品编码" width="100" />
        <el-table-column prop="productName" label="产品名称" width="120" />
        <el-table-column prop="orderAmount" label="订单金额" width="120">
          <template #default="scope">
            {{ formatAmount(scope.row.orderAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="90">
          <template #default="scope">
            <el-tag 
              :type="getStatusType(scope.row.orderStatus)" 
              size="small"
            >
              {{ getStatusText(scope.row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="140" />
        <el-table-column prop="completeTime" label="完成时间" width="140" />
        <el-table-column prop="remarkStatus" label="备注状态" width="100" />
        <el-table-column prop="remarkInfo" label="备注信息" min-width="160" />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleOperate(scope.row)">
              操作
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="pagination.total"
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
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, Printer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  today: 'today',
  dateRange: ['2025-03-24', '2025-03-24'],
  platformOrderNo: '',
  merchantId: '',
  merchantName: '',
  merchantType: '',
  upstreamOrderNo: '',
  product: '',
  productCode: '',
  upstream: '',
  upstreamChannel: '',
  channelCode: '',
  channelStatus: ''
})

// 表格数据
const tableData = ref([
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '102',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '100.00',
    orderStatus: 'success',
    createTime: '2023-03-14 17:31:32',
    completeTime: '2025-03-22 13:20:31',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '100.00',
    orderStatus: 'success',
    createTime: '2024-10-31 15:53:19',
    completeTime: '2025-02-26 12:26:28',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '100.00',
    orderStatus: 'success',
    createTime: '2024-10-31 15:53:16',
    completeTime: '2024-10-31 15:54:56',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '300.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:53:15',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '300.00',
    orderStatus: 'success',
    createTime: '2024-10-31 15:53:14',
    completeTime: '2024-10-31 15:54:56',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '100.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:53:10',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '200.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:53:08',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '500.00',
    orderStatus: 'success',
    createTime: '2024-10-31 15:53:06',
    completeTime: '2024-10-31 15:54:56',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '300.00',
    orderStatus: 'success',
    createTime: '2024-10-31 15:53:03',
    completeTime: '2024-10-31 15:54:56',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '300.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:53:03',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '500.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:52:59',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '500.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:52:58',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '500.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:52:55',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '300.00',
    orderStatus: 'success',
    createTime: '2024-10-31 15:52:51',
    completeTime: '2024-10-31 15:54:55',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '100.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:52:49',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '100.00',
    orderStatus: 'success',
    createTime: '2024-10-31 15:52:46',
    completeTime: '2024-10-31 15:54:55',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '500.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:52:43',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '100.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:52:43',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '100.00',
    orderStatus: 'pending',
    createTime: '2024-10-31 15:52:41',
    completeTime: '',
    remarkStatus: '',
    remarkInfo: ''
  },
  {
    merchantId: '1',
    merchantName: '测试',
    upstream: '新吓你',
    orderNo: '0000',
    productCode: '8888',
    productName: '淘宝产品',
    orderAmount: '500.00',
    orderStatus: 'success',
    createTime: '2024-10-31 15:52:40',
    completeTime: '2024-10-31 15:54:55',
    remarkStatus: '',
    remarkInfo: ''
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 30,
  total: 8500
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
</script>

<style scoped>
.merchant-order {
  padding: 15px;
}

.search-card {
  margin-bottom: 15px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.second-row {
  margin-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 15px;
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