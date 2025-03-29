<!-- 商户流水页面 -->
<template>
  <div class="merchant-transaction-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <!-- 第一行筛选项 -->
        <div class="filter-row">
          <el-form-item label="流水类型：">
            <el-select v-model="searchForm.type" placeholder="请选择流水类型" style="width: 168px" clearable>
              <el-option label="全部" value="" />
              <el-option label="支付订单成功" value="PAY_SUCCESS" />
              <el-option label="提现" value="WITHDRAW" />
              <el-option label="管理员充值" value="ADMIN_RECHARGE" />
              <el-option label="管理员扣除" value="ADMIN_DEDUCT" />
              <el-option label="管理员调额" value="ADMIN_ADJUST" />
              <el-option label="管理员清零" value="ADMIN_CLEAR" />
              <el-option label="提现手续费" value="WITHDRAW_FEE" />
              <el-option label="充值手续费" value="RECHARGE_FEE" />
              <el-option label="测试清账" value="TEST_CLEAR" />
              <el-option label="日终结算" value="DAY_END_SETTLE" />
            </el-select>
          </el-form-item>
          <el-form-item label="订单号：">
            <el-input v-model="searchForm.orderId" placeholder="请输入订单号" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="开始日期：">
            <el-date-picker
              v-model="searchForm.startDate"
              type="date"
              placeholder="选择开始日期"
              style="width: 168px"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="结束日期：">
            <el-date-picker
              v-model="searchForm.endDate"
              type="date"
              placeholder="选择结束日期"
              style="width: 168px"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.dateRange" placeholder="快捷日期" style="width: 120px">
              <el-option label="今天" value="today" />
              <el-option label="昨天" value="yesterday" />
              <el-option label="前天" value="beforeYesterday" />
              <el-option label="近三天" value="last3days" />
              <el-option label="近七天" value="last7days" />
              <el-option label="本周" value="thisWeek" />
              <el-option label="本月" value="thisMonth" />
            </el-select>
          </el-form-item>
        </div>
        
        <!-- 按钮区域 -->
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
          <div class="statistics-info">
            统计日期：{{ searchForm.startDate || '2025-03-28' }} ~ {{ searchForm.endDate || '2025-03-28' }}
          </div>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新">
            <el-button :icon="Refresh" circle plain @click="handleSearch" />
          </el-tooltip>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="flowId" label="流水ID" width="100" />
        <el-table-column prop="merchantName" label="商户名称" min-width="120" />
        <el-table-column prop="type" label="流水类型" width="120">
          <template #default="scope">
            <el-tag type="success" size="small" effect="plain">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="beforeAmount" label="变更前余额" width="120" align="right">
          <template #default="scope">
            <span>¥{{ formatAmount(scope.row.beforeAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="changeAmount" label="变更金额" width="120" align="right">
          <template #default="scope">
            <span :style="{ color: scope.row.changeAmount >= 0 ? '#f56c6c' : '#67c23a' }">
              ¥{{ formatAmount(scope.row.changeAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="afterAmount" label="变更后余额" width="120" align="right">
          <template #default="scope">
            <span :style="{ color: '#f56c6c' }">
              ¥{{ formatAmount(scope.row.afterAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="transactionAmount" label="交易金额" width="120" align="right">
          <template #default="scope">
            <span>¥{{ formatAmount(scope.row.transactionAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="merchantRate" label="商户费率" width="100" align="right">
          <template #default="scope">
            {{ scope.row.merchantRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="merchantFee" label="商户手续费" width="120" align="right">
          <template #default="scope">
            ¥{{ formatAmount(scope.row.merchantFee) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column prop="auditId" label="流水订单号" min-width="200" />
        <el-table-column prop="systemOrderId" label="平台订单号" min-width="200" />
        <el-table-column prop="merchantOrderId" label="商户订单号" min-width="200" />
        <el-table-column prop="createTime" label="订单完成时间" width="180" />
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
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  type: '',
  orderId: '',
  startDate: '',
  endDate: '',
  dateRange: 'today'
})

// 表格数据
const tableData = ref([
  {
    flowId: '2873469',
    merchantName: '商户A',
    type: '支付订单成功',
    beforeAmount: 5000.90,
    changeAmount: 284.10,
    afterAmount: 5285.00,
    transactionAmount: 300.00,
    merchantRate: 5.30,
    merchantFee: 15.90,
    remark: '-',
    auditId: 'AUDIT120250328vlqUNlf',
    systemOrderId: 'SYS20250328001',
    merchantOrderId: 'M20250328001',
    createTime: '2025/03/28 12:23:51'
  },
  {
    flowId: '2872140',
    merchantName: '商户A',
    type: '支付订单成功',
    beforeAmount: 4519.90,
    changeAmount: 481.00,
    afterAmount: 5000.90,
    transactionAmount: 500.00,
    merchantRate: 3.80,
    merchantFee: 19.00,
    remark: '-',
    auditId: 'AUDIT120250328PdwZM',
    systemOrderId: 'SYS20250328002',
    merchantOrderId: 'M20250328002',
    createTime: '2025/03/28 11:27:26'
  },
  {
    flowId: '2870020',
    merchantName: '商户B',
    type: '支付订单成功',
    beforeAmount: 4235.80,
    changeAmount: 284.10,
    afterAmount: 4519.90,
    transactionAmount: 300.00,
    merchantRate: 5.30,
    merchantFee: 15.90,
    remark: '-',
    auditId: 'AUDIT120250328zhsdbh',
    systemOrderId: 'SYS20250328003',
    merchantOrderId: 'M20250328003',
    createTime: '2025/03/28 09:50:50'
  }
])

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 格式化金额
const formatAmount = (amount) => {
  return Number(amount).toFixed(2)
}

// 搜索
const handleSearch = () => {
  loading.value = true
  // 模拟请求
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 300)
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 导出
const handleExport = () => {
  ElMessage.success('数据导出成功')
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

// 页面加载时获取数据
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.merchant-transaction-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
  width: 100%;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-row .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 2px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
}

.table-toolbar .right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.statistics-info {
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
}
</style> 