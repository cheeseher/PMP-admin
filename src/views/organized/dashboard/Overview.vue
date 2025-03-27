<!-- 商户后台/主页 - 商户数据概览 -->
<template>
  <div class="dashboard-container">
    <!-- 数据卡片 -->
    <div class="stat-cards">
      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span class="title">商户余额</span>
          </div>
        </template>
        <div class="value-container">
          <div class="stat-value">628660</div>
          <div class="stat-footer">
            <span>可用余额: 628660.00 冻结金额: 0.00</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span class="title">收款总额</span>
            <el-radio-group v-model="dateTypePayment" size="small">
              <el-radio-button label="today">今日</el-radio-button>
              <el-radio-button label="yesterday">昨日</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="value-container">
          <div class="stat-value">{{ dateTypePayment === 'today' ? '0' : '0' }}</div>
          <div class="stat-footer">
            <span>成功率: 0% (0/0)</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span class="title">入账金额</span>
            <el-radio-group v-model="dateTypeIncome" size="small">
              <el-radio-button label="today">今日</el-radio-button>
              <el-radio-button label="yesterday">昨日</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="value-container">
          <div class="stat-value">{{ dateTypeIncome === 'today' ? '0' : '0' }}</div>
          <div class="stat-footer">
            <span>手续费: 0</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 第二行数据卡片 -->
    <div class="stat-cards stat-cards-small">
      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span class="title">预付</span>
          </div>
        </template>
        <div class="value-container">
          <div class="stat-value">0</div>
          <div class="stat-footer">
            <span>剩余预付: 0</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span class="title">出款总额</span>
            <el-radio-group v-model="dateTypeWithdraw" size="small">
              <el-radio-button label="today">今日</el-radio-button>
              <el-radio-button label="yesterday">昨日</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="value-container">
          <div class="stat-value">{{ dateTypeWithdraw === 'today' ? '0' : '0' }}</div>
          <div class="stat-footer">
            <span>手续费: 0 成功率: 0% (0/0)</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

// 路由器
const router = useRouter()

// 为每个卡片创建独立的日期类型变量
const dateTypePayment = ref('today')
const dateTypeIncome = ref('today')
const dateTypeWithdraw = ref('today')

// 导航到指定页面
const navigateTo = (page) => {
  const pageUrls = {
    'assets': '/merchant/finance/assets',
    'createWithdrawOrder': '/merchant/finance/withdraw/create',
    'paymentOrders': '/merchant/trade/payment',
    'createPaymentOrder': '/merchant/trade/payment/create',
    'batchWithdraw': '/merchant/account/batch-withdraw',
    'apiConfig': '/merchant/account/api'
  }
  
  if (pageUrls[page]) {
    router.push(pageUrls[page])
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
}

/* 数据概览 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-cards-small {
  grid-template-columns: repeat(2, 1fr);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.value-container {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-footer {
  color: #909399;
  font-size: 14px;
}

.up {
  color: #67C23A;
}

.down {
  color: #F56C6C;
}

/* 媒体查询，适配小屏幕 */
@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-cards-small {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-cards, .stat-cards-small {
    grid-template-columns: 1fr;
  }
}
</style> 