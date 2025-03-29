<!-- 供应商资金流水页面 -->
<template>
  <div class="supplier-fund-container">
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="交易单号：">
            <el-input v-model="searchForm.transactionNo" placeholder="请输入交易单号" style="width: 220px" clearable />
          </el-form-item>
          
          <el-form-item label="交易类型：">
            <el-select v-model="searchForm.transactionType" placeholder="请选择交易类型" style="width: 168px" clearable>
              <el-option 
                v-for="item in transactionTypeOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="上游名称：">
            <el-select v-model="searchForm.upstreamName" placeholder="请选择上游名称" style="width: 168px" clearable>
              <el-option 
                v-for="item in upstreamOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态：">
            <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 168px" clearable>
              <el-option 
                v-for="item in statusOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="日期范围：">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>
          
          <div class="filter-buttons">
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="mt-16">
      <div class="table-toolbar">
        <div class="left">
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" />
          </el-tooltip>
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="upstream" label="上游" min-width="100" />
        <el-table-column prop="transactionNo" label="交易单号" min-width="180" />
        <el-table-column prop="flowNo" label="流水单号" min-width="180" />
        <el-table-column label="交易前" min-width="180">
          <template #default="scope">
            <div>总额: {{ formatAmount(scope.row.beforeTotal) }}</div>
            <div>可用: {{ formatAmount(scope.row.beforeAvailable) }}</div>
            <div>冻结: {{ formatAmount(scope.row.beforeFrozen) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="transactionAmount" label="交易金额" min-width="100">
          <template #default="scope">
            {{ formatAmount(scope.row.transactionAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="transactionType" label="交易类型" min-width="100" />
        <el-table-column prop="fee" label="手续费" min-width="100">
          <template #default="scope">
            {{ formatAmount(scope.row.fee) }}
          </template>
        </el-table-column>
        <el-table-column prop="freezeAmount" label="冻结金额" min-width="100">
          <template #default="scope">
            {{ formatAmount(scope.row.freezeAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="交易后" min-width="180">
          <template #default="scope">
            <div>总额: {{ formatAmount(scope.row.afterTotal) }}</div>
            <div>可用: {{ formatAmount(scope.row.afterAvailable) }}</div>
            <div>冻结: {{ formatAmount(scope.row.afterFrozen) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              size="small"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column prop="createTime" label="时间" min-width="150" />
      </el-table>
      
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  transactionNo: '',
  transactionType: '',
  upstreamName: '',
  status: '',
  dateRange: []
})

// 交易类型选项
const transactionTypeOptions = [
  { label: '收数手续费', value: 'collectFee' },
  { label: '收款', value: 'income' },
  { label: '交易撤销', value: 'cancel' },
  { label: '交易撤销', value: 'reversal' }
]

// 上游选项
const upstreamOptions = [
  { label: '新闪电', value: 'xsd' },
  { label: 'test', value: 'test' }
]

// 状态选项
const statusOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '处理中', value: 'processing' }
]

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const end = new Date()
      const start = new Date()
      return [start, end]
    }
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    upstream: '新闪电',
    transactionNo: 'P202410311552458103036361',
    flowNo: 'F202410311552458103036',
    beforeTotal: 658968.45,
    beforeAvailable: 658468.45,
    beforeFrozen: 500.00,
    transactionAmount: 0.00,
    transactionType: '收数手续费',
    fee: 30.00,
    freezeAmount: 0.00,
    afterTotal: 658938.45,
    afterAvailable: 658438.45,
    afterFrozen: 500.00,
    status: '成功',
    remark: '',
    createTime: '2025-03-29 14:54:37'
  },
  {
    upstream: '新闪电',
    transactionNo: 'P202410311552458103036361',
    flowNo: 'F202410311552458103037',
    beforeTotal: 658468.45,
    beforeAvailable: 657968.45,
    beforeFrozen: 500.00,
    transactionAmount: 500.00,
    transactionType: '收款',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 658968.45,
    afterAvailable: 658468.45,
    afterFrozen: 500.00,
    status: '成功',
    remark: '',
    createTime: '2025-03-29 14:54:37'
  },
  {
    upstream: 'test',
    transactionNo: 'P202503251139111459862760',
    flowNo: 'F202503251139111459862',
    beforeTotal: 101.00,
    beforeAvailable: 101.00,
    beforeFrozen: 0.00,
    transactionAmount: 0.00,
    transactionType: '收数手续费',
    fee: 30.30,
    freezeAmount: 0.00,
    afterTotal: 70.70,
    afterAvailable: 70.70,
    afterFrozen: 0.00,
    status: '成功',
    remark: '',
    createTime: '2025-03-29 10:44:52'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(3) // 实际应用中从API获取

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '成功': 'success',
    '失败': 'danger',
    '处理中': 'warning'
  }
  return typeMap[status] || 'info'
}

// 格式化金额
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toFixed(2)
}

// 搜索与重置
const handleSearch = () => {
  console.log('搜索', searchForm)
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'dateRange') {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 500)
}

// 导出
const handleExport = () => {
  ElMessage.success('正在导出数据，请稍后...')
}

// 分页事件处理
const handleSizeChange = (val) => {
  pageSize.value = val
  // 这里应该调用获取数据的方法
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 这里应该调用获取数据的方法
}

// 页面加载时获取数据
onMounted(() => {
  // 实际应用中这里应该调用API获取数据
})
</script>

<style scoped>
.supplier-fund-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-row {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  align-items: flex-start;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.filter-buttons .el-button + .el-button {
  margin-left: 8px;
}

.mt-16 {
  margin-top: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-toolbar .left .el-button {
  margin-right: 8px;
}

.table-toolbar .right .el-button {
  margin-left: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style> 