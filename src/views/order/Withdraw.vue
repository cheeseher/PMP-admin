<!-- 订单管理/商户提现审核 - 处理商户的提现申请 -->
<template>
  <div class="order-withdraw">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <el-form-item label="提现单号：">
          <el-input v-model="searchForm.withdrawNo" placeholder="请输入提现单号" style="width: 220px" clearable />
        </el-form-item>
        
        <el-form-item label="状态：">
          <el-select v-model="searchForm.status" placeholder="请选择" style="width: 168px" clearable>
            <el-option label="全部状态" value="all" />
            <el-option label="未确认" value="PENDING" />
            <el-option label="成功" value="PAID" />
            <el-option label="失败" value="FAILED" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期范围：">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
            style="width: 340px"
          />
        </el-form-item>
        
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
          <el-button :icon="Download" plain @click="handleExport">导出</el-button>
          <el-button :icon="Printer" plain>打印</el-button>
        </div>
        <div class="right">
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" :loading="loading" />
          </el-tooltip>
        </div>
      </div>
      
      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="merchantId" label="商户ID" width="80" fixed="left" />
        <el-table-column prop="withdrawNo" label="提现订单号" width="140" />
        <el-table-column prop="beforeAmount" label="提现前余额" width="120" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ scope.row.beforeAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="frozenAmount" label="原始冻结" width="120" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ scope.row.frozenAmount || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="提现金额" width="120" align="right">
          <template #default="scope">
            <span class="amount-cell outcome">{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="80" align="right">
          <template #default="scope">
            <span class="amount-cell outcome">{{ scope.row.fee }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="afterAmount" label="提现后余额" width="120" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ scope.row.afterAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="afterFrozen" label="提现后冻结" width="120" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ scope.row.afterFrozen || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="getStatusType(scope.row.status)" 
              size="small"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="140" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'PENDING'" 
              link 
              type="success"
              @click="handleApprove(scope.row)"
            >
              通过
            </el-button>
            <el-button 
              v-if="scope.row.status === 'PENDING'" 
              link 
              type="danger" 
              @click="handleReject(scope.row)"
            >
              拒绝
            </el-button>
            <el-button 
              link 
              type="primary" 
              @click="handleView(scope.row)"
            >
              详情
            </el-button>
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

    <!-- 审核对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'approve' ? '审核通过' : '审核拒绝'"
      width="500px"
    >
      <el-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        label-width="100px"
      >
        <el-form-item label="提现单号">
          <el-input v-model="auditForm.withdrawNo" disabled style="width: 360px" />
        </el-form-item>
        <el-form-item label="商户名称">
          <el-input v-model="auditForm.merchantName" disabled style="width: 360px" />
        </el-form-item>
        <el-form-item label="提现金额">
          <el-input v-model="auditForm.amount" disabled style="width: 360px">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="审核意见" prop="remark">
          <el-input
            v-model="auditForm.remark"
            type="textarea"
            :rows="3"
            :placeholder="dialogType === 'approve' ? '请输入审核通过意见' : '请输入审核拒绝原因'"
            style="width: 360px"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAuditSubmit" :loading="auditSubmitting">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, Close, View, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  withdrawNo: '',
  status: '',
  dateRange: []
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '昨天',
    value: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return [yesterday, yesterday]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date()
      return [start, end]
    }
  },
  {
    text: '上月',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return [start, end]
    }
  }
]

// 表格数据
const tableData = ref([
  {
    merchantId: '1',
    merchantName: '测试',
    withdrawNo: '202503141823',
    beforeAmount: '10000.00',
    frozenAmount: '1000.00',
    amount: '5000.00',
    fee: '25.00',
    afterAmount: '4975.00',
    afterFrozen: '500.00',
    status: 'PENDING',
    remark: '日常提现',
    createTime: '2025-03-14 18:23:15'
  },
  {
    merchantId: '2',
    merchantName: '示例商户',
    withdrawNo: '202503141830',
    beforeAmount: '50000.00',
    frozenAmount: '5000.00',
    amount: '20000.00',
    fee: '100.00',
    afterAmount: '29900.00',
    afterFrozen: '3000.00',
    status: 'APPROVED',
    remark: '大额提现，已人工核实',
    createTime: '2025-03-14 18:30:25'
  },
  {
    merchantId: '3',
    merchantName: '新商户',
    withdrawNo: '202503141845',
    beforeAmount: '15000.00',
    frozenAmount: '2000.00',
    amount: '5000.00',
    fee: '25.00',
    afterAmount: '9975.00',
    afterFrozen: '1000.00',
    status: 'REJECTED',
    remark: '风控拦截，疑似套现',
    createTime: '2025-03-14 18:45:30'
  },
  {
    merchantId: '1',
    merchantName: '测试',
    withdrawNo: '202503141900',
    beforeAmount: '8500.00',
    frozenAmount: '500.00',
    amount: '3000.00',
    fee: '15.00',
    afterAmount: '5485.00',
    afterFrozen: '0.00',
    status: 'PAID',
    remark: '已完成打款',
    createTime: '2025-03-14 19:00:10'
  },
  {
    merchantId: '2',
    merchantName: '示例商户',
    withdrawNo: '202503141915',
    beforeAmount: '30000.00',
    frozenAmount: '3000.00',
    amount: '10000.00',
    fee: '50.00',
    afterAmount: '19950.00',
    afterFrozen: '1000.00',
    status: 'FAILED',
    remark: '银行账户错误，打款失败',
    createTime: '2025-03-14 19:15:45'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 125
})

// 审核对话框
const dialogVisible = ref(false)
const dialogType = ref('approve')
const auditFormRef = ref(null)
const auditForm = reactive({
  withdrawNo: '',
  merchantName: '',
  amount: '',
  remark: ''
})

// 批量审核对话框
const batchDialogVisible = ref(false)
const batchDialogType = ref('approve')
const batchAuditFormRef = ref(null)
const batchAuditForm = reactive({
  remark: ''
})

// 选中的行
const selectedRows = ref([])

// 审核表单验证规则
const auditRules = {
  remark: [
    { required: true, message: '请输入审核意见', trigger: 'blur' },
    { min: 5, message: '审核意见不能少于5个字符', trigger: 'blur' }
  ]
}

// 状态映射
const getStatusType = (status) => {
  const map = {
    PENDING: 'warning',
    APPROVED: 'primary',
    REJECTED: 'danger',
    PROCESSING: 'info',
    PAID: 'success',
    FAILED: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    PENDING: '未确认',
    APPROVED: '审核通过',
    REJECTED: '审核拒绝',
    PROCESSING: '打款中',
    PAID: '成功',
    FAILED: '失败'
  }
  return map[status] || '未知状态'
}

// 选择行变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  ElMessage.success('搜索条件已提交')
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    withdrawNo: '',
    status: '',
    dateRange: []
  })
}

