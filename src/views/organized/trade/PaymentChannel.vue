<template>
  <div class="payment-channel-container">
    <el-card shadow="never">
      <el-table
        :data="channelList"
        border
        stripe
        style="width: 100%">
        <el-table-column 
          type="index" 
          label="序号" 
          width="70" 
          align="center" />
        <el-table-column 
          prop="id" 
          label="支付产品编码" 
          width="120">
          <template #default="scope">
            <div class="code-cell">
              <span>{{ scope.row.id }}</span>
              <el-tooltip content="复制编码" placement="top">
                <el-icon class="copy-icon" @click="copyContent(scope.row.id)"><CopyDocument /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column 
          prop="name" 
          label="支付产品名称" 
          min-width="150" />
        <el-table-column 
          prop="merchantFee" 
          label="商户费率" 
          width="120"
          align="center">
          <template #default="scope">
            <span>{{ scope.row.merchantFee.replace('.00', '') }}%</span>
          </template>
        </el-table-column>
        <el-table-column 
          prop="status" 
          label="状态" 
          width="100" 
          align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '启用' ? 'success' : 'info'" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          label="操作" 
          width="120" 
          align="center" 
          fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              plain 
              @click="handlePayment(scope.row)">
              拉单测试
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 发起支付弹窗 -->
    <el-dialog
      v-model="paymentDialogVisible"
      :title="'拉单测试：' + selectedChannel.name + ' - ' + selectedChannel.id"
      width="500px"
      :close-on-click-modal="false"
      @close="resetPaymentForm"
      class="payment-dialog"
    >
      <div class="dialog-content">
        <el-form
          ref="paymentFormRef"
          :model="paymentForm"
          :rules="paymentRules"
          label-width="80px"
          status-icon
        >
          <el-form-item label="支付金额" prop="amount" required class="amount-item">
            <el-input
              v-model="paymentForm.amount"
              placeholder="请输入支付金额"
            >
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>

          <div class="fee-info">
            <span class="limit-range">[{{ selectedChannel.limitRange }}]</span>
          </div>
          
          <div class="result-section">
            <div class="result-title">下单结果：</div>
            <el-input
              v-model="requestParams"
              type="textarea"
              rows="3"
              readonly
              resize="none"
              placeholder="请求参数"
            />
            
            <div class="result-title">返回结果：</div>
            <el-input
              v-model="responseResult"
              type="textarea"
              rows="3"
              readonly
              resize="none"
            />
          </div>
        </el-form>

        <div class="action-buttons">
          <el-button type="primary" @click="submitPayment" :loading="submitting">拉单测试</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, InfoFilled, ArrowDown } from '@element-plus/icons-vue'

// 支付通道数据
const channelList = ref([
  {
    id: '1119',
    name: '支付产品A',
    status: '禁用',
    limitRange: '¥300.00 ~ ¥2000.00',
    merchantFee: '4.00'
  },
  {
    id: '119',
    name: '支付产品B',
    status: '启用',
    limitRange: '¥50.00 ~ ¥1000.00',
    merchantFee: '4.00'
  },
  {
    id: '1111',
    name: '支付产品C',
    status: '启用',
    limitRange: '¥100.00 ~ ¥5000.00',
    merchantFee: '4.00'
  },
  {
    id: '1112',
    name: '支付产品D',
    status: '启用',
    limitRange: '¥200.00 ~ ¥3000.00',
    merchantFee: '4.00'
  },
  {
    id: '1115',
    name: '支付产品E',
    status: '启用',
    limitRange: '¥2000.00 ~ ¥20000.00',
    merchantFee: '4.00'
  },
  {
    id: '1114',
    name: '支付产品F',
    status: '启用',
    limitRange: '¥800.00 ~ ¥20000.00',
    merchantFee: '4.00'
  },
  {
    id: '1128',
    name: '支付产品G',
    status: '启用',
    limitRange: '¥100.00 ~ ¥2000.00',
    merchantFee: '4.00'
  },
  {
    id: '1117',
    name: '支付产品H',
    status: '启用',
    limitRange: '¥300.00 ~ ¥20000.00',
    merchantFee: '4.00'
  },
  {
    id: '116',
    name: '支付产品I',
    status: '禁用',
    limitRange: '¥800.00 ~ ¥20000.00',
    merchantFee: '4.00'
  },
  {
    id: '1113',
    name: '支付产品J',
    status: '启用',
    limitRange: '¥500.00 ~ ¥20000.00',
    merchantFee: '4.00'
  }
])

// 支付弹窗相关
const paymentDialogVisible = ref(false)
const submitting = ref(false)
const paymentFormRef = ref(null)
const selectedChannel = ref({})

