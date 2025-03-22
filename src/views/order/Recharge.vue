<!-- 订单管理/商户充值列表 - 管理商户账户充值记录 -->
<template>
  <div class="recharge-list">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日充值总额</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥ 156,000.00</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                10.5%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日充值笔数</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">386</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                8.2%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日成功率</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">99.5%</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="info" size="small">
                <el-icon><Minus /></el-icon>
                0.2%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日充值商户数</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">126</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                5.8%
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
        <el-form-item label="充值单号">
          <el-input v-model="searchForm.rechargeNo" placeholder="请输入充值单号" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="充值方式">
          <el-select v-model="searchForm.payMethod" placeholder="请选择方式" style="width: 168px" clearable>
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wxpay" />
            <el-option label="银行转账" value="bank" />
          </el-select>
        </el-form-item>
        <el-form-item label="充值状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 168px" clearable>
            <el-option label="待支付" value="pending" />
            <el-option label="支付中" value="processing" />
            <el-option label="充值成功" value="success" />
            <el-option label="充值失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="充值时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
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
          <span>充值记录</span>
          <div class="right">
            <el-button type="primary" :icon="Plus" @click="handleAdd">发起充值</el-button>
            <el-button type="success" :icon="Download" @click="handleExport">导出Excel</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="rechargeNo" label="充值单号" width="180" />
        <el-table-column prop="merchantName" label="商户名称" width="150" />
        <el-table-column prop="amount" label="充值金额" width="120">
          <template #default="scope">
            ¥ {{ scope.row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="payMethod" label="充值方式" width="120" />
        <el-table-column prop="status" label="充值状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="payTime" label="支付时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="View" @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="danger"
              link
              :icon="Close"
              @click="handleCancel(scope.row)"
            >
              关闭
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
        <el-form-item label="商户名称" prop="merchantName">
          <el-select
            v-model="rechargeForm.merchantName"
            placeholder="请选择商户"
            style="width: 360px"
            filterable
          >
            <el-option label="测试商户A" value="测试商户A" />
            <el-option label="测试商户B" value="测试商户B" />
            <el-option label="测试商户C" value="测试商户C" />
          </el-select>
        </el-form-item>
        <el-form-item label="充值金额" prop="amount">
          <el-input v-model="rechargeForm.amount" style="width: 360px">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="充值方式" prop="payMethod">
          <el-select v-model="rechargeForm.payMethod" placeholder="请选择充值方式" style="width: 360px">
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wxpay" />
            <el-option label="银行转账" value="bank" />
          </el-select>
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
import { Search, Refresh, Download, View, Plus, Close, ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  merchantName: '',
  rechargeNo: '',
  payMethod: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    rechargeNo: 'R202403150001',
    merchantName: '测试商户A',
    amount: 50000.00,
    payMethod: '支付宝',
    status: 'success',
    createTime: '2024-03-15 10:00:00',
    payTime: '2024-03-15 10:01:23',
    remark: '账户余额不足，紧急充值'
  },
  {
    rechargeNo: 'R202403150002',
    merchantName: '测试商户B',
    amount: 100000.00,
    payMethod: '银行转账',
    status: 'processing',
    createTime: '2024-03-15 10:05:00',
    payTime: '-',
    remark: '月度常规充值'
  },
  {
    rechargeNo: 'R202403150003',
    merchantName: '测试商户C',
    amount: 30000.00,
    payMethod: '微信支付',
    status: 'pending',
    createTime: '2024-03-15 10:10:00',
    payTime: '-',
    remark: '新商户首次充值'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 充值表单对话框
const dialogVisible = ref(false)
const rechargeFormRef = ref(null)
const rechargeForm = reactive({
  merchantName: '',
  amount: '',
  payMethod: '',
  remark: ''
})

// 充值表单验证规则
const rechargeRules = {
  merchantName: [
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
  ],
  payMethod: [
    { required: true, message: '请选择充值方式', trigger: 'change' }
  ]
}

// 状态映射
const getStatusType = (status) => {
  const map = {
    pending: 'info',
    processing: 'warning',
    success: 'success',
    failed: 'danger'
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    pending: '待支付',
    processing: '支付中',
    success: '充值成功',
    failed: '充值失败'
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
    rechargeNo: '',
    payMethod: '',
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
    merchantName: '',
    amount: '',
    payMethod: '',
    remark: ''
  })
  dialogVisible.value = true
}

// 提交充值
const handleSubmit = async () => {
  if (!rechargeFormRef.value) return
  await rechargeFormRef.value.validate((valid) => {
    if (valid) {
      console.log('充值信息：', rechargeForm)
      ElMessage.success('充值申请提交成功')
      dialogVisible.value = false
    }
  })
}

// 查看详情
const handleView = (row) => {
  console.log('查看充值记录：', row)
}

// 关闭充值单
const handleCancel = (row) => {
  ElMessageBox.confirm(
    '确认要关闭该充值单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    console.log('关闭充值单：', row)
    ElMessage.success('充值单已关闭')
  }).catch(() => {})
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
.recharge-list {
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