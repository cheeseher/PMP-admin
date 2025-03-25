<!-- 数据统计/支付通道统计 - 统计分析支付通道数据 -->
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-card class="filter-container" shadow="never">
      <el-form :model="searchForm" inline label-width="80px" label-position="left" class="search-form">
        <el-form-item label="供应商通道ID">
          <el-input v-model="searchForm.channelId" placeholder="请输入供应商通道ID" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="通道名称">
          <el-input v-model="searchForm.channelName" placeholder="请输入通道名称" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="通道编码">
          <el-select v-model="searchForm.payType" placeholder="请选择通道编码" style="width: 168px" clearable>
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="银联" value="unionpay" />
            <el-option label="快捷支付" value="quick" />
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
        <el-table-column prop="channelId" label="供应商通道ID" width="120" align="center" />
        <el-table-column prop="channelName" label="通道名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="payType" label="通道编码" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="getPayTypeType(row.payType)">{{ row.payType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="successAmount" label="成功金额" width="150" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.successAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="总金额" width="150" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.orderAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="通道成本" width="150" align="right">
          <template #default="{ row }">
            {{ formatAmount(row.fee) }}
          </template>
        </el-table-column>
        <el-table-column prop="successCount" label="成功单数" width="100" align="center">
          <template #default="{ row }">
            <span>{{ formatNumber(row.successCount) }}笔</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="总笔数" width="100" align="center">
          <template #default="{ row }">
            <span>{{ formatNumber(row.orderCount) }}笔</span>
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
import { useCleanup } from '@/composables/useCleanup'

// 获取清理工具
const { safeTimeout } = useCleanup()

// 搜索表单数据
const searchForm = reactive({
  channelId: '',
  channelName: '',
  payType: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    channelId: '1001',
    channelName: '微信支付直连',
    payType: 'wechat',
    orderCount: 1000,
    orderAmount: 50000.00,
    successCount: 980,
    successAmount: 49000.00,
    successRate: 0.98,
    fee: 490.00
  },
  {
    date: '2024-03-14',
    channelId: '1002',
    channelName: '支付宝直连',
    payType: 'alipay',
    orderCount: 850,
    orderAmount: 42500.00,
    successCount: 825,
    successAmount: 41250.00,
    successRate: 0.97,
    fee: 412.50
  },
  {
    date: '2024-03-14',
    channelId: '1003',
    channelName: '银联直连',
    payType: 'unionpay',
    orderCount: 500,
    orderAmount: 75000.00,
    successCount: 485,
    successAmount: 72750.00,
    successRate: 0.97,
    fee: 727.50
  },
  {
    date: '2024-03-14',
    channelId: '1004',
    channelName: '快捷支付',
    payType: 'quick',
    orderCount: 200,
    orderAmount: 30000.00,
    successCount: 180,
    successAmount: 27000.00,
    successRate: 0.90,
    fee: 270.00
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 状态映射
const getStatusType = (status) => {
  const map = {
    normal: 'success',
    maintenance: 'warning',
    closed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    normal: '正常',
    maintenance: '维护中',
    closed: '已关闭'
  }
  return map[status] || '未知'
}

// 支付类型标签类型
const getPayTypeType = (type) => {
  const map = {
    alipay: 'primary',
    wechat: 'success',
    unionpay: 'warning',
    quick: 'info'
  }
  return map[type] || 'info'
}

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  loading.value = true
  // 使用安全的timeout，会自动清理
  safeTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 1000)
}

// 组件挂载时加载数据
onMounted(() => {
  handleSearch()
})

// 重置方法
const handleReset = () => {
  searchForm.channelId = ''
  searchForm.channelName = ''
  searchForm.payType = ''
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
  safeTimeout(() => {
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