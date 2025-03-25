<!-- 数据统计/平台分润统计 - 统计平台收益数据 -->
<template>
  <div class="statistics-platform-profit">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-card">
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 360px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-header">
        <div class="table-title">
          <span>平台分润列表</span>
          <el-tag type="info" size="small" effect="plain">{{ total }}条记录</el-tag>
        </div>
        <div class="table-operations">
          <el-button :icon="Printer" plain>打印</el-button>
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-button :icon="Refresh" @click="refreshData" :loading="loading">刷新</el-button>
        </div>
      </div>
      
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        stripe
        highlight-current-row
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column prop="successAmount" label="成功收款金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell income">{{ formatAmount(row.successAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="channelCost" label="通道成本" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell outcome">{{ formatAmount(row.channelCost) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profitAfterChannel" label="除通道成本后利润" width="180" align="right">
          <template #default="{ row }">
            <span class="amount-cell income">{{ formatAmount(row.profitAfterChannel) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell income">{{ formatAmount(row.fee) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="成功单数/总笔数" min-width="160" align="center">
          <template #default="{ row }">
            <span>{{ formatNumber(row.successCount) }}/{{ formatNumber(row.orderCount) }}笔</span>
          </template>
        </el-table-column>
        <el-table-column prop="successRate" label="成功率" width="100" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="getSuccessRateType(row.successRate)"
              size="small"
            >
              {{ (row.successRate * 100).toFixed(2) }}%
            </el-tag>
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
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, Download, Printer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    successAmount: 50000.00,
    channelCost: 250.00,
    profitAfterChannel: 49750.00,
    fee: 250.00,
    orderCount: 1000,
    successCount: 980,
    successRate: 0.98
  },
  {
    date: '2024-03-13',
    successAmount: 48000.00,
    channelCost: 240.00,
    profitAfterChannel: 47760.00,
    fee: 240.00,
    orderCount: 960,
    successCount: 940,
    successRate: 0.98
  },
  {
    date: '2024-03-12',
    successAmount: 45000.00,
    channelCost: 225.00,
    profitAfterChannel: 44775.00,
    fee: 225.00,
    orderCount: 900,
    successCount: 880,
    successRate: 0.98
  },
  {
    date: '2024-03-11',
    successAmount: 42000.00,
    channelCost: 210.00,
    profitAfterChannel: 41790.00,
    fee: 210.00,
    orderCount: 840,
    successCount: 820,
    successRate: 0.98
  },
  {
    date: '2024-03-10',
    successAmount: 40000.00,
    channelCost: 200.00,
    profitAfterChannel: 39800.00,
    fee: 200.00,
    orderCount: 800,
    successCount: 780,
    successRate: 0.98
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 初始化页面
onMounted(() => {
  fetchData()
})

// 获取数据
const fetchData = () => {
  loading.value = true
  // 这里是模拟请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置方法
const handleReset = () => {
  searchForm.dateRange = []
  handleSearch()
}

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 导出数据
const handleExport = () => {
  ElMessageBox.confirm('确定要导出当前筛选条件下的数据吗?', '导出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('数据导出成功')
  }).catch(() => {})
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 500)
}

// 格式化金额
const formatAmount = (amount) => {
  return Number(amount).toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化数字
const formatNumber = (num) => {
  return num.toLocaleString('zh-CN')
}

// 获取成功率类型
const getSuccessRateType = (rate) => {
  if (rate >= 0.95) return 'success'
  if (rate >= 0.9) return 'warning'
  return 'danger'
}
</script>

<style scoped lang="scss">
.statistics-platform-profit {
  .search-card {
    margin-bottom: 16px;
  }

  .search-form {
    display: flex;
    flex-wrap: wrap;
  }

  .table-card {
    margin-bottom: 16px;
  }
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .table-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .table-operations {
    display: flex;
    gap: 10px;
  }

  .amount-cell {
    font-family: monospace;
    font-weight: 500;
    
    &.income {
      color: #67c23a;
    }
    
    &.outcome {
      color: #f56c6c;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

:deep(.el-form-item) {
  margin-bottom: 18px;
  margin-right: 18px;
}

:deep(.el-form-item:last-child) {
  margin-right: 0;
}

:deep(.el-date-editor.el-input__wrapper) {
  --el-date-editor-width: auto;
}

:deep(.el-card__header) {
  padding: 12px 20px;
}

:deep(.el-card__body) {
  padding: 16px;
}
</style> 