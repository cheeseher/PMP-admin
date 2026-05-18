<template>
  <div class="payout-order-page">
    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="订单号">
            <el-input 
              v-model="filterForm.orderNo" 
              placeholder="请输入订单号" 
              style="width: 168px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="商户订单号">
            <el-input 
              v-model="filterForm.merchantOrderNo" 
              placeholder="请输入商户订单号" 
              style="width: 168px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="商户名称">
            <el-select 
              v-model="filterForm.merchantName" 
              placeholder="请选择商户" 
              style="width: 168px"
              clearable
            >
              <el-option label="商户A" value="merchant_a" />
              <el-option label="商户B" value="merchant_b" />
              <el-option label="商户C" value="merchant_c" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="代付产品">
            <el-select 
              v-model="filterForm.payoutProduct" 
              placeholder="请选择代付产品" 
              style="width: 168px"
              clearable
            >
              <el-option label="产品A" value="product_a" />
              <el-option label="产品B" value="product_b" />
              <el-option label="产品C" value="product_c" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="订单状态">
            <el-select 
              v-model="filterForm.status" 
              placeholder="请选择状态" 
              style="width: 168px"
              clearable
            >
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="代付通道">
            <el-select 
              v-model="filterForm.payoutChannel" 
              placeholder="请选择代付通道" 
              style="width: 168px"
              clearable
            >
              <el-option label="代付通道A" value="channel_a" />
              <el-option label="代付通道B" value="channel_b" />
              <el-option label="代付通道C" value="channel_c" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="filterForm.createTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 320px"
            />
          </el-form-item>
          
          <div class="filter-buttons">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 统计信息区域 - 文本样式 -->
    <div class="text-stats-bar">
      <div class="stat-item">
        <span class="label">总代付金额：</span>
        <span class="value emphasis">{{ formatAmount(63821095740.00) }}</span>
      </div>
      <div class="stat-item">
        <span class="label">总代付单数：</span>
        <span class="value">0</span>
      </div>
      <div class="stat-item">
        <span class="label">成功金额：</span>
        <span class="value income">{{ formatAmount(0) }}</span>
      </div>
      <div class="stat-item">
        <span class="label">成功单数：</span>
        <span class="value">0</span>
      </div>
      <div class="stat-item">
        <span class="label">成功率：</span>
        <span class="value">0.00%</span>
      </div>
      <div class="stat-item">
        <span class="label">失败金额：</span>
        <span class="value expense">{{ formatAmount(0) }}</span>
      </div>
      <div class="stat-item">
        <span class="label">失败单数：</span>
        <span class="value">0</span>
      </div>
      <div class="stat-item">
        <span class="label">商户手续费：</span>
        <span class="value income">{{ formatAmount(0) }}</span>
      </div>
      <div class="stat-item">
        <span class="label">通道成本：</span>
        <span class="value expense">{{ formatAmount(0) }}</span>
      </div>
      <div class="stat-item">
        <span class="label">平台利润：</span>
        <span class="value income">{{ formatAmount(0) }}</span>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <!-- 操作工具栏 -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增订单
          </el-button>
          <el-button @click="handleBatchProcess">
            <el-icon><Operation /></el-icon>
            批量处理
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table 
        :data="tableData" 
        v-loading="tableLoading"
        border 
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="orderNo" label="订单号" width="180" />
        
        <el-table-column prop="merchantOrderNo" label="商户订单号" width="180" />
        
        <el-table-column prop="merchantName" label="商户名称" width="120" />
        
        <el-table-column prop="payoutProduct" label="代付产品" width="120" />
        
        <el-table-column prop="payoutChannel" label="代付通道" width="120" />
        
        <el-table-column prop="amount" label="代付金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="fee" label="手续费" width="100" align="right">
          <template #default="{ row }">
            <span class="fee-text">¥{{ row.fee }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="bankName" label="收款银行" width="120" />
        
        <el-table-column prop="accountName" label="收款人" width="100" />
        
        <el-table-column prop="accountNumber" label="收款账号" width="180" />
        
        <el-table-column prop="createTime" label="创建时间" width="160" />
        
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-wrapper">
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

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="detail-content" v-if="currentRow">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentRow.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="商户订单号">{{ currentRow.merchantOrderNo }}</el-descriptions-item>
          <el-descriptions-item label="商户名称">{{ currentRow.merchantName }}</el-descriptions-item>
          <el-descriptions-item label="代付产品">{{ currentRow.payoutProduct }}</el-descriptions-item>
          <el-descriptions-item label="代付通道">{{ currentRow.payoutChannel }}</el-descriptions-item>
          <el-descriptions-item label="代付金额">¥{{ currentRow.amount }}</el-descriptions-item>
          <el-descriptions-item label="手续费">¥{{ currentRow.fee }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentRow.status)">
              {{ getStatusText(currentRow.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="收款银行">{{ currentRow.bankName }}</el-descriptions-item>
          <el-descriptions-item label="收款人">{{ currentRow.accountName }}</el-descriptions-item>
          <el-descriptions-item label="收款账号">{{ currentRow.accountNumber }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentRow.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentRow.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRow.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑订单弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑订单"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="editForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="商户订单号">
          <el-input v-model="editForm.merchantOrderNo" />
        </el-form-item>
        <el-form-item label="代付金额">
          <el-input v-model="editForm.amount" />
        </el-form-item>
        <el-form-item label="手续费">
          <el-input v-model="editForm.fee" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="editForm.status" style="width: 100%">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Plus, 
  Operation, 
  Download, 
  View, 
  Edit, 
  Delete 
} from '@element-plus/icons-vue'

// 筛选表单
const filterForm = reactive({
  orderNo: '',
  merchantOrderNo: '',
  merchantName: '',
  payoutProduct: '',
  status: '',
  payoutChannel: '',
  createTime: []
})

// 统计数据
const stats = reactive({
  totalOrders: '1,256',
  successOrders: '1,143',
  processingOrders: '45',
  failedOrders: '68',
  totalAmount: '1,234,567.89',
  successAmount: '1,123,456.78',
  failedAmount: '111,111.11',
  processingAmount: '0.00',
  totalFee: '12,345.67',
  successRate: '91.0'
})

// 表格数据
const tableData = ref([])
const tableLoading = ref(false)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 弹窗控制
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentRow = ref(null)

// 编辑表单
const editForm = reactive({
  orderNo: '',
  merchantOrderNo: '',
  amount: '',
  fee: '',
  status: '',
  remark: ''
})

// 模拟数据
const mockData = [
  {
    id: 1,
    orderNo: 'PO202312010001',
    merchantOrderNo: 'M202312010001',
    merchantName: '商户A',
    payoutProduct: '产品A',
    payoutChannel: '代付通道A',
    amount: '10,000.00',
    fee: '50.00',
    status: 'success',
    bankName: '银行A',
    accountName: '张三',
    accountNumber: '6222021234567890123',
    createTime: '2023-12-01 10:30:00',
    updateTime: '2023-12-01 10:35:00',
    remark: '正常代付订单'
  },
  {
    id: 2,
    orderNo: 'PO202312010002',
    merchantOrderNo: 'M202312010002',
    merchantName: '商户B',
    payoutProduct: '产品B',
    payoutChannel: '代付通道B',
    amount: '5,000.00',
    fee: '25.00',
    status: 'processing',
    bankName: '银行B',
    accountName: '李四',
    accountNumber: '6222021234567890124',
    createTime: '2023-12-01 11:00:00',
    updateTime: '2023-12-01 11:05:00',
    remark: '处理中订单'
  },
  {
    id: 3,
    orderNo: 'PO202312010003',
    merchantOrderNo: 'M202312010003',
    merchantName: '商户C',
    payoutProduct: '产品C',
    payoutChannel: '代付通道C',
    amount: '8,000.00',
    fee: '40.00',
    status: 'failed',
    bankName: '银行C',
    accountName: '王五',
    accountNumber: '6222021234567890125',
    createTime: '2023-12-01 12:00:00',
    updateTime: '2023-12-01 12:10:00',
    remark: '银行卡信息错误'
  }
]

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    processing: 'primary',
    success: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    success: '成功',
    failed: '失败',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知'
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件:', filterForm)
  loadTableData()
}

// 重置
const handleReset = () => {
  Object.keys(filterForm).forEach(key => {
    if (Array.isArray(filterForm[key])) {
      filterForm[key] = []
    } else {
      filterForm[key] = ''
    }
  })
  loadTableData()
}

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '¥0.00'
  return `¥${amount}`
}

// 新增订单
const handleAdd = () => {
  ElMessage.info('新增订单功能')
}

// 批量处理
const handleBatchProcess = () => {
  ElMessage.info('批量处理功能')
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出数据功能')
}

// 刷新
const handleRefresh = () => {
  loadTableData()
}

// 查看详情
const handleView = (row) => {
  currentRow.value = row
  detailDialogVisible.value = true
}

// 编辑订单
const handleEdit = (row) => {
  currentRow.value = row
  Object.keys(editForm).forEach(key => {
    editForm[key] = row[key] || ''
  })
  editDialogVisible.value = true
}

// 删除订单
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除订单 ${row.orderNo} 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    loadTableData()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 保存编辑
const handleSave = () => {
  ElMessage.success('保存成功')
  editDialogVisible.value = false
  loadTableData()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadTableData()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadTableData()
}

// 加载表格数据
const loadTableData = () => {
  tableLoading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    tableData.value = mockData
    pagination.total = mockData.length
    tableLoading.value = false
  }, 500)
}

// 初始化
onMounted(() => {
  loadTableData()
})
</script>

<style scoped>
.payout-order-page {
  padding: 20px;
}

.filter-card {
  /* 去除底部间距，统一由 text-stats-bar 控制间距 */
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

/* 统计信息区域 - 文本样式 */
.text-stats-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
}

.stat-item {
  display: inline-flex;
  align-items: baseline;
  font-size: 14px;
}

.stat-item .label {
  color: #606266;
  margin-right: 4px;
}

.stat-item .value {
  font-family: 'Roboto Mono', Monaco, monospace;
  font-weight: 600;
  color: #409eff;
}

.stat-item .value.emphasis {
  color: #409eff;
  font-size: 15px;
}

.table-card {
  margin-bottom: 20px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
}

.amount-text {
  color: #67c23a;
  font-weight: bold;
}

.fee-text {
  color: #e6a23c;
  font-weight: bold;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.detail-content {
  max-height: 400px;
  overflow-y: auto;
}
</style>