<!-- 数据统计/商户支付排行 - 统计商户支付数据排名 -->
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-card class="filter-container" shadow="never">
      <el-form :model="searchForm" inline label-width="80px" label-position="left" class="search-form">
        <el-form-item label="商户ID">
          <el-input v-model="searchForm.merchantId" placeholder="请输入商户ID" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="商户名称">
          <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="排序字段">
          <el-select v-model="searchForm.sortField" placeholder="请选择排序字段" style="width: 168px">
            <el-option label="收款金额" value="amount" />
            <el-option label="成功率" value="rate" />
            <el-option label="成功单数" value="count" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-container">
      <template #header>
        <div class="table-header">
          <div class="left">
            <el-button @click="refreshData" class="refresh-btn">
              <el-icon><Refresh /></el-icon>刷新数据
            </el-button>
          </div>
          <div class="right">
            <el-button icon="Printer" plain>打印</el-button>
            <el-button type="primary" @click="handleExport">
              <el-icon><Download /></el-icon>导出
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        stripe
        highlight-current-row
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column type="index" label="排名" width="80" align="center">
          <template #default="scope">
            <el-tag 
              :type="getRankType(scope.$index)" 
              size="small" 
              effect="dark"
              class="rank-tag"
            >{{ scope.$index + 1 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="merchantId" label="商户ID" width="80" align="center" />
        <el-table-column prop="merchantNo" label="商户号" width="120" align="center" />
        <el-table-column prop="merchantAccount" label="商户账号" width="120" align="center" />
        <el-table-column prop="merchantName" label="商户名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="successAmount" label="收款金额" width="150" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.successAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="150" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.fee) }}
          </template>
        </el-table-column>
        <el-table-column prop="netAmount" label="入账金额" width="150" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.netAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="成功单数/总笔数" width="150" align="center">
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
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Download, Printer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  merchantId: '',
  merchantName: '',
  sortField: 'amount',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    merchantId: '1001',
    merchantNo: 'MER20240301',
    merchantAccount: 'merchant1',
    merchantName: '顶级商户A',
    orderCount: 5000,
    successCount: 4850,
    successAmount: 2450000.00,
    successRate: 0.97,
    fee: 12250.00,
    netAmount: 2437750.00
  },
  {
    merchantId: '1002',
    merchantNo: 'MER20240302',
    merchantAccount: 'merchant2',
    merchantName: '优质商户B',
    orderCount: 4200,
    successCount: 4116,
    successAmount: 1850000.00,
    successRate: 0.98,
    fee: 9250.00,
    netAmount: 1840750.00
  },
  {
    merchantId: '1003',
    merchantNo: 'MER20240303',
    merchantAccount: 'merchant3',
    merchantName: '标准商户C',
    orderCount: 3600,
    successCount: 3492,
    successAmount: 1580000.00,
    successRate: 0.97,
    fee: 7900.00,
    netAmount: 1572100.00
  },
  {
    merchantId: '1004',
    merchantNo: 'MER20240304',
    merchantAccount: 'merchant4',
    merchantName: '普通商户D',
    orderCount: 2800,
    successCount: 2604,
    successAmount: 980000.00,
    successRate: 0.93,
    fee: 4900.00,
    netAmount: 975100.00
  },
  {
    merchantId: '1005',
    merchantNo: 'MER20240305',
    merchantAccount: 'merchant5',
    merchantName: '小型商户E',
    orderCount: 1200,
    successCount: 1128,
    successAmount: 560000.00,
    successRate: 0.94,
    fee: 2800.00,
    netAmount: 557200.00
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

// 排名样式
const getRankType = (index) => {
  if (index === 0) return 'danger'
  if (index === 1) return 'warning'
  if (index === 2) return 'success'
  return 'info'
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
  searchForm.merchantId = ''
  searchForm.merchantName = ''
  searchForm.sortField = 'amount'
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
.app-container {
  padding: 16px;
}

.filter-container {
  margin-bottom: 16px;
  
  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 0;
  }
}

.table-container {
  margin-bottom: 16px;
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .refresh-btn {
      margin-right: 10px;
    }
  }
  
  .rank-tag {
    font-weight: bold;
    width: 30px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-table) {
  border-radius: 4px;
  
  &::before {
    height: 0;
  }
}

:deep(.el-table .cell) {
  padding-left: 10px;
  padding-right: 10px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
}

:deep(.el-card__body) {
  padding: 16px;
}
</style> 