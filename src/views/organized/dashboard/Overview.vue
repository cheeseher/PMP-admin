<!-- 商户后台/主页 - 商户数据概览 -->
<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistic-cards-row">
      <!-- 商户余额 -->
      <el-col :span="6">
        <div class="statistic-card border-primary">
          <div class="card-header">
            <div class="card-title">商户余额</div>
          </div>
          <div class="card-content">
            <div class="statistic-value">¥{{ balanceData.toFixed(2) }}</div>
          </div>
        </div>
      </el-col>
      
      <!-- 收款总额 -->
      <el-col :span="6">
        <div class="statistic-card border-success">
          <div class="card-header">
            <div class="card-title">收款总额</div>
            <div class="statistic-tabs">
              <el-radio-group v-model="paymentTimeRange" size="small">
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
                <el-radio-button label="total">总计</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="card-content">
            <div class="statistic-value">¥{{ formatAmount(paymentAmount) }}</div>
            <div class="card-info">成功率：<span class="text-success">{{ formatSuccessRate(paymentSuccessCount, paymentTotalCount) }}</span></div>
          </div>
        </div>
      </el-col>
      
      <!-- 入账金额 -->
      <el-col :span="6">
        <div class="statistic-card border-warning">
          <div class="card-header">
            <div class="card-title">入账金额</div>
            <div class="statistic-tabs">
              <el-radio-group v-model="incomeTimeRange" size="small">
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
                <el-radio-button label="total">总计</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="card-content">
            <div class="statistic-value">¥{{ formatAmount(incomeAmount) }}</div>
            <div class="card-info">
              较{{ incomeTimeRange === 'today' ? '昨日' : incomeTimeRange === 'yesterday' ? '前日' : '上月' }}: 
              <span :class="incomeChange >= 0 ? 'text-increase' : 'text-decrease'">
                {{ incomeChange >= 0 ? '+' : '' }}{{ incomeChange }}%
              </span>
            </div>
          </div>
        </div>
      </el-col>
      
      <!-- 手续费 -->
      <el-col :span="6">
        <div class="statistic-card border-info">
          <div class="card-header">
            <div class="card-title">手续费</div>
            <div class="statistic-tabs">
              <el-radio-group v-model="feeTimeRange" size="small">
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
                <el-radio-button label="total">总计</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="card-content">
            <div class="statistic-value">¥{{ formatAmount(feeAmount) }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 账户信息和最近登录卡片 -->
    <el-row :gutter="20">
      <!-- 账户信息卡片 -->
      <el-col :span="12">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-header">
            <span class="card-title">账户信息</span>
          </div>
          
          <!-- 账户基本信息 -->
          <div class="account-info">
            <div class="info-item">
              <div class="info-label">商户名称:</div>
              <div class="info-value">{{ merchantInfo.name }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">商户ID:</div>
              <div class="info-value">
                {{ merchantInfo.id }}
                <el-tooltip content="复制ID" placement="top">
                  <el-icon class="copy-icon" @click="copyMerchantId"><CopyDocument /></el-icon>
                </el-tooltip>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">注册时间:</div>
              <div class="info-value">{{ merchantInfo.registerTime }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 最近登录卡片 -->
      <el-col :span="12">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-header">
            <span class="card-title">最近登录</span>
          </div>
          
          <div class="login-info">
            <div class="info-item">
              <div class="info-label">登录账号:</div>
              <div class="info-value">{{ loginInfo.username }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">登录时间:</div>
              <div class="info-value">{{ loginInfo.time }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">登录地址:</div>
              <div class="info-value">{{ loginInfo.ip }} {{ loginInfo.location ? `(${loginInfo.location})` : '' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 商户余额数据
const balanceData = ref(10526.89)

// 收款总额数据
const paymentTimeRange = ref('today')
const paymentData = {
  today: { amount: 5689.50, successCount: 58, totalCount: 72 },
  yesterday: { amount: 4892.30, successCount: 47, totalCount: 65 },
  total: { amount: 235689.75, successCount: 2356, totalCount: 2850 }
}
const paymentAmount = computed(() => {
  return paymentData[paymentTimeRange.value].amount
})
const paymentSuccessCount = computed(() => {
  return paymentData[paymentTimeRange.value].successCount
})
const paymentTotalCount = computed(() => {
  return paymentData[paymentTimeRange.value].totalCount
})

// 入账金额数据
const incomeTimeRange = ref('today')
const incomeData = {
  today: { amount: 5420.75, change: 5.2 },
  yesterday: { amount: 5152.80, change: -3.1 },
  total: { amount: 225140.25, change: 12.5 }
}
const incomeAmount = computed(() => {
  return incomeData[incomeTimeRange.value].amount
})
const incomeChange = computed(() => {
  return incomeData[incomeTimeRange.value].change
})

// 手续费数据
const feeTimeRange = ref('today')
const feeData = {
  today: { amount: 268.75, rate: 4.96 },
  yesterday: { amount: 239.50, rate: 4.65 },
  total: { amount: 10549.50, rate: 4.86 }
}
const feeAmount = computed(() => {
  return feeData[feeTimeRange.value].amount
})
const averageFeeRate = computed(() => {
  return feeData[feeTimeRange.value].rate
})

// 格式化金额
const formatAmount = (amount) => {
  return amount.toFixed(2)
}

// 格式化成功率
const formatSuccessRate = (successCount, totalCount) => {
  if (totalCount === 0) return '0%（0/0）'
  const rate = Math.round((successCount / totalCount) * 100)
  return `${rate}%（${successCount}/${totalCount}）`
}

// 商户信息
const merchantInfo = ref({
  name: '商户A',
  id: '1001',
  registerTime: '2024/04/15 10:30:45'
})

// 登录信息
const loginInfo = ref({
  username: 'merchant_admin',
  time: '2024/05/21 08:45:12',
  ip: '192.168.1.120',
  location: '中国上海电信'
})

// 复制ID
const copyMerchantId = () => {
  navigator.clipboard.writeText(merchantInfo.value.id).then(() => {
    ElMessage.success('商户ID已复制')
  })
}

onMounted(() => {
  // 页面初始化
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.statistic-cards-row {
  margin-bottom: 20px;
}

.statistic-card {
  height: 140px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.statistic-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
}

.border-primary {
  border-left-color: #409EFF;
}

.border-success {
  border-left-color: #67C23A;
}

.border-warning {
  border-left-color: #E6A23C;
}

.border-info {
  border-left-color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #606266;
}

.card-content {
  height: calc(100% - 32px);
  display: flex;
  flex-direction: column;
}

.statistic-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 8px 0;
  flex-grow: 1;
}

.card-info {
  font-size: 13px;
  color: #909399;
  margin-top: auto;
}

.text-increase {
  color: #67C23A;
  font-weight: 500;
}

.text-decrease {
  color: #F56C6C;
  font-weight: 500;
}

.text-success {
  color: #409EFF;
  font-weight: 500;
}

.statistic-tabs {
  display: flex;
  justify-content: flex-end;
}

.statistic-tabs .el-radio-button__inner {
  padding: 4px 8px;
  font-size: 12px;
  height: 24px;
  line-height: 1;
}

.dashboard-card {
  margin-bottom: 16px;
  height: 100%;
  border-radius: 4px;
}

.account-info, .login-info {
  margin-bottom: 0;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.info-label {
  color: #909399;
  min-width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  display: flex;
  align-items: center;
}

.copy-icon {
  margin-left: 8px;
  color: #909399;
  cursor: pointer;
}

.copy-icon:hover {
  color: #409EFF;
}
</style> 