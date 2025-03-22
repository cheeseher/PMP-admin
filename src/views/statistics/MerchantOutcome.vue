<!-- 数据统计/商户出款统计 - 统计商户出款数据 -->
<template>
  <div class="statistics-merchant-outcome">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline class="search-form">
      <el-form-item label="商户名称">
        <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" clearable style="width: 168px" />
      </el-form-item>
      <el-form-item label="出款类型">
        <el-select v-model="searchForm.outcomeType" placeholder="请选择出款类型" clearable style="width: 168px">
          <el-option label="提现" value="withdraw" />
          <el-option label="退款" value="refund" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态">
        <el-select v-model="searchForm.auditStatus" placeholder="请选择审核状态" clearable style="width: 168px">
          <el-option label="待审核" value="pending" />
          <el-option label="审核通过" value="approved" />
          <el-option label="审核拒绝" value="rejected" />
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
              <span>总出款金额</span>
              <el-tag size="small" type="info">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ totalOutcome.toFixed(2) }}</span>
            <div class="trend">
              <span :class="{ 'up': outcomeTrend > 0, 'down': outcomeTrend < 0 }">
                {{ Math.abs(outcomeTrend) }}%
              </span>
              <el-icon v-if="outcomeTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总笔数</span>
              <el-tag size="small" type="info">昨日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ totalCount }}笔</span>
            <div class="trend">
              <span :class="{ 'up': countTrend > 0, 'down': countTrend < 0 }">
                {{ Math.abs(countTrend) }}%
              </span>
              <el-icon v-if="countTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待审核金额</span>
              <el-tag size="small" type="warning">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ pendingAmount.toFixed(2) }}</span>
            <span class="count">{{ pendingCount }}笔</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>已审核金额</span>
              <el-tag size="small" type="success">累计</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ approvedAmount.toFixed(2) }}</span>
            <span class="count">{{ approvedCount }}笔</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="merchantName" label="商户名称" width="150" />
      <el-table-column prop="outcomeType" label="出款类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getOutcomeTypeTag(row.outcomeType)">
            {{ getOutcomeTypeText(row.outcomeType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderCount" label="申请笔数" width="120">
        <template #default="{ row }">
          <span>{{ row.orderCount }}笔</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderAmount" label="申请金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.orderAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="approvedCount" label="通过笔数" width="120">
        <template #default="{ row }">
          <span>{{ row.approvedCount }}笔</span>
        </template>
      </el-table-column>
      <el-table-column prop="approvedAmount" label="通过金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.approvedAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="approvalRate" label="通过率" width="120">
        <template #default="{ row }">
          <span>{{ (row.approvalRate * 100).toFixed(2) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="fee" label="手续费" width="150">
        <template #default="{ row }">
          <span>¥{{ row.fee.toFixed(2) }}</span>
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
  outcomeType: '',
  auditStatus: '',
  dateRange: []
})

// 统计数据
const totalOutcome = ref(500000.00)
const totalCount = ref(2000)
const pendingAmount = ref(100000.00)
const pendingCount = ref(500)
const approvedAmount = ref(400000.00)
const approvedCount = ref(1500)
const outcomeTrend = ref(-8.5)
const countTrend = ref(12.3)

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    merchantName: '示例商户',
    outcomeType: 'withdraw',
    orderCount: 100,
    orderAmount: 50000.00,
    approvedCount: 95,
    approvedAmount: 47500.00,
    approvalRate: 0.95,
    fee: 237.50
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 出款类型映射
const getOutcomeTypeTag = (type) => {
  const map = {
    withdraw: 'primary',
    refund: 'warning',
    other: 'info'
  }
  return map[type] || 'info'
}

const getOutcomeTypeText = (type) => {
  const map = {
    withdraw: '提现',
    refund: '退款',
    other: '其他'
  }
  return map[type] || '未知'
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
  searchForm.outcomeType = ''
  searchForm.auditStatus = ''
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
.statistics-merchant-outcome {
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

        .count {
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