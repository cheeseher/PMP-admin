<!-- 商户流水页面 -->
<template>
  <div class="merchant-transaction-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="商户：" v-if="subAccounts.length > 0">
            <el-select v-model="searchForm.merchantId" placeholder="全部" style="width: 150px" clearable>
              <el-option label="全部" value="" />
              <el-option 
                v-for="account in subAccounts" 
                :key="account.id" 
                :label="`${account.productName} (${account.id})`" 
                :value="account.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="流水类型：">
            <el-select v-model="searchForm.type" placeholder="请选择流水类型" style="width: 168px" clearable>
              <el-option label="全部" value="" />
              <el-option label="收款" value="income" />
              <el-option label="交易撤销" value="cancel" />
              <el-option label="余额增加" value="balance_increase" />
              <el-option label="余额扣减" value="balance_decrease" />
              <el-option label="修改金额" value="amount_change" />
              <el-option label="修改金额冲账" value="amount_change_reverse" />
            </el-select>
          </el-form-item>
          <el-form-item label="商户订单号：">
            <el-input v-model="searchForm.merchantOrderId" placeholder="请输入商户订单号" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="平台订单号：">
            <el-input v-model="searchForm.platformOrderId" placeholder="请输入平台订单号" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="时间筛选：">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              style="width: 320px"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        
          <!-- 按钮区域 -->
          <div class="filter-buttons">
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <!-- 删除统计日期信息 -->
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新">
            <el-button :icon="Refresh" circle plain @click="handleSearch" />
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
                  <el-table-column prop="merchantName" label="商户名称" min-width="120" />
        <el-table-column prop="auditId" label="流水订单号" min-width="200" />
          <el-table-column prop="systemOrderId" label="平台订单号" min-width="200" />
          <el-table-column prop="merchantOrderId" label="商户订单号" min-width="200" />
          <el-table-column prop="type" label="流水类型" width="120">
          <template #default="scope">
            <el-tag type="success" size="small" effect="plain">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="beforeAmount" label="变更前余额" width="120" align="right">
          <template #default="scope">
            <span>¥{{ formatAmount(scope.row.beforeAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="changeAmount" label="变更金额" width="120" align="right">
          <template #default="scope">
            <span :style="{ color: scope.row.changeAmount >= 0 ? '#67c23a' : '#f56c6c' }">
              ¥{{ scope.row.changeAmount >= 0 ? '+' : '' }}{{ formatAmount(scope.row.changeAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="afterAmount" label="变更后余额" width="120" align="right">
          <template #default="scope">
            <span>¥{{ formatAmount(scope.row.afterAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="merchantRate" label="商户费率" width="100" align="right">
          <template #default="scope">
            {{ scope.row.merchantRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="merchantFee" label="商户手续费" width="120" align="right">
          <template #default="scope">
            ¥{{ formatAmount(scope.row.merchantFee) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="完成时间" width="180" />
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { productList } from '@/data/productData'

const route = useRoute()

// 商户筛选
const subAccounts = ref([])
const currentLoginMerchantId = ref('')

// 获取当前登录商户的子账户
const fetchSubAccounts = () => {
  const merchantId = route.query.merchant || '2'
  if (!merchantId) return "currentLoginMerchantId.value"

  currentLoginMerchantId.value = merchantId
  
  // 查找当前商户
  const currentMerchant = productList.find(p => String(p.id) === String(merchantId))
  
  if (currentMerchant && currentMerchant.subAccounts && currentMerchant.subAccounts.length > 0) {
    // 获取子账户详情
    const accounts = []
    currentMerchant.subAccounts.forEach(subId => {
      const sub = productList.find(p => p.id === subId)
      if (sub) {
        accounts.push(sub)
      }
    })
    subAccounts.value = accounts
  } else {
    subAccounts.value = []
  }
}

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今日',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '昨日',
    value: () => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setTime(today.getTime() - 3600 * 1000 * 24)
      return [yesterday, yesterday]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 搜索表单
const searchForm = reactive({
  merchantId: '', // Added merchant filter
  type: '',
  merchantOrderId: '',
  platformOrderId: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    merchantName: '商户B',
    type: '修改金额',
    beforeAmount: 205.00,
    changeAmount: 120.00,
    afterAmount: 325.00,
    transactionAmount: 120.00,
    merchantRate: 2.00,
    merchantFee: 2.40,
    remark: '订单金额修改',
    auditId: 'MJK202503301425001001',
    systemOrderId: 'P202503301425001234',
    merchantOrderId: 'M20250330001',
    createTime: '2025/03/30 14:25:00'
  },
  {
    merchantName: '商户B',
    type: '修改金额冲账',
    beforeAmount: 305.00,
    changeAmount: -100.00,
    afterAmount: 205.00,
    transactionAmount: 100.00,
    merchantRate: 0.00,
    merchantFee: 0.00,
    remark: '原订单金额冲账',
    auditId: 'MJK202503301424001000',
    systemOrderId: 'P202503301424001234',
    merchantOrderId: 'M20250330001',
    createTime: '2025/03/30 14:24:00'
  },
  {
    merchantName: '商户E',
    type: '收款',
    beforeAmount: 235.00,
    changeAmount: 70.00,
    afterAmount: 305.00,
    transactionAmount: 80.00,
    merchantRate: 12.50,
    merchantFee: 10.00,
    remark: '-',
    auditId: 'MJK202503291223510001',
    systemOrderId: 'P202503291223510001',
    merchantOrderId: 'M20250329001',
    createTime: '2025/03/29 12:23:51'
  },
  {
    merchantName: '商户B',
    type: '交易撤销',
    beforeAmount: 335.00,
    changeAmount: -100.00,
    afterAmount: 235.00,
    transactionAmount: 100.00,
    merchantRate: 0.00,
    merchantFee: 0.00,
    remark: '-',
    auditId: 'MJK202503281127260002',
    systemOrderId: 'P202503281127260002',
    merchantOrderId: 'M20250328002',
    createTime: '2025/03/28 11:27:26'
  },
  {
    merchantName: '商户E',
    type: '修改金额',
    beforeAmount: 235.00,
    changeAmount: 100.00,
    afterAmount: 335.00,
    transactionAmount: 100.00,
    merchantRate: 5.30,
    merchantFee: 5.30,
    remark: '-',
    auditId: 'MJK202503280950500003',
    systemOrderId: 'P202503280950500003',
    merchantOrderId: 'M20250328003',
    createTime: '2025/03/28 09:50:50'
  },
  {
    merchantName: '商户B',
    type: '余额增加',
    beforeAmount: 135.00,
    changeAmount: 100.00,
    afterAmount: 235.00,
    transactionAmount: 100.00,
    merchantRate: 0,
    merchantFee: 0,
    remark: '人工进行余额操作时输入的备注',
    auditId: 'MJK202503280930120004',
    systemOrderId: '',
    merchantOrderId: '',
    createTime: '2025/03/28 09:30:12'
  },
  {
    merchantName: '商户B',
    type: '余额扣减',
    beforeAmount: 100.00,
    changeAmount: -65.00,
    afterAmount: 135.00,
    transactionAmount: 65.00,
    merchantRate: 0,
    merchantFee: 0,
    remark: '人工进行余额操作时输入的备注',
    auditId: 'MJK202503280925480005',
    systemOrderId: '',
    merchantOrderId: '',
    createTime: '2025/03/28 09:25:48'
  }
])

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 格式化金额
const formatAmount = (amount) => {
  return Number(amount).toFixed(2)
}

// 搜索
const handleSearch = () => {
  loading.value = true
  // 模拟请求
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 300)
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  handleSearch()
}

// 导出
const handleExport = () => {
  ElMessage.success('数据导出成功')
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

// 页面加载时获取数据
onMounted(() => {
  fetchSubAccounts()
  handleSearch()
})
</script>

<style scoped>
.merchant-transaction-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  width: 100%;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
}

.filter-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
}

.filter-form :deep(.el-form-item__label) {
  padding-right: 8px;
  font-weight: normal;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  gap: 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 2px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
}

.table-toolbar .right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.statistics-info {
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
}
</style> 