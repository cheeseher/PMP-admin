<!-- 代付管理/上游代付资金流水 - 展示上游代付资金变动记录 -->
<template>
  <div class="page-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="交易单号">
            <el-input 
              v-model="filterForm.transactionNo" 
              placeholder="请输入交易单号"
              style="width: 200px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="交易类型">
            <el-select 
              v-model="filterForm.transactionType" 
              placeholder="请选择"
              style="width: 168px"
              clearable
            >
              <el-option label="代付" value="payout" />
              <el-option label="充值" value="recharge" />
              <el-option label="提现" value="withdraw" />
              <el-option label="退款" value="refund" />
              <el-option label="手续费" value="fee" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="上游名称">
            <el-select 
              v-model="filterForm.upstreamName" 
              placeholder="请选择"
              style="width: 168px"
              clearable
            >
              <el-option label="上游A" value="上游A" />
              <el-option label="上游B" value="上游B" />
              <el-option label="上游C" value="上游C" />
              <el-option label="上游D" value="上游D" />
              <el-option label="上游E" value="上游E" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select 
              v-model="filterForm.status" 
              placeholder="请选择"
              style="width: 168px"
              clearable
            >
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failed" />
              <el-option label="处理中" value="processing" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 350px"
            />
          </el-form-item>
          
          <div class="filter-buttons">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never">
      <!-- 操作工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">上游代付资金流水</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table 
        :data="tableData" 
        border 
        stripe 
        v-loading="tableLoading"
        style="width: 100%"
      >
        <el-table-column 
          prop="id" 
          label="代付上游ID" 
          width="120" 
          align="center"
        />
        
        <el-table-column 
          prop="transactionNo" 
          label="交易单号" 
          width="180"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="transactionType" 
          label="交易类型" 
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag 
              :type="getTransactionTypeTagType(row.transactionType)"
              size="small"
            >
              {{ getTransactionTypeText(row.transactionType) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="upstreamName" 
          label="上游名称" 
          width="120"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="beforeAmount" 
          label="交易前" 
          width="120"
          align="right"
        >
          <template #default="{ row }">
            <span class="amount-text">¥{{ formatAmount(row.beforeAmount) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="amount" 
          label="交易金额" 
          width="120"
          align="right"
        >
          <template #default="{ row }">
            <span 
              :class="['amount-text', row.amount > 0 ? 'amount-positive' : 'amount-negative']"
            >
              {{ row.amount > 0 ? '+' : '' }}¥{{ formatAmount(Math.abs(row.amount)) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="afterAmount" 
          label="交易后" 
          width="120"
          align="right"
        >
          <template #default="{ row }">
            <span class="amount-text">¥{{ formatAmount(row.afterAmount) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="fee" 
          label="手续费" 
          width="100"
          align="right"
        >
          <template #default="{ row }">
            <span class="amount-text">¥{{ formatAmount(row.fee) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="status" 
          label="状态" 
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag 
              :type="getStatusTagType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="createTime" 
          label="创建时间" 
          width="160"
          align="center"
        />
        
        <el-table-column 
          prop="remark" 
          label="备注" 
          min-width="150"
          show-overflow-tooltip
        />
        
        <el-table-column 
          label="操作" 
          width="100" 
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click="handleViewDetail(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="资金流水详情" 
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="交易单号">
          {{ detailData.transactionNo }}
        </el-descriptions-item>
        <el-descriptions-item label="交易类型">
          <el-tag 
            :type="getTransactionTypeTagType(detailData.transactionType)"
            size="small"
          >
            {{ getTransactionTypeText(detailData.transactionType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="上游名称">
          {{ detailData.upstreamName }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag 
            :type="getStatusTagType(detailData.status)"
            size="small"
          >
            {{ getStatusText(detailData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="交易前金额">
          ¥{{ formatAmount(detailData.beforeAmount) }}
        </el-descriptions-item>
        <el-descriptions-item label="交易金额">
          <span 
            :class="['amount-text', detailData.amount > 0 ? 'amount-positive' : 'amount-negative']"
          >
            {{ detailData.amount > 0 ? '+' : '' }}¥{{ formatAmount(Math.abs(detailData.amount)) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="交易后金额">
          ¥{{ formatAmount(detailData.afterAmount) }}
        </el-descriptions-item>
        <el-descriptions-item label="手续费">
          ¥{{ formatAmount(detailData.fee) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ detailData.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ detailData.remark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'

// 响应式数据
const tableData = ref([])
const tableLoading = ref(false)
const detailDialogVisible = ref(false)
const detailData = ref({})

// 筛选表单
const filterForm = reactive({
  transactionNo: '',
  transactionType: '',
  upstreamName: '',
  status: '',
  dateRange: []
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模拟数据
const mockData = [
  {
    id: 1,
    transactionNo: 'TXN202401150001',
    transactionType: 'payout',
    upstreamName: '上游A',
    beforeAmount: 100000.00,
    amount: -5000.00,
    afterAmount: 95000.00,
    fee: 25.00,
    status: 'success',
    createTime: '2024-01-15 10:30:25',
    remark: '代付交易'
  },
  {
    id: 2,
    transactionNo: 'TXN202401150002',
    transactionType: 'recharge',
    upstreamName: '上游B',
    beforeAmount: 50000.00,
    amount: 20000.00,
    afterAmount: 70000.00,
    fee: 0.00,
    status: 'success',
    createTime: '2024-01-15 11:15:30',
    remark: '账户充值'
  },
  {
    id: 3,
    transactionNo: 'TXN202401150003',
    transactionType: 'payout',
    upstreamName: '上游C',
    beforeAmount: 80000.00,
    amount: -3000.00,
    afterAmount: 77000.00,
    fee: 15.00,
    status: 'failed',
    createTime: '2024-01-15 14:20:15',
    remark: '代付失败，余额不足'
  },
  {
    id: 4,
    transactionNo: 'TXN202401150004',
    transactionType: 'withdraw',
    upstreamName: '上游A',
    beforeAmount: 95000.00,
    amount: -10000.00,
    afterAmount: 85000.00,
    fee: 50.00,
    status: 'processing',
    createTime: '2024-01-15 15:45:20',
    remark: '提现申请处理中'
  },
  {
    id: 5,
    transactionNo: 'TXN202401150005',
    transactionType: 'fee',
    upstreamName: '上游D',
    beforeAmount: 60000.00,
    amount: -100.00,
    afterAmount: 59900.00,
    fee: 0.00,
    status: 'success',
    createTime: '2024-01-15 16:30:45',
    remark: '平台服务费'
  }
]

// 初始化数据
const initData = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableData.value = mockData
    pagination.total = mockData.length
    tableLoading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件:', filterForm)
  initData()
}

// 重置
const handleReset = () => {
  Object.keys(filterForm).forEach(key => {
    if (key === 'dateRange') {
      filterForm[key] = []
    } else {
      filterForm[key] = ''
    }
  })
  initData()
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 查看详情
const handleViewDetail = (row) => {
  detailData.value = { ...row }
  detailDialogVisible.value = true
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  initData()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  initData()
}

// 格式化金额
const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 获取交易类型文本
const getTransactionTypeText = (type) => {
  const typeMap = {
    payout: '代付',
    recharge: '充值',
    withdraw: '提现',
    refund: '退款',
    fee: '手续费'
  }
  return typeMap[type] || type
}

// 获取交易类型标签类型
const getTransactionTypeTagType = (type) => {
  const typeMap = {
    payout: 'primary',
    recharge: 'success',
    withdraw: 'warning',
    refund: 'info',
    fee: 'danger'
  }
  return typeMap[type] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    success: '成功',
    failed: '失败',
    processing: '处理中',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const statusMap = {
    success: 'success',
    failed: 'danger',
    processing: 'warning',
    cancelled: 'info'
  }
  return statusMap[status] || ''
}

// 页面初始化
onMounted(() => {
  initData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 0;
  display: flex;
  align-items: center;
}

.filter-form .el-form-item__label {
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

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.amount-text {
  font-weight: 500;
}

.amount-positive {
  color: #67c23a;
}

.amount-negative {
  color: #f56c6c;
}
</style>