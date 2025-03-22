<!-- 数据统计/商户收款统计 - 统计商户收入数据 -->
<template>
  <div class="statistics-merchant-income">
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
      <el-form-item label="订单状态">
        <el-select v-model="searchForm.orderStatus" placeholder="请选择订单状态" clearable style="width: 168px">
          <el-option label="支付成功" value="success" />
          <el-option label="支付失败" value="failed" />
          <el-option label="待支付" value="pending" />
          <el-option label="已退款" value="refunded" />
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
              <span>总收款金额</span>
              <el-tag size="small" type="info">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ totalIncome.toFixed(2) }}</span>
            <div class="trend">
              <span :class="{ 'up': incomeTrend > 0, 'down': incomeTrend < 0 }">
                {{ Math.abs(incomeTrend) }}%
              </span>
              <el-icon v-if="incomeTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总订单笔数</span>
              <el-tag size="small" type="info">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ totalOrders }}笔</span>
            <div class="trend">
              <span :class="{ 'up': ordersTrend > 0, 'down': ordersTrend < 0 }">
                {{ Math.abs(ordersTrend) }}%
              </span>
              <el-icon v-if="ordersTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>成功订单数</span>
              <el-tag size="small" type="success">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ successOrders }}笔</span>
            <span class="rate">成功率 {{ (successRate * 100).toFixed(2) }}%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>退款金额</span>
              <el-tag size="small" type="danger">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ refundAmount.toFixed(2) }}</span>
            <span class="rate">退款率 {{ (refundRate * 100).toFixed(2) }}%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="merchantName" label="商户名称" width="150" />
      <el-table-column prop="payType" label="支付类型" width="120" />
      <el-table-column prop="orderCount" label="订单笔数" width="120">
        <template #default="{ row }">
          <span>{{ row.orderCount }}笔</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderAmount" label="订单金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.orderAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="successCount" label="成功笔数" width="120">
        <template #default="{ row }">
          <span>{{ row.successCount }}笔</span>
        </template>
      </el-table-column>
      <el-table-column prop="successAmount" label="成功金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.successAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="successRate" label="成功率" width="120">
        <template #default="{ row }">
          <span>{{ (row.successRate * 100).toFixed(2) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundAmount" label="退款金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.refundAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
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
  orderStatus: '',
  dateRange: []
})

// 统计数据
const totalIncome = ref(1000000.00)
const totalOrders = ref(5000)
const successOrders = ref(4800)
const refundAmount = ref(10000.00)
const incomeTrend = ref(15.8)
const ordersTrend = ref(-3.2)
const successRate = ref(0.96)
const refundRate = ref(0.02)

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    merchantName: '示例商户',
    payType: '支付宝',
    orderCount: 1000,
    orderAmount: 50000.00,
    successCount: 980,
    successAmount: 49000.00,
    successRate: 0.98,
    refundAmount: 1000.00
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

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
  searchForm.orderStatus = ''
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
.statistics-merchant-income {
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

        .rate {
          font-size: 14px;
          color: #909399;
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