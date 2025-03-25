<!-- 数据统计/产品跑量统计 - 统计分析产品交易数据 -->
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-card class="filter-container" shadow="never">
      <el-form :model="searchForm" inline label-width="80px" label-position="left" class="search-form">
        <el-form-item label="产品ID">
          <el-input v-model="searchForm.productId" placeholder="请输入产品ID" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入产品名称" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="商户">
          <el-select v-model="searchForm.merchant" placeholder="请选择商户" style="width: 168px" clearable>
            <el-option v-for="item in merchantOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="productId" label="产品ID" width="90" align="center" />
        <el-table-column prop="productName" label="产品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="successAmount" label="收款金额" width="150" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.successAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="feeAmount" label="手续费" width="150" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.feeAmount) }}
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

// 商户选项
const merchantOptions = [
  { label: '测试商户', value: '1' },
  { label: '示例商户', value: '2' },
  { label: '新商户', value: '3' }
]

// 搜索表单数据
const searchForm = reactive({
  productId: '',
  productName: '',
  merchant: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    productId: '001',
    productName: '微信支付',
    merchantName: '测试商户',
    orderCount: 1000,
    orderAmount: 50000.00,
    successCount: 980,
    successAmount: 49000.00,
    successRate: 0.98,
    feeAmount: 490.00,
    netAmount: 48510.00,
    remark: ''
  },
  {
    date: '2024-03-14',
    productId: '002',
    productName: '支付宝',
    merchantName: '测试商户',
    orderCount: 850,
    orderAmount: 42500.00,
    successCount: 825,
    successAmount: 41250.00,
    successRate: 0.97,
    feeAmount: 412.50,
    netAmount: 40837.50,
    remark: ''
  },
  {
    date: '2024-03-14',
    productId: '003',
    productName: '银联支付',
    merchantName: '示例商户',
    orderCount: 500,
    orderAmount: 75000.00,
    successCount: 485,
    successAmount: 72750.00,
    successRate: 0.97,
    feeAmount: 727.50,
    netAmount: 72022.50,
    remark: ''
  },
  {
    date: '2024-03-14',
    productId: '004',
    productName: '快捷支付',
    merchantName: '新商户',
    orderCount: 200,
    orderAmount: 30000.00,
    successCount: 180,
    successAmount: 27000.00,
    successRate: 0.90,
    feeAmount: 270.00,
    netAmount: 26730.00,
    remark: ''
  },
  {
    date: '2024-03-13',
    productId: '001',
    productName: '微信支付',
    merchantName: '测试商户',
    orderCount: 950,
    orderAmount: 47500.00,
    successCount: 920,
    successAmount: 46000.00,
    successRate: 0.97,
    feeAmount: 460.00,
    netAmount: 45540.00,
    remark: ''
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
  // TODO: 调用接口获取数据
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置方法
const handleReset = () => {
  searchForm.productId = ''
  searchForm.productName = ''
  searchForm.merchant = ''
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