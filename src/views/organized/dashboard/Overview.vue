<!-- 商户后台/主页 - 商户数据概览 -->
<template>
  <div class="dashboard-container">
    <!-- 商户筛选 (当我们是主账户且有子账户时显示) -->
    <el-card shadow="never" class="filter-card" v-if="subAccounts.length > 0">
      <div class="filter-header">
        <span class="filter-label">商户筛选：</span>
        <el-select v-model="selectedMerchantFilter" placeholder="全部商户" style="width: 200px" @change="handleMerchantFilterChange">
          <el-option label="全部商户" value="" />
          <el-option 
            v-for="account in subAccounts" 
            :key="account.id" 
            :label="`${account.productName} (${account.id})`" 
            :value="account.id" 
          />
        </el-select>
      </div>
    </el-card>
    <!-- 商户数据区块循环 -->
    <div v-for="item in dashboardData" :key="item.id" class="merchant-block">
      <div class="block-header">
        <span class="block-title">{{ item.name }} (ID: {{ item.id }})</span>
      </div>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="statistic-cards-row">
        <!-- 商户余额 -->
        <el-col :span="6">
          <div class="statistic-card border-primary">
            <div class="card-header">
              <div class="card-title">商户余额</div>
            </div>
            <div class="card-content">
              <div class="statistic-value">¥{{ formatAmount(item.balance) }}</div>
            </div>
          </div>
        </el-col>
        
        <!-- 收款总额 -->
        <el-col :span="6">
          <div class="statistic-card border-success">
            <div class="card-header">
              <div class="card-title">收款总额</div>
              <div class="statistic-tabs">
                <el-radio-group v-model="item.paymentTimeRange" size="small">
                  <el-radio-button label="today">今日</el-radio-button>
                  <el-radio-button label="yesterday">昨日</el-radio-button>
                  <el-radio-button label="total">总计</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="card-content">
              <div class="statistic-value">¥{{ formatAmount(item.paymentData[item.paymentTimeRange].amount) }}</div>
              <div class="card-info">成功率：<span class="text-success">{{ formatSuccessRate(item.paymentData[item.paymentTimeRange].successCount, item.paymentData[item.paymentTimeRange].totalCount) }}</span></div>
            </div>
          </div>
        </el-col>
        
        <!-- 入账金额 -->
        <el-col :span="6">
          <div class="statistic-card border-warning">
            <div class="card-header">
              <div class="card-title">入账金额</div>
              <div class="statistic-tabs">
                <el-radio-group v-model="item.incomeTimeRange" size="small">
                  <el-radio-button label="today">今日</el-radio-button>
                  <el-radio-button label="yesterday">昨日</el-radio-button>
                  <el-radio-button label="total">总计</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="card-content">
              <div class="statistic-value">¥{{ formatAmount(item.incomeData[item.incomeTimeRange].amount) }}</div>
              <div class="card-info">
                较{{ item.incomeTimeRange === 'today' ? '昨日' : item.incomeTimeRange === 'yesterday' ? '前日' : '上月' }}: 
                <span :class="item.incomeData[item.incomeTimeRange].change >= 0 ? 'text-increase' : 'text-decrease'">
                  {{ item.incomeData[item.incomeTimeRange].change >= 0 ? '+' : '' }}{{ item.incomeData[item.incomeTimeRange].change }}%
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
                <el-radio-group v-model="item.feeTimeRange" size="small">
                  <el-radio-button label="today">今日</el-radio-button>
                  <el-radio-button label="yesterday">昨日</el-radio-button>
                  <el-radio-button label="total">总计</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="card-content">
              <div class="statistic-value">¥{{ formatAmount(item.feeData[item.feeTimeRange].amount) }}</div>
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
                <div class="info-value">{{ item.name }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">商户ID:</div>
                <div class="info-value">
                  {{ item.id }}
                  <el-tooltip content="复制ID" placement="top">
                    <el-icon class="copy-icon" @click="copyMerchantId(item.id)"><CopyDocument /></el-icon>
                  </el-tooltip>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">注册时间:</div>
                <div class="info-value">{{ item.registerTime }}</div>
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
                <div class="info-value">{{ item.loginInfo.username }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">登录时间:</div>
                <div class="info-value">{{ item.loginInfo.time }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">登录地址:</div>
                <div class="info-value">{{ item.loginInfo.ip }} {{ item.loginInfo.location ? `(${item.loginInfo.location})` : '' }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { productList } from '@/data/productData'

const route = useRoute()

// 商户筛选
const selectedMerchantFilter = ref('')
const subAccounts = ref([])
const currentLoginMerchantId = ref('')
const currentMerchantInfo = ref(null) // Base info for current logged in merchant

// Dashboard display data (Array of merchant data objects)
const dashboardData = ref([])

// 获取当前登录商户的子账户
const fetchSubAccounts = () => {
  // Default to ID 2 (Merchant B with sub-accounts) if no query param
  const merchantId = route.query.merchant || '2'
  if (!merchantId) return

  currentLoginMerchantId.value = merchantId
  
  // 查找当前商户
  const currentMerchant = productList.find(p => String(p.id) === String(merchantId))
  currentMerchantInfo.value = currentMerchant
  
  if (currentMerchant && currentMerchant.subAccounts && currentMerchant.subAccounts.length > 0) {
    // 获取子账户详情
    const accounts = []
    currentMerchant.subAccounts.forEach(subId => {
      const sub = productList.find(p => p.id === subId)
      if (sub) {
        accounts.push(sub)
      }
    })
    subAccounts.value = accounts
  } else {
    subAccounts.value = []
  }
  
  // Initialize dashboard
  refreshDashboard()
}

// 处理筛选变化
const handleMerchantFilterChange = (val) => {
  refreshDashboard()
}

// Generate mock data for a specific merchant ID
const generateMerchantData = (merchantId, merchantName) => {
  const idNum = parseInt(merchantId) || 1001
  const multiplier = (idNum % 10) / 10 + 0.5 // 0.5 ~ 1.4

  const paymentData = {
    today: { amount: 5689.50 * multiplier, successCount: Math.floor(58 * multiplier), totalCount: Math.floor(72 * multiplier) },
    yesterday: { amount: 4892.30 * multiplier, successCount: Math.floor(47 * multiplier), totalCount: Math.floor(65 * multiplier) },
    total: { amount: 235689.75 * multiplier, successCount: Math.floor(2356 * multiplier), totalCount: Math.floor(2850 * multiplier) }
  }

  const incomeData = {
    today: { amount: 5420.75 * multiplier, change: 5.2 },
    yesterday: { amount: 5152.80 * multiplier, change: -3.1 },
    total: { amount: 225140.25 * multiplier, change: 12.5 }
  }

  const feeData = {
    today: { amount: 268.75 * multiplier, rate: 4.96 },
    yesterday: { amount: 239.50 * multiplier, rate: 4.65 },
    total: { amount: 10549.50 * multiplier, rate: 4.86 }
  }

  return {
    id: merchantId,
    name: merchantName || `商户${merchantId}`,
    registerTime: '2024/04/15 10:30:45',
    balance: 10526.89 * multiplier,
    paymentTimeRange: 'today',
    incomeTimeRange: 'today',
    feeTimeRange: 'today',
    paymentData,
    incomeData,
    feeData,
    loginInfo: {
      username: `admin_${merchantId}`,
      time: '2024/05/21 08:45:12',
      ip: '192.168.1.120',
      location: '中国上海电信'
    }
  }
}

// Refresh dashboard data based on filter
const refreshDashboard = () => {
  const filterId = selectedMerchantFilter.value
  const newData = []

  if (filterId) {
    // Show specific sub-account
    const target = subAccounts.value.find(a => a.id == filterId)
    // If not found in sub (unlikely), check if it's self (also unlikely given logic, but safe fallback)
    const name = target ? target.productName : (filterId == currentLoginMerchantId.value ? currentMerchantInfo.value?.productName : '')
    newData.push(generateMerchantData(filterId, name))
  } else {
    // Show All: Main Account + Sub Accounts
    // 1. Add Main Account
    if (currentMerchantInfo.value) {
      newData.push(generateMerchantData(currentMerchantInfo.value.id, currentMerchantInfo.value.productName))
    }
    // 2. Add Sub Accounts
    subAccounts.value.forEach(account => {
      newData.push(generateMerchantData(account.id, account.productName))
    })
  }
  
  dashboardData.value = newData
}

// 格式化金额
const formatAmount = (amount) => {
  return amount?.toFixed(2) || '0.00'
}

// 格式化成功率
const formatSuccessRate = (successCount, totalCount) => {
  if (!totalCount || totalCount === 0) return '0%（0/0）'
  const rate = Math.round((successCount / totalCount) * 100)
  return `${rate}%（${successCount}/${totalCount}）`
}

// 复制ID
const copyMerchantId = (id) => {
  navigator.clipboard.writeText(id).then(() => {
    ElMessage.success('商户ID已复制')
  })
}

// 监听商户ID变化
watch(() => route.query.merchant, (newId) => {
  if (newId) {
    // Reset filter when global context changes
    selectedMerchantFilter.value = ''
    fetchSubAccounts()
  }
})

onMounted(() => {
  fetchSubAccounts()
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

.filter-card {
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  margin-right: 12px;
}

.statistics-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
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

.merchant-block {
  margin-bottom: 40px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 20px;
}

.merchant-block:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.block-header {
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.block-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
</style> 