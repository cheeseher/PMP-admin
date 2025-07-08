<!-- 供应商资金流水页面 -->
<template>
  <div class="supplier-fund-container">
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="平台单号：">
            <el-input v-model="searchForm.transactionNo" placeholder="请输入平台单号" style="width: 220px" clearable />
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
          
          <el-form-item label="供应商名称：">
            <el-select 
              v-model="searchForm.upstreamNames" 
              placeholder="请选择供应商名称" 
              style="width: 220px" 
              multiple 
              filterable 
              clearable
              collapse-tags
              collapse-tags-tooltip
            >
              <el-option 
                v-for="item in upstreamOptions" 
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
        <el-table-column prop="upstream" label="供应商名称" min-width="100" />
        <el-table-column prop="transactionNo" label="平台单号" min-width="180" />
        <el-table-column prop="flowNo" label="流水单号" min-width="180" />
        <el-table-column label="交易前" min-width="180">
          <template #default="scope">
            <div>余额: {{ formatAmount(scope.row.beforeTotal) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="transactionAmount" label="交易金额" min-width="100">
          <template #default="scope">
            <span :style="{ color: scope.row.transactionAmount >= 0 ? '#67c23a' : '#f56c6c' }">
              {{ scope.row.transactionAmount >= 0 ? '+' : '' }}{{ formatAmount(scope.row.transactionAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="transactionType" label="交易类型" min-width="100" />
        <el-table-column prop="fee" label="通道成本" min-width="100">
          <template #default="scope">
            {{ formatAmount(scope.row.fee) }}
          </template>
        </el-table-column>
        <el-table-column label="交易后" min-width="180">
          <template #default="scope">
            <div>余额: {{ formatAmount(scope.row.afterTotal) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column prop="createTime" label="完成时间" min-width="150" />
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
  upstreamNames: [],
  dateRange: []
})

// 交易类型选项
const transactionTypeOptions = [
  { label: '收款', value: 'income' },
  { label: '交易撤销', value: 'cancel' },
  { label: '余额增加', value: 'balance_increase' },
  { label: '余额扣减', value: 'balance_decrease' },
  { label: '修改金额', value: 'amount_change' },
  { label: '修改金额冲账', value: 'amount_change_reverse' }
]

// 供应商选项
const upstreamOptions = [
  { label: '新闪电', value: 'xsd' },
  { label: '闪付通', value: 'sft' },
  { label: '万通支付', value: 'wtzf' },
  { label: '快速通道', value: 'kstd' },
  { label: 'test', value: 'test' }
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
    transactionNo: 'P202503301430001234',
    flowNo: 'CJK202503301430001001',
    beforeTotal: 558.00,
    beforeAvailable: 458.00,
    beforeFrozen: 100.00,
    transactionAmount: 120.00,
    transactionType: '修改金额',
    fee: 1.20,
    freezeAmount: 0.00,
    afterTotal: 678.00,
    afterAvailable: 578.00,
    afterFrozen: 100.00,
    remark: '订单金额修改',
    createTime: '2025-03-30 14:30:00'
  },
  {
    upstream: '新闪电',
    transactionNo: 'P202503301429001234',
    flowNo: 'CJK202503301429001000',
    beforeTotal: 658.00,
    beforeAvailable: 558.00,
    beforeFrozen: 100.00,
    transactionAmount: -100.00,
    transactionType: '修改金额冲账',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 558.00,
    afterAvailable: 458.00,
    afterFrozen: 100.00,
    remark: '原订单金额冲账',
    createTime: '2025-03-30 14:29:00'
  },
  {
    upstream: '新闪电',
    transactionNo: 'P202503301342001234',
    flowNo: 'CJK202503301342001002',
    beforeTotal: 588.00,
    beforeAvailable: 488.00,
    beforeFrozen: 100.00,
    transactionAmount: 70.00,
    transactionType: '收款',
    fee: 0.70,
    freezeAmount: 0.00,
    afterTotal: 658.00,
    afterAvailable: 558.00,
    afterFrozen: 100.00,
    remark: '',
    createTime: '2025-03-30 13:42:00'
  },
  {
    upstream: '闪付通',
    transactionNo: 'P202503291454001235',
    flowNo: 'CJK202503291454001003',
    beforeTotal: 88.00,
    beforeAvailable: 88.00,
    beforeFrozen: 0.00,
    transactionAmount: 500.00,
    transactionType: '收款',
    fee: 10.00,
    freezeAmount: 100.00,
    afterTotal: 588.00,
    afterAvailable: 488.00,
    afterFrozen: 100.00,
    remark: '',
    createTime: '2025-03-29 14:54:37'
  },
  {
    upstream: '万通支付',
    transactionNo: 'P202503291044001236',
    flowNo: 'CJK202503291044001004',
    beforeTotal: 178.90,
    beforeAvailable: 178.90,
    beforeFrozen: 0.00,
    transactionAmount: -90.90,
    transactionType: '交易撤销',
    fee: 0.91,
    freezeAmount: 0.00,
    afterTotal: 88.00,
    afterAvailable: 88.00,
    afterFrozen: 0.00,
    remark: '',
    createTime: '2025-03-29 10:44:52'
  },
  {
    upstream: '快速通道',
    transactionNo: '',
    flowNo: 'CJK202503281521001005',
    beforeTotal: 78.90,
    beforeAvailable: 78.90,
    beforeFrozen: 0.00,
    transactionAmount: 100.00,
    transactionType: '余额增加',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 178.90,
    afterAvailable: 178.90,
    afterFrozen: 0.00,
    remark: '人工进行余额操作时输入的备注',
    createTime: '2025-03-28 15:21:33'
  },
  {
    upstream: 'test',
    transactionNo: '',
    flowNo: 'CJK202503270918001006',
    beforeTotal: 100.00,
    beforeAvailable: 100.00,
    beforeFrozen: 0.00,
    transactionAmount: -21.10,
    transactionType: '余额扣减',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 78.90,
    afterAvailable: 78.90,
    afterFrozen: 0.00,
    remark: '人工进行余额操作时输入的备注',
    createTime: '2025-03-27 09:18:12'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 格式化金额
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toFixed(2)
}

// 搜索与重置
const handleSearch = () => {
  currentPage.value = 1
  refreshData()
}

const handleReset = () => {
  // 重置搜索表单
  Object.keys(searchForm).forEach(key => {
    if (key === 'dateRange' || key === 'upstreamNames') {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  currentPage.value = 1
  refreshData()
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 800)
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  refreshData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  refreshData()
}

// 导出数据
const handleExport = () => {
  ElMessage.success('正在导出数据，请稍候...')
  setTimeout(() => {
    ElMessage.success('数据导出成功')
  }, 1500)
}

// 初始化
onMounted(() => {
  refreshData()
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
  flex-wrap: wrap;
  width: 100%;
  align-items: center;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.filter-buttons .el-button + .el-button {
  margin-left: 8px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
}

.table-toolbar .right {
  display: flex;
  align-items: center;
}

.table-toolbar .right .el-button {
  margin-left: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.mt-16 {
  margin-top: 16px;
}
</style> 