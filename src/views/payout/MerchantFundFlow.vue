<!-- 代付管理/商户代付资金流水 - 展示商户代付资金变动记录 -->
<template>
  <div class="merchant-fund-flow-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <el-form-item label="交易单号">
          <el-input
            v-model="searchForm.transactionNo"
            placeholder="请输入交易单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="交易类型">
          <el-select
            v-model="searchForm.transactionType"
            placeholder="请选择"
            clearable
            style="width: 168px"
          >
            <el-option
              v-for="item in transactionTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商户账号">
          <el-select
            v-model="searchForm.merchant"
            placeholder="请选择"
            clearable
            style="width: 168px"
          >
            <el-option
              v-for="item in merchantOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            style="width: 168px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期筛选">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button plain @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <div class="left">
          <span class="toolbar-title">资金流水记录</span>
        </div>
        <div class="right">
          <el-button @click="handleExport">导出</el-button>
        </div>
      </div>
      
      <el-table
         :data="tableData"
         v-loading="loading"
         border
         stripe
         style="width: 100%"
       >
         <el-table-column prop="merchant" label="商户名称" width="120" />
         <el-table-column prop="transactionNo" label="交易单号" width="180" />
         <el-table-column prop="beforeBalance" label="交易前金额" width="120" align="right">
           <template #default="{ row }">
             <span class="amount-text">{{ formatAmount(row.beforeBalance) }}</span>
           </template>
         </el-table-column>
         <el-table-column prop="transactionAmount" label="交易金额" width="120" align="right">
           <template #default="{ row }">
             <span :class="getAmountClass(row.transactionAmount)">
               {{ formatAmount(row.transactionAmount) }}
             </span>
           </template>
         </el-table-column>
         <el-table-column prop="transactionType" label="交易类型" width="100" />
         <el-table-column prop="fee" label="手续费" width="100" align="right">
           <template #default="{ row }">
             <span class="amount-text">{{ formatAmount(row.fee) }}</span>
           </template>
         </el-table-column>
         <el-table-column prop="commission" label="佣金" width="100" align="right">
           <template #default="{ row }">
             <span class="amount-text">{{ formatAmount(row.commission) }}</span>
           </template>
         </el-table-column>
         <el-table-column prop="afterBalance" label="交易后" width="120" align="right">
           <template #default="{ row }">
             <span class="amount-text">{{ formatAmount(row.afterBalance) }}</span>
           </template>
         </el-table-column>
         <el-table-column prop="status" label="状态" width="100">
           <template #default="{ row }">
             <el-tag :type="getStatusType(row.status)">
               {{ row.status }}
             </el-tag>
           </template>
         </el-table-column>
         <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
       </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  merchantPayoutFlowData, 
  merchantOptions, 
  transactionTypeOptions, 
  statusOptions 
} from '@/data/merchantPayoutFlowData'

// 搜索表单数据
const searchForm = reactive({
  transactionNo: '',
  transactionType: '',
  merchant: '',
  status: '',
  dateRange: []
})

// 表格加载状态
const loading = ref(false)

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 原始表格数据
const originalTableData = ref([...merchantPayoutFlowData])

// 筛选后的表格数据
const filteredData = computed(() => {
  let data = [...originalTableData.value]
  
  // 根据交易单号筛选
  if (searchForm.transactionNo) {
    data = data.filter(item => 
      item.transactionNo.toLowerCase().includes(searchForm.transactionNo.toLowerCase())
    )
  }
  
  // 根据交易类型筛选
  if (searchForm.transactionType) {
    data = data.filter(item => item.transactionType === searchForm.transactionType)
  }
  
  // 根据商户筛选
  if (searchForm.merchant) {
    data = data.filter(item => item.merchant === searchForm.merchant)
  }
  
  // 根据状态筛选
  if (searchForm.status) {
    data = data.filter(item => item.status === searchForm.status)
  }
  
  // 根据日期范围筛选
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.dateRange
    data = data.filter(item => {
      const itemDate = item.createTime.split(' ')[0]
      return itemDate >= startDate && itemDate <= endDate
    })
  }
  
  return data
})

// 当前页表格数据
const tableData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  pagination.total = filteredData.value.length
  return filteredData.value.slice(start, end)
})

// 格式化金额显示
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toFixed(2)
}

// 获取金额样式类
const getAmountClass = (amount) => {
  if (amount > 0) return 'amount-positive'
  if (amount < 0) return 'amount-negative'
  return 'amount-text'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const map = {
    '成功': 'success',
    '失败': 'danger',
    '处理中': 'warning',
    '已取消': 'info'
  }
  return map[status] || 'info'
}

// 搜索处理
const handleSearch = () => {
  loading.value = true
  pagination.currentPage = 1
  
  // 模拟搜索延迟
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

// 重置搜索表单
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'dateRange') {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  pagination.currentPage = 1
  ElMessage.success('重置完成')
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.currentPage = 1
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
}

// 导出数据
const handleExport = () => {
  ElMessage.success('正在导出数据，请稍候...')
  
  // 模拟导出
  setTimeout(() => {
    ElMessage.success('数据导出成功')
  }, 1500)
}

// 组件挂载时初始化数据
onMounted(() => {
  pagination.total = originalTableData.value.length
})
</script>

<style scoped>
.merchant-fund-flow-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filter-form .el-form-item {
  margin-right: 20px;
  margin-bottom: 16px;
}

.filter-form .el-form-item:last-child {
  margin-left: auto;
  margin-right: 0;
}

.filter-form .el-button + .el-button {
  margin-left: 8px;
}

.table-card {
  min-height: 400px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.table-toolbar .right .el-button {
  margin-left: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 金额样式 */
.amount-text {
  color: #303133;
}

.amount-positive {
  color: #67C23A;
  font-weight: 500;
}

.amount-negative {
  color: #F56C6C;
  font-weight: 500;
}
</style>