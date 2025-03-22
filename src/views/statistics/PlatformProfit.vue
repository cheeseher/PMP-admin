<!-- 数据统计/平台分润统计 - 统计平台收益数据 -->
<template>
  <div class="statistics-platform-profit">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline class="search-form">
      <el-form-item label="商户名称">
        <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" clearable style="width: 168px" />
      </el-form-item>
      <el-form-item label="支付类型">
        <el-select v-model="searchForm.payType" placeholder="请选择支付类型" clearable style="width: 168px">
          <el-option label="支付宝" value="alipay" />
          <el-option label="微信支付" value="wechat" />
          <el-option label="银联" value="unionpay" />
        </el-select>
      </el-form-item>
      <el-form-item label="结算状态">
        <el-select v-model="searchForm.settleStatus" placeholder="请选择结算状态" clearable style="width: 168px">
          <el-option label="待结算" value="pending" />
          <el-option label="已结算" value="settled" />
          <el-option label="结算失败" value="failed" />
        </el-select>
      </el-form-item>
      <el-form-item label="统计时间">
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总交易金额</span>
              <el-tag size="small" type="info">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ totalAmount.toFixed(2) }}</span>
            <div class="trend">
              <span :class="{ 'up': amountTrend > 0, 'down': amountTrend < 0 }">
                {{ Math.abs(amountTrend) }}%
              </span>
              <el-icon v-if="amountTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总分润金额</span>
              <el-tag size="small" type="info">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ totalProfit.toFixed(2) }}</span>
            <div class="trend">
              <span :class="{ 'up': profitTrend > 0, 'down': profitTrend < 0 }">
                {{ Math.abs(profitTrend) }}%
              </span>
              <el-icon v-if="profitTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待结算金额</span>
              <el-tag size="small" type="warning">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ pendingAmount.toFixed(2) }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>已结算金额</span>
              <el-tag size="small" type="success">累计</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ settledAmount.toFixed(2) }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="merchantName" label="商户名称" width="150" />
      <el-table-column prop="payType" label="支付类型" width="120" />
      <el-table-column prop="orderAmount" label="交易金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.orderAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="profitAmount" label="分润金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.profitAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="profitRate" label="分润比例" width="120">
        <template #default="{ row }">
          <span>{{ (row.profitRate * 100).toFixed(2) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="settleStatus" label="结算状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getSettleStatusType(row.settleStatus)">
            {{ getSettleStatusText(row.settleStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="settleTime" label="结算时间" width="180" />
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

// 搜索表单数据
const searchForm = reactive({
  merchantName: '',
  payType: '',
  settleStatus: '',
  dateRange: []
})

// 统计数据
const totalAmount = ref(1000000.00)
const totalProfit = ref(50000.00)
const pendingAmount = ref(20000.00)
const settledAmount = ref(30000.00)
const amountTrend = ref(12.5)
const profitTrend = ref(-5.2)

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    merchantName: '示例商户',
    payType: '支付宝',
    orderAmount: 50000.00,
    profitAmount: 2500.00,
    profitRate: 0.05,
    settleStatus: 'settled',
    settleTime: '2024-03-14 15:30:00'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 结算状态映射
const getSettleStatusType = (status) => {
  const map = {
    pending: 'warning',
    settled: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getSettleStatusText = (status) => {
  const map = {
    pending: '待结算',
    settled: '已结算',
    failed: '结算失败'
  }
  return map[status] || '未知'
}

// 搜索方法
const handleSearch = () => {
  loading.value = true
  // TODO: 调用接口获取数据
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// 重置方法
const handleReset = () => {
  searchForm.merchantName = ''
  searchForm.payType = ''
  searchForm.settleStatus = ''
  searchForm.dateRange = []
  handleSearch()
}

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}
</script>

<style scoped lang="scss">
.statistics-platform-profit {
  .search-form {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .stat-cards {
    margin-bottom: 20px;

    .el-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .amount {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 4px;

          .up {
            color: #67c23a;
          }

          .down {
            color: #f56c6c;
          }

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }

  .pagination-container {
    text-align: right;
    margin-top: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
  }
}
</style> 