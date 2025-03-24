<!-- 数据统计/商户余额快照 - 展示商户余额实时数据 -->
<template>
  <div class="statistics-merchant-balance">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline class="search-form">
      <el-form-item label="商户名称">
        <el-input 
          v-model="searchForm.merchantName" 
          placeholder="请输入商户名称" 
          clearable 
          style="width: 168px" 
        />
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
            <span class="amount">{{ formatAmount(totalBalance) }}</span>
            <div class="trend">
              <span :class="{ 'up': balanceTrend > 0, 'down': balanceTrend < 0 }">
                {{ Math.abs(balanceTrend) }}%
              </span>
              <el-icon v-if="balanceTrend > 0"><ArrowUp /></el-icon>
              <el-icon v-else-if="balanceTrend < 0"><ArrowDown /></el-icon>
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
            <span class="amount">{{ formatAmount(averageBalance) }}</span>
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
            <span class="amount">{{ formatAmount(frozenAmount) }}</span>
            <span class="rate">总计</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作栏 -->
    <div class="table-operations">
      <el-button type="primary" :icon="Download" @click="handleExport">导出数据</el-button>
      <el-button :icon="Refresh" @click="refreshData">刷新</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table 
      :data="tableData" 
      border 
      style="width: 100%" 
      v-loading="loading"
      highlight-current-row
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="merchantName" label="商户名称" min-width="150" />
      <el-table-column prop="merchantId" label="商户ID" width="120" />
      <el-table-column prop="balance" label="账户余额" width="150">
        <template #default="{ row }">
          <span class="amount-cell">{{ formatAmount(row.balance) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="frozenAmount" label="冻结金额" width="150">
        <template #default="{ row }">
          <span class="amount-cell">{{ formatAmount(row.frozenAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="availableAmount" label="可用金额" width="150">
        <template #default="{ row }">
          <span class="amount-cell">{{ formatAmount(row.availableAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="todayIncome" label="今日收入" width="150">
        <template #default="{ row }">
          <span class="amount-cell income">{{ formatAmount(row.todayIncome) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="todayOutcome" label="今日支出" width="150">
        <template #default="{ row }">
          <span class="amount-cell outcome">{{ formatAmount(row.todayOutcome) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="snapshotTime" label="快照时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row)">查看明细</el-button>
          <el-button type="success" link @click="viewHistory(row)">历史记录</el-button>
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

    <!-- 明细查看对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="商户余额明细"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商户名称" :span="2">{{ currentMerchant.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="商户ID">{{ currentMerchant.merchantId }}</el-descriptions-item>
        <el-descriptions-item label="快照时间">{{ currentMerchant.snapshotTime }}</el-descriptions-item>
        <el-descriptions-item label="账户余额">{{ formatAmount(currentMerchant.balance) }}</el-descriptions-item>
        <el-descriptions-item label="可用金额">{{ formatAmount(currentMerchant.availableAmount) }}</el-descriptions-item>
        <el-descriptions-item label="冻结金额">{{ formatAmount(currentMerchant.frozenAmount) }}</el-descriptions-item>
        <el-descriptions-item label="今日流水">
          <el-tag type="success">收入: {{ formatAmount(currentMerchant.todayIncome) }}</el-tag>
          <el-tag type="danger" style="margin-left: 10px;">支出: {{ formatAmount(currentMerchant.todayOutcome) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="printDetail">打印明细</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowUp, ArrowDown, Download, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatAmount } from '@/utils/formatUtils'
import { merchantBalanceData } from '@/data/statisticsData'

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
const tableData = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 详情对话框相关
const detailDialogVisible = ref(false)
const currentMerchant = ref({})

// 初始化表格数据
const initTableData = () => {
  tableData.value = merchantBalanceData
  // 更新总数据量
  total.value = merchantBalanceData.length
  
  // 计算总余额和冻结金额
  const totalBalanceSum = merchantBalanceData.reduce((sum, item) => sum + item.balance, 0)
  const totalFrozenSum = merchantBalanceData.reduce((sum, item) => sum + item.frozenAmount, 0)
  
  totalBalance.value = totalBalanceSum
  frozenAmount.value = totalFrozenSum
  merchantCount.value = merchantBalanceData.length
}

// 搜索方法
const handleSearch = () => {
  loading.value = true
  
  // 模拟筛选数据
  setTimeout(() => {
    // 根据搜索条件过滤数据
    let filteredData = [...merchantBalanceData]
    
    if (searchForm.merchantName) {
      filteredData = filteredData.filter(item => 
        item.merchantName.includes(searchForm.merchantName)
      )
    }
    
    if (searchForm.minBalance !== null) {
      filteredData = filteredData.filter(item => 
        item.balance >= searchForm.minBalance
      )
    }
    
    if (searchForm.maxBalance !== null) {
      filteredData = filteredData.filter(item => 
        item.balance <= searchForm.maxBalance
      )
    }
    
    if (searchForm.snapshotTime) {
      filteredData = filteredData.filter(item => 
        item.snapshotTime === searchForm.snapshotTime
      )
    }
    
    tableData.value = filteredData
    total.value = filteredData.length
    
    loading.value = false
    ElMessage.success('查询成功')
  }, 800)
}

// 重置方法
const handleReset = () => {
  searchForm.merchantName = ''
  searchForm.minBalance = null
  searchForm.maxBalance = null
  searchForm.snapshotTime = ''
  initTableData()
  ElMessage.info('已重置搜索条件')
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

// 导出数据
const handleExport = () => {
  ElMessageBox.confirm(
    '确认导出当前筛选条件下的商户余额数据?',
    '导出确认',
    {
      confirmButtonText: '确认导出',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: '数据导出成功，请在下载中心查看'
      })
    })
    .catch(() => {})
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    initTableData()
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 600)
}

// 查看明细
const viewDetail = (row) => {
  currentMerchant.value = row
  detailDialogVisible.value = true
}

// 查看历史记录
const viewHistory = (row) => {
  ElMessage.info(`查看商户 ${row.merchantName} 的历史余额记录`)
}

// 打印明细
const printDetail = () => {
  ElMessage.success('明细打印指令已发送')
  detailDialogVisible.value = false
}

// 页面加载时获取数据
onMounted(() => {
  initTableData()
})
</script>

<style scoped lang="scss">
.statistics-merchant-balance {
  .search-form {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

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
        padding: 10px 0;

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

  .table-operations {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-end;
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
    text-align: right;
    margin-top: 20px;
    padding: 16px 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
}
</style> 