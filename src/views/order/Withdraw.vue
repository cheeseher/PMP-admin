<!-- 订单管理/商户提现审核 - 处理商户的提现申请 -->
<template>
  <div class="withdraw-list">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日提现总额</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥ 238,500.00</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                15.2%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待审核总额</span>
              <el-tag type="warning" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥ 85,000.00</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="danger" size="small">
                <el-icon><ArrowUp /></el-icon>
                25.8%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日审核笔数</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">156</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                12.3%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待审核笔数</span>
              <el-tag type="warning" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">32</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="danger" size="small">
                <el-icon><ArrowUp /></el-icon>
                18.5%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索表单 -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="searchForm" label-width="120px" inline>
        <el-form-item label="商户名称">
          <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="提现单号">
          <el-input v-model="searchForm.withdrawNo" placeholder="请输入提现单号" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px">
            <el-option label="待审核" value="PENDING" />
            <el-option label="审核通过" value="APPROVED" />
            <el-option label="审核拒绝" value="REJECTED" />
            <el-option label="打款成功" value="PAID" />
            <el-option label="打款失败" value="FAILED" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>提现审核</span>
          <div class="right">
            <el-button type="success" :icon="Download" @click="handleExport">导出Excel</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="withdrawNo" label="提现单号" width="180" />
        <el-table-column prop="merchantName" label="商户名称" width="150" />
        <el-table-column prop="amount" label="提现金额" width="120">
          <template #default="scope">
            ¥ {{ scope.row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="100">
          <template #default="scope">
            ¥ {{ scope.row.fee.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实际金额" width="120">
          <template #default="scope">
            ¥ {{ scope.row.actualAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="bankInfo" label="收款账户" width="200" />
        <el-table-column prop="riskLevel" label="风险等级" width="100">
          <template #default="scope">
            <el-tag :type="getRiskType(scope.row.riskLevel)">
              {{ getRiskText(scope.row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="提现状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180" />
        <el-table-column prop="auditTime" label="审核时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="View" @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="success"
              link
              :icon="Check"
              @click="handleApprove(scope.row)"
            >
              通过
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="danger"
              link
              :icon="Close"
              @click="handleReject(scope.row)"
            >
              拒绝
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
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, View, Check, Close, ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  merchantName: '',
  withdrawNo: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    withdrawNo: 'W202403150001',
    merchantName: '测试商户A',
    amount: 50000.00,
    fee: 25.00,
    actualAmount: 49975.00,
    bankInfo: '工商银行 6222021234567890123',
    riskLevel: 'low',
    status: 'pending',
    createTime: '2024-03-15 10:00:00',
    auditTime: '-',
    remark: '日常提现'
  },
  {
    withdrawNo: 'W202403150002',
    merchantName: '测试商户B',
    amount: 100000.00,
    fee: 50.00,
    actualAmount: 99950.00,
    bankInfo: '建设银行 6227001234567890123',
    riskLevel: 'medium',
    status: 'approved',
    createTime: '2024-03-15 09:30:00',
    auditTime: '2024-03-15 09:45:00',
    remark: '大额提现，已人工核实'
  },
  {
    withdrawNo: 'W202403150003',
    merchantName: '测试商户C',
    amount: 30000.00,
    fee: 15.00,
    actualAmount: 29985.00,
    bankInfo: '招商银行 6225881234567890123',
    riskLevel: 'high',
    status: 'rejected',
    createTime: '2024-03-15 09:00:00',
    auditTime: '2024-03-15 09:10:00',
    remark: '风控拦截，疑似套现'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
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

// 审核表单验证规则
const auditRules = {
  remark: [
    { required: true, message: '请输入审核意见', trigger: 'blur' },
    { min: 5, message: '审核意见不能少于5个字符', trigger: 'blur' }
  ]
}

// 风险等级映射
const getRiskType = (level) => {
  const map = {
    low: 'success',
    medium: 'warning',
    high: 'danger'
  }
  return map[level]
}

const getRiskText = (level) => {
  const map = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return map[level]
}

// 状态映射
const getStatusType = (status) => {
  const map = {
    pending: 'info',
    approved: 'success',
    rejected: 'danger',
    processing: 'warning',
    success: 'success',
    failed: 'danger'
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    pending: '待审核',
    approved: '审核通过',
    rejected: '审核拒绝',
    processing: '打款中',
    success: '打款成功',
    failed: '打款失败'
  }
  return map[status]
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    merchantName: '',
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
  console.log('查看提现记录：', row)
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

// 提交审核
const handleSubmit = async () => {
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

// 分页事件处理
const handleSizeChange = (val) => {
  console.log('每页条数:', val)
}

const handleCurrentChange = (val) => {
  console.log('当前页:', val)
}
</script>

<style scoped>
.withdraw-list {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.trend {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 12px;
  color: #909399;
}

.right {
  display: flex;
  gap: 12px;
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
</style> 