<!-- 数据统计/商户出款统计 - 统计商户出款数据 -->
<template>
  <div class="merchant-outcome-container">
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
          <el-form-item label="出款类型：">
            <el-select v-model="searchForm.outcomeType" placeholder="请选择出款类型" style="width: 168px" clearable>
              <el-option label="提现" value="withdraw" />
              <el-option label="退款" value="refund" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态：">
            <el-select v-model="searchForm.auditStatus" placeholder="请选择审核状态" style="width: 168px" clearable>
              <el-option label="待审核" value="pending" />
              <el-option label="审核通过" value="approved" />
              <el-option label="审核拒绝" value="rejected" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围：">
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
          <span class="table-title">商户出款列表</span>
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
        <el-table-column prop="merchantName" label="商户名称" min-width="150" show-overflow-tooltip align="center" />
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column prop="successAmount" label="成功出款金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell outcome">{{ formatAmount(row.successAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="supplementAmount" label="补单金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell outcome">{{ formatAmount(row.supplementAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总出款" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell outcome">{{ formatAmount(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.fee) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实际金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell outcome">{{ formatAmount(row.actualAmount) }}</span>
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
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  merchantId: '',
  merchantName: '',
  outcomeType: '',
  auditStatus: '',
  dateRange: []
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
    actualAmount: 50745.00,
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
    actualAmount: 48556.00,
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
    actualAmount: 45272.50,
    successCount: 880
  }
])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 出款类型映射
const getOutcomeTypeTag = (type) => {
  const map = {
    withdraw: 'primary',
    refund: 'warning',
    other: 'info'
  }
  return map[type] || 'info'
}

const getOutcomeTypeText = (type) => {
  const map = {
    withdraw: '提现',
    refund: '退款',
    other: '其他'
  }
  return map[type] || '未知'
}

// 审核状态映射
const getAuditStatusTag = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getAuditStatusText = (status) => {
  const map = {
    pending: '待审核',
    approved: '审核通过',
    rejected: '审核拒绝'
  }
  return map[status] || '未知'
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
  searchForm.outcomeType = ''
  searchForm.auditStatus = ''
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
</script>

<style scoped>
.merchant-outcome-container {
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