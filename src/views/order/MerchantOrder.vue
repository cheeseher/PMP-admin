<!-- 订单管理/商户订单管理 - 展示和管理商户的订单列表 -->
<template>
  <div class="merchant-order">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日交易总额</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥ 358,000.00</span>
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
              <span>今日订单笔数</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">1,286</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                12.5%
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
            <span class="amount">99.8%</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="info" size="small">
                <el-icon><Minus /></el-icon>
                0.1%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日退款金额</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥ 2,360.00</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="danger" size="small">
                <el-icon><ArrowDown /></el-icon>
                8.3%
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
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="商户订单号">
          <el-input v-model="searchForm.merchantOrderNo" placeholder="请输入商户订单号" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="支付通道">
          <el-select v-model="searchForm.channelId" placeholder="请选择通道" style="width: 168px" clearable>
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wxpay" />
            <el-option label="银联" value="unionpay" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 168px" clearable>
            <el-option label="待支付" value="pending" />
            <el-option label="支付中" value="processing" />
            <el-option label="支付成功" value="success" />
            <el-option label="支付失败" value="failed" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
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
          <span>订单列表</span>
          <div class="right">
            <el-button type="success" :icon="Download" @click="handleExport">导出Excel</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="merchantOrderNo" label="商户订单号" width="180" />
        <el-table-column prop="merchantName" label="商户名称" width="150" />
        <el-table-column prop="amount" label="订单金额" width="120">
          <template #default="scope">
            ¥ {{ scope.row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="channelName" label="支付通道" width="120" />
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column prop="payTime" label="支付时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="View" @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button 
              v-if="scope.row.status === 'success'"
              type="primary" 
              link 
              :icon="TurnOff"
              @click="handleRefund(scope.row)"
            >
              退款
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

    <!-- 退款对话框 -->
    <el-dialog
      v-model="refundVisible"
      title="订单退款"
      width="500px"
    >
      <el-form
        ref="refundFormRef"
        :model="refundForm"
        :rules="refundRules"
        label-width="100px"
      >
        <el-form-item label="订单号">
          <el-input v-model="refundForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="商户订单号">
          <el-input v-model="refundForm.merchantOrderNo" disabled />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input v-model="refundForm.orderAmount" disabled>
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="退款金额" prop="refundAmount">
          <el-input v-model="refundForm.refundAmount">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="退款原因" prop="refundReason">
          <el-input
            v-model="refundForm.refundReason"
            type="textarea"
            :rows="3"
            placeholder="请输入退款原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="refundVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRefundSubmit">确认退款</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, View, TurnOff, Close, ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  merchantName: '',
  orderNo: '',
  merchantOrderNo: '',
  channelId: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    orderNo: 'P202403150001',
    merchantOrderNo: 'M202403150001',
    merchantName: '测试商户A',
    amount: 1000.00,
    channelName: '支付宝',
    status: 'success',
    createTime: '2024-03-15 10:00:00',
    payTime: '2024-03-15 10:01:23'
  },
  {
    orderNo: 'P202403150002',
    merchantOrderNo: 'M202403150002',
    merchantName: '测试商户B',
    amount: 2000.00,
    channelName: '微信支付',
    status: 'processing',
    createTime: '2024-03-15 10:05:00',
    payTime: '-'
  },
  {
    orderNo: 'P202403150003',
    merchantOrderNo: 'M202403150003',
    merchantName: '测试商户A',
    amount: 3000.00,
    channelName: '银联',
    status: 'failed',
    createTime: '2024-03-15 10:10:00',
    payTime: '-'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 退款对话框
const refundVisible = ref(false)
const refundFormRef = ref(null)
const refundForm = reactive({
  orderNo: '',
  merchantOrderNo: '',
  orderAmount: '',
  refundAmount: '',
  refundReason: ''
})

// 退款表单验证规则
const refundRules = {
  refundAmount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('退款金额必须大于0'))
        } else if (value > refundForm.orderAmount) {
          callback(new Error('退款金额不能大于订单金额'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  refundReason: [
    { required: true, message: '请输入退款原因', trigger: 'blur' }
  ]
}

// 状态映射
const getStatusType = (status) => {
  const map = {
    pending: 'info',
    processing: 'warning',
    success: 'success',
    failed: 'danger',
    refunded: ''
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    pending: '待支付',
    processing: '支付中',
    success: '支付成功',
    failed: '支付失败',
    refunded: '已退款'
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
    orderNo: '',
    merchantOrderNo: '',
    channelId: '',
    status: '',
    dateRange: []
  })
}

// 导出
const handleExport = () => {
  ElMessage.success('订单数据导出成功')
}

// 查看详情
const handleView = (row) => {
  console.log('查看订单：', row)
}

// 退款
const handleRefund = (row) => {
  Object.assign(refundForm, {
    orderNo: row.orderNo,
    merchantOrderNo: row.merchantOrderNo,
    orderAmount: row.amount,
    refundAmount: '',
    refundReason: ''
  })
  refundVisible.value = true
}

// 提交退款
const handleRefundSubmit = async () => {
  if (!refundFormRef.value) return
  await refundFormRef.value.validate((valid) => {
    if (valid) {
      ElMessageBox.confirm(
        `确认要退款 ¥${refundForm.refundAmount} 吗？`,
        '退款确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        console.log('退款信息：', refundForm)
        ElMessage.success('退款申请提交成功')
        refundVisible.value = false
      }).catch(() => {})
    }
  })
}

// 关闭订单
const handleCancel = (row) => {
  ElMessageBox.confirm(
    '确认要关闭该订单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    console.log('关闭订单：', row)
    ElMessage.success('订单已关闭')
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
.merchant-order {
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