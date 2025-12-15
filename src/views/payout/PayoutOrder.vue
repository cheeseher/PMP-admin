<!-- 代付管理/代付订单管理 - 管理代付订单的查询、统计和操作 -->
<template>
  <div class="page-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="今日">
            <el-select 
              v-model="filterForm.todayFilter" 
              placeholder="今日"
              style="width: 168px"
              clearable
            >
              <el-option label="今日" value="today" />
              <el-option label="昨日" value="yesterday" />
              <el-option label="本周" value="thisWeek" />
              <el-option label="本月" value="thisMonth" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-date-picker
              v-model="filterForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 350px"
            />
          </el-form-item>
          
          <el-form-item label="完成时间">
            <el-date-picker
              v-model="filterForm.completeTime"
              type="datetime"
              placeholder="请选择完成时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 200px"
            />
          </el-form-item>
          
          <el-form-item label="平台单号">
            <el-input 
              v-model="filterForm.platformOrderNo" 
              placeholder="请输入平台单号"
              style="width: 200px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="商户ID">
            <el-input 
              v-model="filterForm.merchantId" 
              placeholder="请输入商户ID"
              style="width: 168px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="商户账号">
            <el-input 
              v-model="filterForm.merchantAccount" 
              placeholder="请输入商户账号"
              style="width: 168px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="商户名称">
            <el-input 
              v-model="filterForm.merchantName" 
              placeholder="请输入商户名称"
              style="width: 168px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="商户单号">
            <el-input 
              v-model="filterForm.merchantOrderNo" 
              placeholder="请输入商户单号"
              style="width: 168px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="上游单号">
            <el-input 
              v-model="filterForm.upstreamOrderNo" 
              placeholder="请输入上游单号"
              style="width: 168px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="产品">
            <el-select 
              v-model="filterForm.product" 
              placeholder="产品"
              style="width: 168px"
              clearable
            >
              <el-option label="产品A" value="产品A" />
              <el-option label="产品B" value="产品B" />
              <el-option label="产品C" value="产品C" />
              <el-option label="产品D" value="产品D" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="产品编码">
            <el-input 
              v-model="filterForm.productCode" 
              placeholder="请输入产品编码"
              style="width: 168px"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="上游">
            <el-select 
              v-model="filterForm.upstream" 
              placeholder="上游"
              style="width: 168px"
              clearable
            >
              <el-option label="上游A" value="上游A" />
              <el-option label="上游B" value="上游B" />
              <el-option label="上游C" value="上游C" />
              <el-option label="上游D" value="上游D" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="通道编码">
            <el-input 
              v-model="filterForm.channelCode" 
              placeholder="请选择"
              style="width: 168px"
              clearable
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

    <!-- 统计卡片区域 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">总跑量</div>
              <div class="stat-value primary">{{ formatAmount(statistics.totalAmount) }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">总成功单数</div>
              <div class="stat-value success">{{ statistics.successCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">商户出款总额</div>
              <div class="stat-value warning">{{ formatAmount(statistics.merchantAmount) }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">总利润</div>
              <div class="stat-value danger">{{ formatAmount(statistics.totalProfit) }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">成功率</div>
              <div class="stat-value info">{{ statistics.successRate }}%</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">成功金额</div>
              <div class="stat-value primary">{{ formatAmount(statistics.successAmount) }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="16" style="margin-top: 16px;">
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">成功单数</div>
              <div class="stat-value success">{{ statistics.successOrderCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">补单单数</div>
              <div class="stat-value warning">{{ statistics.supplementCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">商户折扣</div>
              <div class="stat-value info">{{ formatAmount(statistics.merchantDiscount) }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">上游通道成本</div>
              <div class="stat-value danger">{{ formatAmount(statistics.upstreamCost) }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 表格区域 -->
    <el-card shadow="never">
      <!-- 操作工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">代付订单管理</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button @click="handlePrint">
            <el-icon><Printer /></el-icon>
            打印
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button>
            <el-icon><QuestionFilled /></el-icon>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column 
          prop="merchantId" 
          label="商户ID" 
          width="100" 
          align="center"
        />
        
        <el-table-column 
          prop="merchantAccount" 
          label="商户账号" 
          width="120"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="upstream" 
          label="上游" 
          width="100"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="channelCode" 
          label="通道编码" 
          width="120"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="productCode" 
          label="产品编码" 
          width="100"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="productName" 
          label="产品名称" 
          width="120"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="orderAmount" 
          label="订单金额" 
          width="120"
          align="right"
        >
          <template #default="{ row }">
            <span class="amount-text">{{ formatAmount(row.orderAmount) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="orderStatus" 
          label="订单状态" 
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag 
              :type="getStatusTagType(row.orderStatus)"
              size="small"
            >
              {{ getStatusText(row.orderStatus) }}
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
          prop="completeTime" 
          label="完成时间" 
          width="160"
          align="center"
        />
        
        <el-table-column 
          label="操作" 
          width="120" 
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
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click="handleEdit(row)"
            >
              编辑
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
      title="订单详情" 
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商户ID">
          {{ detailData.merchantId }}
        </el-descriptions-item>
        <el-descriptions-item label="商户账号">
          {{ detailData.merchantAccount }}
        </el-descriptions-item>
        <el-descriptions-item label="平台单号">
          {{ detailData.platformOrderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="商户单号">
          {{ detailData.merchantOrderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="上游单号">
          {{ detailData.upstreamOrderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="产品编码">
          {{ detailData.productCode }}
        </el-descriptions-item>
        <el-descriptions-item label="产品名称">
          {{ detailData.productName }}
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          {{ formatAmount(detailData.orderAmount) }}
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag 
            :type="getStatusTagType(detailData.orderStatus)"
            size="small"
          >
            {{ getStatusText(detailData.orderStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="上游">
          {{ detailData.upstream }}
        </el-descriptions-item>
        <el-descriptions-item label="通道编码">
          {{ detailData.channelCode }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ detailData.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间" :span="2">
          {{ detailData.completeTime || '未完成' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog 
      v-model="editDialogVisible" 
      title="编辑订单" 
      width="600px"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="订单状态">
          <el-select v-model="editForm.orderStatus" style="width: 100%">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="editForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download, Printer, Refresh, QuestionFilled } from '@element-plus/icons-vue'

// 响应式数据
const tableData = ref([])
const tableLoading = ref(false)
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const detailData = ref({})
const selectedRows = ref([])

// 筛选表单
const filterForm = reactive({
  todayFilter: '',
  dateRange: [],
  completeTime: '',
  platformOrderNo: '',
  merchantId: '',
  merchantAccount: '',
  merchantName: '',
  merchantOrderNo: '',
  upstreamOrderNo: '',
  product: '',
  productCode: '',
  upstream: '',
  channelCode: ''
})

// 编辑表单
const editForm = reactive({
  orderStatus: '',
  remark: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 统计数据
const statistics = reactive({
  totalAmount: 1250000.00,
  successCount: 1250,
  merchantAmount: 1200000.00,
  totalProfit: 50000.00,
  successRate: 95.5,
  successAmount: 1190000.00,
  successOrderCount: 1195,
  supplementCount: 55,
  merchantDiscount: 10000.00,
  upstreamCost: 30000.00
})

// 模拟数据
const mockData = [
  {
    id: 1,
    merchantId: 'M001',
    merchantAccount: '商户A',
    upstream: '上游A',
    channelCode: 'CH001',
    productCode: 'P001',
    productName: '产品A',
    platformOrderNo: 'PO20240115001',
    merchantOrderNo: 'MO20240115001',
    upstreamOrderNo: 'UO20240115001',
    orderAmount: 5000.00,
    orderStatus: 'success',
    createTime: '2024-01-15 10:30:25',
    completeTime: '2024-01-15 10:35:30'
  },
  {
    id: 2,
    merchantId: 'M002',
    merchantAccount: '商户B',
    upstream: '上游B',
    channelCode: 'CH002',
    productCode: 'P002',
    productName: '产品B',
    platformOrderNo: 'PO20240115002',
    merchantOrderNo: 'MO20240115002',
    upstreamOrderNo: 'UO20240115002',
    orderAmount: 3000.00,
    orderStatus: 'processing',
    createTime: '2024-01-15 11:15:30',
    completeTime: ''
  },
  {
    id: 3,
    merchantId: 'M003',
    merchantAccount: '商户C',
    upstream: '上游C',
    channelCode: 'CH003',
    productCode: 'P003',
    productName: '产品C',
    platformOrderNo: 'PO20240115003',
    merchantOrderNo: 'MO20240115003',
    upstreamOrderNo: 'UO20240115003',
    orderAmount: 8000.00,
    orderStatus: 'failed',
    createTime: '2024-01-15 14:20:15',
    completeTime: ''
  },
  {
    id: 4,
    merchantId: 'M004',
    merchantAccount: '商户D',
    upstream: '上游A',
    channelCode: 'CH001',
    productCode: 'P004',
    productName: '产品D',
    platformOrderNo: 'PO20240115004',
    merchantOrderNo: 'MO20240115004',
    upstreamOrderNo: 'UO20240115004',
    orderAmount: 12000.00,
    orderStatus: 'success',
    createTime: '2024-01-15 15:45:20',
    completeTime: '2024-01-15 15:50:25'
  },
  {
    id: 5,
    merchantId: 'M005',
    merchantAccount: '商户E',
    upstream: '上游D',
    channelCode: 'CH004',
    productCode: 'P005',
    productName: '产品E',
    platformOrderNo: 'PO20240115005',
    merchantOrderNo: 'MO20240115005',
    upstreamOrderNo: 'UO20240115005',
    orderAmount: 6500.00,
    orderStatus: 'pending',
    createTime: '2024-01-15 16:30:45',
    completeTime: ''
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

// 打印
const handlePrint = () => {
  ElMessage.success('打印功能开发中...')
}

// 刷新
const handleRefresh = () => {
  initData()
  ElMessage.success('数据已刷新')
}

// 查看详情
const handleViewDetail = (row) => {
  detailData.value = { ...row }
  detailDialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  editForm.orderStatus = row.orderStatus
  editForm.remark = row.remark || ''
  detailData.value = { ...row }
  editDialogVisible.value = true
}

// 保存编辑
const handleSaveEdit = () => {
  ElMessage.success('订单信息已更新')
  editDialogVisible.value = false
  initData()
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
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
  if (!amount && amount !== 0) return '¥0.00'
  return '¥' + Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
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
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const statusMap = {
    pending: 'warning',
    processing: 'primary',
    success: 'success',
    failed: 'danger',
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

.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  border: 1px solid #e4e7ed;
}

.stat-item {
  padding: 16px 0;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
}

.stat-value.primary {
  color: #409eff;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.danger {
  color: #f56c6c;
}

.stat-value.info {
  color: #909399;
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
  color: #409eff;
}
</style>