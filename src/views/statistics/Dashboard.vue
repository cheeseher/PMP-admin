<!-- 数据统计/仪表板 - 显示关键业务指标仪表板 -->
<template>
  <div class="dashboard-container">
    <!-- 关键指标卡片 -->
    <div class="stat-cards">
      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span class="title">收款总额</span>
            <el-radio-group v-model="incomeTimeRange" size="small" @change="handleIncomeTimeRangeChange">
              <el-radio-button label="total">总计</el-radio-button>
              <el-radio-button label="today">今日</el-radio-button>
              <el-radio-button label="yesterday">昨日</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="value-container">
          <div class="stat-icon">
            <el-icon :size="28" color="#409EFF"><Money /></el-icon>
          </div>
          <div class="stat-value">¥{{ formatSimpleCurrency(totalIncome) }}</div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span class="title">平台利润</span>
            <el-radio-group v-model="profitTimeRange" size="small" @change="handleProfitTimeRangeChange">
              <el-radio-button label="total">总计</el-radio-button>
              <el-radio-button label="today">今日</el-radio-button>
              <el-radio-button label="yesterday">昨日</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="value-container">
          <div class="stat-icon">
            <el-icon :size="28" color="#409EFF"><Coin /></el-icon>
          </div>
          <div class="stat-value">¥{{ formatSimpleCurrency(totalProfit) }}</div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span class="title">商户数量</span>
          </div>
        </template>
        <div class="value-container">
          <div class="stat-icon">
            <el-icon :size="28" color="#409EFF"><User /></el-icon>
          </div>
          <div class="stat-value">{{ totalMerchants }}</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Money, Coin, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 路由
const router = useRouter()

// 时间范围选择 - 每个卡片独立的时间范围状态
const incomeTimeRange = ref('total')
const profitTimeRange = ref('total')

// 模拟数据
const totalIncome = ref(126560)
const totalProfit = ref(42876)
const totalMerchants = ref(364)

// 格式化货币 (完整格式)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(amount)
}

// 格式化货币 (简化格式，不带货币符号和小数点)
const formatSimpleCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// 收入时间范围变化
const handleIncomeTimeRangeChange = (val) => {
  if (val === 'total') {
    totalIncome.value = 126560
  } else if (val === 'today') {
    totalIncome.value = 25890
  } else if (val === 'yesterday') {
    totalIncome.value = 23450
  }
}

// 利润时间范围变化
const handleProfitTimeRangeChange = (val) => {
  if (val === 'total') {
    totalProfit.value = 42876
  } else if (val === 'today') {
    totalProfit.value = 8764
  } else if (val === 'yesterday') {
    totalProfit.value = 7650
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
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
}

.value-container {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

/* 媒体查询，适配小屏幕 */
@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }
}
</style>
