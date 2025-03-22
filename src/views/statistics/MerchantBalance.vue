<!-- 数据统计/商户余额快照 - 展示商户余额实时数据 -->
<template>
  <div class="statistics-merchant-balance">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline class="search-form">
      <el-form-item label="商户名称">
        <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" clearable style="width: 168px" />
      </el-form-item>
      <el-form-item label="余额范围">
        <el-input-number
          v-model="searchForm.minBalance"
          :precision="2"
          :step="1000"
          :min="0"
          placeholder="最小金额"
          style="width: 120px"
        />
        <span class="separator">-</span>
        <el-input-number
          v-model="searchForm.maxBalance"
          :precision="2"
          :step="1000"
          :min="0"
          placeholder="最大金额"
          style="width: 120px"
        />
      </el-form-item>
      <el-form-item label="快照时间">
        <el-date-picker
          v-model="searchForm.snapshotTime"
          type="datetime"
          placeholder="请选择快照时间"
          value-format="YYYY-MM-DD HH:mm:ss"
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
              <span>总余额</span>
              <el-tag size="small" type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ totalBalance.toFixed(2) }}</span>
            <div class="trend">
              <span :class="{ 'up': balanceTrend > 0, 'down': balanceTrend < 0 }">
                {{ Math.abs(balanceTrend) }}%
              </span>
              <el-icon v-if="balanceTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>商户数量</span>
              <el-tag size="small" type="info">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">{{ merchantCount }}家</span>
            <span class="rate">有余额商户</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>平均余额</span>
              <el-tag size="small" type="warning">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ averageBalance.toFixed(2) }}</span>
            <span class="rate">每商户</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>冻结金额</span>
              <el-tag size="small" type="danger">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥{{ frozenAmount.toFixed(2) }}</span>
            <span class="rate">总计</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="merchantName" label="商户名称" width="150" />
      <el-table-column prop="merchantId" label="商户ID" width="120" />
      <el-table-column prop="balance" label="账户余额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.balance.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="frozenAmount" label="冻结金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.frozenAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="availableAmount" label="可用金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.availableAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="todayIncome" label="今日收入" width="150">
        <template #default="{ row }">
          <span>¥{{ row.todayIncome.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="todayOutcome" label="今日支出" width="150">
        <template #default="{ row }">
          <span>¥{{ row.todayOutcome.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="snapshotTime" label="快照时间" width="180" />
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
import { ref, reactive, computed } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

// 搜索表单数据
const searchForm = reactive({
  merchantName: '',
  minBalance: null,
  maxBalance: null,
  snapshotTime: ''
})

// 统计数据
const totalBalance = ref(10000000.00)
const merchantCount = ref(500)
const frozenAmount = ref(200000.00)
const balanceTrend = ref(5.8)

// 计算平均余额
const averageBalance = computed(() => {
  return merchantCount.value ? totalBalance.value / merchantCount.value : 0
})

// 表格数据
const tableData = ref([
  {
    merchantName: '示例商户',
    merchantId: 'M2024031401',
    balance: 100000.00,
    frozenAmount: 20000.00,
    availableAmount: 80000.00,
    todayIncome: 50000.00,
    todayOutcome: 30000.00,
    snapshotTime: '2024-03-14 15:30:00'
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
  searchForm.minBalance = null
  searchForm.maxBalance = null
  searchForm.snapshotTime = ''
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
.statistics-merchant-balance {
  .search-form {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;

    .separator {
      margin: 0 8px;
      color: #909399;
    }
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