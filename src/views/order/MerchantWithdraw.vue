<!-- 订单管理/商户提现审核 - 处理商户的提现申请 -->
<template>
  <div class="merchant-withdraw">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" inline class="multi-line-filter-form">
        <!-- 第一行筛选项 -->
        <div class="filter-line">
          <el-form-item label="商户名称：" prop="merchantName">
            <el-select 
              v-model="searchForm.merchantName" 
              placeholder="请选择商户" 
              style="width: 168px" 
              clearable 
              filterable
            >
              <el-option label="全部" value="" />
              <el-option label="商户A" value="商户A" />
              <el-option label="商户B" value="商户B" />
              <el-option label="商户C" value="商户C" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="提现单号：" prop="withdrawNo">
            <el-input 
              v-model="searchForm.withdrawNo" 
              placeholder="请输入提现单号" 
              style="width: 220px" 
              clearable 
            />
          </el-form-item>
          
          <el-form-item label="状态：" prop="status">
            <el-select 
              v-model="searchForm.status" 
              placeholder="请选择状态" 
              style="width: 168px" 
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="未确认" value="pending" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failed" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="申请时间：" prop="applyTimeRange">
            <el-date-picker
              v-model="searchForm.applyTimeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>
        </div>
        
        <!-- 操作按钮行 -->
        <div class="filter-line filter-buttons-line">
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">提现申请列表</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button 
            type="success" 
            :icon="Check" 
            @click="handleBatchApprove"
            :disabled="selectedRows.length === 0"
          >
            批量审核
          </el-button>
          <el-button plain :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" />
          </el-tooltip>
        </div>
      </div>

      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="merchantName" label="商户名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="withdrawNo" label="提现订单号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="amount" label="提现数量（U）" min-width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="walletAddress" label="钱包地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="withdrawAmount" label="提现金额（CNY）" min-width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.withdrawAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="360" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ formatRemark(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="auditRemark" label="审核备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" min-width="100" fixed="right">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" min-width="160" />
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                link
                @click="handleApprove(row)"
                :disabled="row.status !== 'pending'"
              >
                审核
              </el-button>
            </div>
          </template>
        </el-table-column>
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

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="approveDialog.visible"
      title="提现审核"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="商户名称：">
          <span>{{ approveForm.merchantName }}</span>
        </el-form-item>
        <el-form-item label="提现单号：">
          <span>{{ approveForm.withdrawNo }}</span>
        </el-form-item>
        <el-form-item label="提现数量：">
          <span>{{ approveForm.amount }} U</span>
        </el-form-item>
        <el-form-item label="提现金额：">
          <span>¥{{ approveForm.withdrawAmount }}</span>
        </el-form-item>
        <el-form-item label="钱包地址：">
          <span>{{ approveForm.walletAddress }}</span>
        </el-form-item>
        <el-form-item label="审核结果：">
          <el-radio-group v-model="approveForm.result">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注：">
          <el-input
            v-model="approveForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approveDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitApprove">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, Check } from '@element-plus/icons-vue'
// 引入统一的提现模拟数据服务
import { getWithdrawList, approveWithdraw } from '@/data/withdrawData.js'

// 搜索表单
const searchForm = reactive({
  merchantName: '',
  withdrawNo: '',
  status: '',
  applyTimeRange: []
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const end = new Date()
      const start = new Date()
      return [start, end]
    }
  },
  {
    text: '昨天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, end]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 表格数据
const tableData = ref([])
const tableLoading = ref(false)
const selectedRows = ref([])

// 审核弹窗
const approveDialog = reactive({
  visible: false
})

// 审核表单
const approveForm = reactive({
  id: '',
  merchantName: '',
  withdrawNo: '',
  amount: '',
  withdrawAmount: '',
  walletAddress: '',
  result: 'approve',
  remark: ''
})

// 获取类型标签样式（当前仅支持 TRX）
const getTypeTagType = (type) => {
  const typeMap = {
    'TRX': 'success'
  }
  return typeMap[type] || 'info'
}

// 获取状态标签样式
const getStatusTagType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'success': 'success',
    'failed': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '未确认',
    'success': '成功',
    'failed': '失败'
  }
  return statusMap[status] || status
}

// 备注模板生成：商户【账户名称】申请下发商户余额：XXXXX汇率和数量：{amount}*{rate}下发 RMB：{withdrawAmount}下发 地址：{walletAddress}下发申请成功，请耐心等待财务打款。谢谢！（不接受期间更换、修改地址及金额，出现金额损失自行负责哦）
const formatRemark = (row) => {
  const name = row.merchantName
  const amount = row.amount
  const rmb = row.withdrawAmount
  const rate = amount ? (rmb / amount).toFixed(2) : '0.00'
  const address = row.walletAddress
  return `商户【${name}】申请下发商户余额：XXXXX汇率和数量：${amount}*${rate}下发 RMB：${rmb}下发 地址：${address}下发申请成功，请耐心等待财务打款。谢谢！（不接受期间更换、修改地址及金额，出现金额损失自行负责哦）`
}

// 获取列表数据（使用统一模拟数据）
const getTableData = async () => {
  tableLoading.value = true
  try {
    const res = await getWithdrawList({
      merchantName: searchForm.merchantName,
      withdrawNo: searchForm.withdrawNo,
      status: searchForm.status,
      applyTimeRange: searchForm.applyTimeRange,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data
    pagination.total = res.total
  } finally {
    tableLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  getTableData()
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'applyTimeRange') {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  handleSearch()
}

// 导出
const handleExport = () => {
  ElMessage.success('正在导出数据，请稍候...')
}

// 刷新数据
const refreshData = () => {
  getTableData()
}

// 选择行变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 批量审核
const handleBatchApprove = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要审核的提现申请')
    return
  }
  ElMessage.info(`已选择 ${selectedRows.value.length} 条提现申请进行批量审核`)
}


// 审核
const handleApprove = (row) => {
  Object.assign(approveForm, {
    id: row.id,
    merchantName: row.merchantName,
    withdrawNo: row.withdrawNo,
    amount: row.amount,
    withdrawAmount: row.withdrawAmount,
    walletAddress: row.walletAddress,
    result: 'approve',
    remark: ''
  })
  approveDialog.visible = true
}


// 提交审核
const submitApprove = async () => {
  if (!approveForm.result) {
    ElMessage.warning('请选择审核结果')
    return
  }
  try {
    await approveWithdraw({
      id: approveForm.id,
      result: approveForm.result,
      remark: approveForm.remark
    })
    ElMessage.success(`提现申请 ${approveForm.result === 'approve' ? '已通过' : '已拒绝'}`)
    approveDialog.visible = false
    refreshData()
  } catch (e) {
    ElMessage.error('审核失败，请稍后重试')
  }
}

// 分页变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  getTableData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  getTableData()
}

// 初始化
onMounted(() => {
  getTableData()
})
</script>

<style scoped>
.merchant-withdraw {
  padding: 20px;
}

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

.filter-buttons-line {
  justify-content: flex-end;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
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

.table-toolbar .right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.amount-text {
  font-weight: 500;
  color: #303133;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-footer {
  text-align: right;
}
</style>