// 支付表单数据
const paymentForm = reactive({
  amount: ''
})

// 表单验证规则
const paymentRules = {
  amount: [
    { required: true, message: '请输入支付金额', trigger: 'blur' },
    { pattern: /^\d+(\.\d{0,2})?$/, message: '请输入正确的金额格式', trigger: 'blur' }
  ]
}

// 请求参数和返回结果
const requestParams = ref('')
const responseResult = ref('')

// 处理支付
const handlePayment = (channel) => {
  selectedChannel.value = channel
  paymentDialogVisible.value = true
}

// 重置支付表单
const resetPaymentForm = () => {
  paymentFormRef.value?.resetFields()
  Object.keys(paymentForm).forEach(key => {
    paymentForm[key] = ''
  })
  requestParams.value = ''
  responseResult.value = ''
}

// 提交支付
const submitPayment = () => {
  paymentFormRef.value?.validate((valid) => {
    if (valid) {
      submitting.value = true
      
      // 构建请求参数
      const params = {
        channelId: selectedChannel.value.id,
        channelName: selectedChannel.value.name,
        amount: paymentForm.amount
      }
      
      // 显示请求参数
      requestParams.value = JSON.stringify(params, null, 2)
      
      // 模拟API调用
      setTimeout(() => {
        submitting.value = false
        // 模拟返回结果
        responseResult.value = JSON.stringify({
          code: 200,
          message: '支付请求已受理',
          data: {
            orderId: Date.now().toString(),
            status: 'PROCESSING'
          }
        }, null, 2)
        
        ElMessage.success('支付请求已提交')
      }, 1500)
    }
  })
}

// 复制内容
const copyContent = (content) => {
  try {
    navigator.clipboard.writeText(content)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
    console.error('复制失败:', error)
  }
}
</script>

<style scoped>
.payment-channel-container {
  padding: 20px;
}

.code-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.copy-icon {
  margin-left: 8px;
  font-size: 14px;
  color: #909399;
  cursor: pointer;
}

.copy-icon:hover {
  color: #409EFF;
}

.fee-info {
  font-size: 14px;
  color: #909399;
  margin: -10px 0 15px 80px;
  display: flex;
  align-items: center;
}

.info-icon {
  margin-left: 4px;
  font-size: 16px;
  color: #909399;
  cursor: pointer;
}

.result-section {
  margin-top: 20px;
}

.result-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  font-weight: normal;
}

:deep(.el-input__wrapper) {
  width: 100%;
}

.more-params {
  margin-bottom: 20px;
}

.more-params-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 10px 0;
  color: #409EFF;
  font-size: 14px;
}

.arrow-icon {
  transition: transform 0.3s;
  font-size: 16px;
}

.arrow-icon.is-active {
  transform: rotate(180deg);
}

.payment-dialog {
  /* Add any custom styles for the payment dialog if needed */
}

.amount-item {
  /* Add any custom styles for the amount item if needed */
}

.limit-range {
  /* Add any custom styles for the limit range if needed */
}

/* 支付弹窗样式 */
:deep(.payment-dialog .el-dialog__header) {
  margin: 0;
  padding: 15px 20px;
  border-bottom: 1px solid #EBEEF5;
}

:deep(.payment-dialog .el-dialog__headerbtn) {
  top: 15px;
}

:deep(.payment-dialog .el-dialog__body) {
  padding: 20px;
}

.amount-item {
  margin-bottom: 8px !important;
}

.amount-item :deep(.el-input__wrapper) {
  padding-left: 8px;
}

.amount-item :deep(.el-input__prefix) {
  margin-right: 4px;
  color: #606266;
}

.fee-info {
  font-size: 13px;
  color: #606266;
  margin: 0 0 15px 80px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.limit-range {
  color: #909399;
}

.more-params {
  margin: 0 0 15px;
  border-radius: 4px;
}

.more-params-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px 0;
  color: #409EFF;
  font-size: 13px;
}

.arrow-icon {
  transition: transform 0.3s;
  font-size: 14px;
}

.arrow-icon.is-active {
  transform: rotate(180deg);
}

.more-params-content {
  padding-top: 15px;
}

.result-section {
  margin-top: 15px;
}

.result-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

:deep(.el-textarea__inner) {
  font-family: monospace;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  font-weight: normal;
}

:deep(.el-input__wrapper) {
  width: 100%;
}

.dialog-content {
  position: relative;
  padding-right: 100px;
}

.action-buttons {
  position: absolute;
  top: 0;
  right: 0;
}

.action-buttons .el-button {
  width: 90px;
}
</style> 