// 导出
const handleExport = () => {
  ElMessage.success('提现记录导出成功')
}

// 查看详情
const handleView = (row) => {
  ElMessageBox.alert(
    `提现单号：${row.withdrawNo}<br>
    商户：${row.merchantName}<br>
    提现金额：${row.amount}<br>
    手续费：${row.fee}<br>
    状态：${getStatusText(row.status)}<br>
    备注：${row.remark || '无'}`, 
    '提现详情', 
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}

// 审核通过
const handleApprove = (row) => {
  dialogType.value = 'approve'
  Object.assign(auditForm, {
    withdrawNo: row.withdrawNo,
    merchantName: row.merchantName,
    amount: row.amount,
    remark: ''
  })
  dialogVisible.value = true
}

// 审核拒绝
const handleReject = (row) => {
  dialogType.value = 'reject'
  Object.assign(auditForm, {
    withdrawNo: row.withdrawNo,
    merchantName: row.merchantName,
    amount: row.amount,
    remark: ''
  })
  dialogVisible.value = true
}

// 批量审核通过
const handleBatchApprove = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择需要审核的记录')
    return
  }
  
  // 检查是否所有选中的记录都是待审核状态
  const invalidRows = selectedRows.value.filter(row => row.status !== 'PENDING')
  if (invalidRows.length > 0) {
    ElMessage.warning('您选中的记录中包含非待审核状态的记录，请重新选择')
    return
  }
  
  batchDialogType.value = 'approve'
  batchAuditForm.remark = ''
  batchDialogVisible.value = true
}

// 批量审核拒绝
const handleBatchReject = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择需要审核的记录')
    return
  }
  
  // 检查是否所有选中的记录都是待审核状态
  const invalidRows = selectedRows.value.filter(row => row.status !== 'PENDING')
  if (invalidRows.length > 0) {
    ElMessage.warning('您选中的记录中包含非待审核状态的记录，请重新选择')
    return
  }
  
  batchDialogType.value = 'reject'
  batchAuditForm.remark = ''
  batchDialogVisible.value = true
}

// 提交审核
const handleAuditSubmit = async () => {
  if (!auditFormRef.value) return
  await auditFormRef.value.validate((valid) => {
    if (valid) {
      console.log('审核信息：', {
        type: dialogType.value,
        ...auditForm
      })
      ElMessage.success(dialogType.value === 'approve' ? '审核通过成功' : '审核拒绝成功')
      dialogVisible.value = false
    }
  })
}

// 提交批量审核
const handleBatchSubmit = async () => {
  if (!batchAuditFormRef.value) return
  await batchAuditFormRef.value.validate((valid) => {
    if (valid) {
      console.log('批量审核信息：', {
        type: batchDialogType.value,
        remark: batchAuditForm.remark,
        records: selectedRows.value.map(row => row.withdrawNo)
      })
      ElMessage.success(batchDialogType.value === 'approve' ? 
        `成功审核通过 ${selectedRows.value.length} 笔提现申请` : 
        `成功拒绝 ${selectedRows.value.length} 笔提现申请`)
      batchDialogVisible.value = false
    }
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
</script>

<style lang="scss" scoped>
.order-withdraw {
  padding: 12px;

  .filter-container {
    margin-bottom: 16px;
  }

  .filter-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .filter-form .el-form-item {
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
}

:deep(.el-form-item) {
  margin-bottom: 12px;
  margin-right: 16px;
}

:deep(.el-form-item:last-child) {
  margin-right: 0;
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  padding-right: 8px;
}

:deep(.el-date-editor.el-input__wrapper) {
  --el-date-editor-width: auto;
}

:deep(.el-card__header) {
  padding: 10px 16px;
}

:deep(.el-card__body) {
  padding: 12px;
}
</style> 