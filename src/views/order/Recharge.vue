<!-- 订单管理/商户充值列表 - 管理商户账户充值记录 -->
<template>
  <div class="recharge-list">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-card">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="充值订单号">
            <el-input v-model="searchForm.rechargeNo" placeholder="请输入充值订单号" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部状态" value="all" />
              <el-option label="待支付" value="pending" />
              <el-option label="支付中" value="processing" />
              <el-option label="充值成功" value="success" />
              <el-option label="充值失败" value="failed" />
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
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 统计信息区域 -->
    <div class="stat-tags">
      <el-tag type="success" effect="plain">总充值笔数：1000</el-tag>
      <el-tag type="success" effect="plain">总充值金额：{{ formatAmount(3500000) }}</el-tag>
      <el-tag type="success" effect="plain">成功笔数：850</el-tag>
      <el-tag type="success" effect="plain">成功金额：{{ formatAmount(3000000) }}</el-tag>
      <el-tag type="success" effect="plain">充值成功率：85.00%</el-tag>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-header">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">发起充值</el-button>
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
        <el-table-column prop="rechargeNo" label="充值订单号" width="140" />
        <el-table-column prop="beforeAmount" label="充值前余额" width="120">
          <template #default="scope">
            {{ formatAmount(scope.row.beforeAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="beforeFrozen" label="原始冻结" width="120">
          <template #default="scope">
            {{ formatAmount(scope.row.beforeFrozen || 0) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="充值金额" width="120">
          <template #default="scope">
            {{ formatAmount(scope.row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="afterAmount" label="充值后余额" width="120">
          <template #default="scope">
            {{ formatAmount(scope.row.afterAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="afterFrozen" label="充值后冻结" width="120">
          <template #default="scope">
            {{ formatAmount(scope.row.afterFrozen || 0) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
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
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleView(scope.row)">
              查看
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

    <!-- 充值表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="发起充值"
      width="500px"
    >
      <el-form
        ref="rechargeFormRef"
        :model="rechargeForm"
        :rules="rechargeRules"
        label-width="100px"
      >
        <el-form-item label="商户名称" prop="merchantId">
          <el-select
            v-model="rechargeForm.merchantId"
            placeholder="请选择商户"
            style="width: 360px"
            filterable
          >
            <el-option label="测试商户A" value="1" />
            <el-option label="测试商户B" value="2" />
            <el-option label="测试商户C" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="充值金额" prop="amount">
          <el-input v-model="rechargeForm.amount" style="width: 360px">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="原始冻结" prop="beforeFrozen">
          <el-input v-model="rechargeForm.beforeFrozen" style="width: 360px" disabled>
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="充值后冻结" prop="afterFrozen">
          <el-input v-model="rechargeForm.afterFrozen" style="width: 360px">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="rechargeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            style="width: 360px"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, Plus, View, Printer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  rechargeNo: '',
  merchantId: '',
  merchantName: '',
  merchantType: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    merchantId: '1',
    merchantName: '测试商户',
    rechargeNo: '202503141725',
    beforeAmount: '1000.00',
    beforeFrozen: '100.00',
    amount: '500.00',
    afterAmount: '1500.00',
    afterFrozen: '100.00',
    status: 'success',
    remark: '常规充值',
    createTime: '2025-03-14 17:25:30'
  },
  {
    merchantId: '1',
    merchantName: '测试商户',
    rechargeNo: '202503141726',
    beforeAmount: '1500.00',
    beforeFrozen: '100.00',
    amount: '2000.00',
    afterAmount: '3500.00',
    afterFrozen: '100.00',
    status: 'success',
    remark: '运营活动充值',
    createTime: '2025-03-14 17:26:15'
  },
  {
    merchantId: '2',
    merchantName: '示例商户',
    rechargeNo: '202503141728',
    beforeAmount: '5000.00',
    beforeFrozen: '500.00',
    amount: '10000.00',
    afterAmount: '15000.00',
    afterFrozen: '500.00',
    status: 'pending',
    remark: '紧急充值',
    createTime: '2025-03-14 17:28:45'
  },
  {
    merchantId: '3',
    merchantName: '新商户',
    rechargeNo: '202503141730',
    beforeAmount: '0.00',
    beforeFrozen: '0.00',
    amount: '50000.00',
    afterAmount: '50000.00',
    afterFrozen: '0.00',
    status: 'success',
    remark: '首次充值',
    createTime: '2025-03-14 17:30:22'
  },
  {
    merchantId: '1',
    merchantName: '测试商户',
    rechargeNo: '202503141732',
    beforeAmount: '3500.00',
    beforeFrozen: '100.00',
    amount: '5000.00',
    afterAmount: '8500.00',
    afterFrozen: '100.00',
    status: 'failed',
    remark: '支付超时',
    createTime: '2025-03-14 17:32:10'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 125
})

// 充值表单对话框
const dialogVisible = ref(false)
const rechargeFormRef = ref(null)
const rechargeForm = reactive({
  merchantId: '',
  amount: '',
  beforeFrozen: '',
  afterFrozen: '',
  remark: ''
})

// 充值表单验证规则
const rechargeRules = {
  merchantId: [
    { required: true, message: '请选择商户', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('充值金额必须大于0'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

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
    success: '充值成功',
    failed: '充值失败'
  }
  return map[status] || '未知状态'
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  ElMessage.success('搜索条件已提交')
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    rechargeNo: '',
    merchantId: '',
    merchantName: '',
    merchantType: '',
    status: '',
    dateRange: []
  })
}

// 导出
const handleExport = () => {
  ElMessage.success('充值记录导出成功')
}

// 发起充值
const handleAdd = () => {
  Object.assign(rechargeForm, {
    merchantId: '',
    amount: '',
    beforeFrozen: '',
    afterFrozen: '',
    remark: ''
  })
  dialogVisible.value = true
}

// 提交充值
const handleSubmit = async () => {
  if (!rechargeFormRef.value) return
  await rechargeFormRef.value.validate((valid) => {
    if (valid) {
      // 显示所有字段
      console.log('充值信息：', {
        merchantId: rechargeForm.merchantId,
        amount: rechargeForm.amount,
        beforeFrozen: rechargeForm.beforeFrozen || '0.00',
        afterFrozen: rechargeForm.afterFrozen || '0.00',
        remark: rechargeForm.remark
      })
      
      ElMessage.success('充值申请提交成功')
      dialogVisible.value = false
    }
  })
}

// 查看详情
const handleView = (row) => {
  ElMessageBox.alert(
    `充值订单号：${row.rechargeNo}<br>
    商户ID：${row.merchantId}<br>
    商户名称：${row.merchantName}<br>
    充值前余额：${formatAmount(row.beforeAmount)}<br>
    原始冻结：${formatAmount(row.beforeFrozen || 0)}<br>
    充值金额：${formatAmount(row.amount)}<br>
    充值后余额：${formatAmount(row.afterAmount)}<br>
    充值后冻结：${formatAmount(row.afterFrozen || 0)}<br>
    备注：${row.remark || '-'}<br>
    状态：${getStatusText(row.status)}<br>
    操作时间：${row.createTime}`, 
    '充值详情', 
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
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
.recharge-list {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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