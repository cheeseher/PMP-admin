<!-- 商户后台/主页 - 商户数据概览 -->
<template>
  <div class="dashboard-container">
    <!-- 资金情况卡片 -->
    <el-row :gutter="16">
      <el-col :span="16">
        <el-card shadow="never" class="dashboard-card">
          <div class="card-header">
            <span class="card-title">资金情况</span>
          </div>
          
          <!-- 资金数据展示 -->
          <el-row :gutter="20" class="fund-row">
            <el-col :span="8">
              <div class="fund-item">
                <div class="fund-label">人民币账户余额</div>
                <div class="fund-amount positive">¥{{ accountData.balance.toFixed(2) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="fund-item">
                <div class="fund-label">人民币预付</div>
                <div class="fund-amount negative">¥{{ accountData.prepaid.toFixed(2) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="fund-item">
                <div class="fund-label">人民币净付</div>
                <div class="fund-amount negative">¥{{ accountData.netPaid.toFixed(2) }}</div>
              </div>
            </el-col>
          </el-row>
          
          <!-- 饼图展示 -->
          <el-row>
            <el-col :span="12">
              <div ref="chartRef" class="chart-container"></div>
            </el-col>
            <el-col :span="12">
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-dot account-balance"></span>
                  <span class="legend-label">账户余额: ¥{{ accountData.balance.toFixed(2) }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot prepaid"></span>
                  <span class="legend-label">预付: ¥{{ accountData.prepaid.toFixed(2) }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot activity-balance"></span>
                  <span class="legend-label">活动余额: ¥{{ accountData.activityBalance.toFixed(2) }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      
      <!-- 账户信息卡片 -->
      <el-col :span="8">
        <el-card shadow="never" class="dashboard-card">
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
          
          <!-- 最近登录信息 -->
          <div class="login-info-section">
            <div class="section-title">最近登录</div>
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
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 数据
const accountData = ref({
  balance: 5280.50,
  prepaid: -1420.75,
  netPaid: -3860.25,
  activityBalance: 0.00
})

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

// 图表引用
const chartRef = ref(null)
let chart = null

// 复制ID
const copyMerchantId = () => {
  navigator.clipboard.writeText(merchantInfo.value.id).then(() => {
    ElMessage.success('商户ID已复制')
  })
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  // 数据准备
  const data = [
    { name: '账户余额', value: Math.abs(accountData.value.balance), itemStyle: { color: '#4B9DFF' } },
    { name: '预付', value: Math.abs(accountData.value.prepaid), itemStyle: { color: '#36D1BC' } },
    { name: '活动余额', value: Math.abs(accountData.value.activityBalance), itemStyle: { color: '#36D1BC' } }
  ]
  
  // 图表配置项
  const option = {
    series: [
      {
        type: 'pie',
        radius: ['60%', '80%'],
        avoidLabelOverlap: false,
        silent: true,
        label: {
          show: false
        },
        emphasis: {
          scale: false
        },
        data: data
      }
    ]
  }
  
  chart.setOption(option)
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  if (chart) {
    chart.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时取消事件监听
const onBeforeUnmount = () => {
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-card {
  margin-bottom: 16px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.fund-row {
  margin-bottom: 20px;
}

.fund-item {
  display: flex;
  flex-direction: column;
  padding: 0 8px;
}

.fund-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.fund-amount {
  font-size: 24px;
  font-weight: 600;
}

.positive {
  color: #FF9900;
}

.negative {
  color: #F56C6C;
}

.chart-container {
  height: 200px;
  width: 100%;
}

.chart-legend {
  height: 200px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.account-balance {
  background-color: #4B9DFF;
}

.prepaid {
  background-color: #36D1BC;
}

.activity-balance {
  background-color: #36D1BC;
}

.legend-label {
  font-size: 14px;
  color: #606266;
}

.account-info {
  margin-bottom: 24px;
}

.login-info-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
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