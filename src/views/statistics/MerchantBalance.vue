<!-- 数据统计/商户余额快照 - 展示商户余额实时数据 -->
<template>
  <div class="merchant-balance-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="日期选择：">
            <el-date-picker
              v-model="searchForm.date"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 160px;"
            />
          </el-form-item>
          <el-form-item label="商户选择：">
            <el-select
              v-model="searchForm.merchantIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择商户"
              style="width: 280px"
              clearable
            >
              <el-option
                v-for="item in merchantOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <div class="filter-buttons">
            <el-button type="primary" :icon="Search" @click="handleSearch" :loading="loading">查询</el-button>
            <el-button plain :icon="RefreshRight" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">商户余额列表</span>
          <el-tag type="info" size="small" effect="plain">{{ total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出数据</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" :loading="loading" />
          </el-tooltip>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table 
        :data="tableData" 
        border 
        stripe
        style="width: 100%" 
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="merchantId" label="商户ID" width="120" align="center" />
        <el-table-column prop="merchantAccount" label="商户账号" width="150" align="center" />
        <el-table-column prop="merchantName" label="商户名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column prop="availableAmount" label="可用余额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.availableAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="frozenAmount" label="冻结余额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.frozenAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="snapshotTime" label="备份时间" width="180" align="center" />
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

    <!-- 明细查看对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="商户余额明细"
      width="800px"
      destroy-on-close
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商户名称" :span="2">{{ currentMerchant.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="商户ID">{{ currentMerchant.merchantId }}</el-descriptions-item>
        <el-descriptions-item label="快照时间">{{ currentMerchant.snapshotTime }}</el-descriptions-item>
        <el-descriptions-item label="账户余额">{{ formatAmount(currentMerchant.balance) }}</el-descriptions-item>
        <el-descriptions-item label="可用金额">{{ formatAmount(currentMerchant.availableAmount) }}</el-descriptions-item>
        <el-descriptions-item label="冻结金额">{{ formatAmount(currentMerchant.frozenAmount) }}</el-descriptions-item>
        <el-descriptions-item label="今日流水" :span="2">
          <el-tag type="success">收入: {{ formatAmount(currentMerchant.todayIncome) }}</el-tag>
          <el-tag type="danger" style="margin-left: 10px;">支出: {{ formatAmount(currentMerchant.todayOutcome) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <div class="merchant-detail-chart">
        <div class="chart-title">余额变化趋势 (近7日)</div>
        <div ref="balanceChartRef" class="balance-chart"></div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="printDetail">
            <el-icon><Printer /></el-icon>打印明细
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Refresh, 
  Search, 
  RefreshRight,
  View,
  Printer,
  Clock
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatAmount } from '@/utils/formatUtils'
import { merchantBalanceData } from '@/data/statisticsData'
import dayjs from 'dayjs'

// 商户选项
const merchantOptions = ref([
  { value: 'M001', label: '测试商户' },
  { value: 'M002', label: '示例商户' },
  { value: 'M003', label: '演示商户' },
  { value: 'M004', label: '测试商户A' },
  { value: 'M005', label: '测试商户B' }
])

// 搜索表单数据
const searchForm = reactive({
  date: dayjs().format('YYYY-MM-DD'),
  merchantIds: []
})

// 表格数据
const tableData = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 详情对话框相关
const detailDialogVisible = ref(false)
const currentMerchant = ref({})
const balanceChartRef = ref(null)

// 初始化表格数据
const initTableData = () => {
  // 模拟异步获取数据并添加日期字段
  loading.value = true
  const data = merchantBalanceData.map(item => ({
    ...item,
    date: item.snapshotTime ? item.snapshotTime.split(' ')[0] : '',
    merchantAccount: `account${item.merchantId.substring(1)}`
  }))
  tableData.value = data
  // 更新总数据量
  total.value = data.length
  loading.value = false
}

// 搜索方法
const handleSearch = () => {
  loading.value = true
  
  // 模拟筛选数据
  setTimeout(() => {
    // 根据搜索条件过滤数据
    let filteredData = [...merchantBalanceData]
    
    if (searchForm.merchantIds && searchForm.merchantIds.length > 0) {
      filteredData = filteredData.filter(item => 
        searchForm.merchantIds.includes(item.merchantId)
      )
    }
    
    if (searchForm.date) {
      const selectedDate = searchForm.date
      filteredData = filteredData.filter(item => 
        item.snapshotTime && item.snapshotTime.startsWith(selectedDate)
      )
    }
    
    const processedData = filteredData.map(item => ({
      ...item,
      date: item.snapshotTime ? item.snapshotTime.split(' ')[0] : '',
      merchantAccount: `account${item.merchantId.substring(1)}`
    }))
    
    tableData.value = processedData
    total.value = processedData.length
    
    loading.value = false
    ElMessage.success('查询成功')
  }, 600)
}

// 重置方法
const handleReset = () => {
  searchForm.date = dayjs().format('YYYY-MM-DD')
  searchForm.merchantIds = []
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
  
  // 模拟图表初始化，实际项目中可能需要使用echarts等图表库
  setTimeout(() => {
    if (balanceChartRef.value) {
      // 模拟创建图表的样式展示
      const chartContainer = balanceChartRef.value;
      chartContainer.innerHTML = '';
      chartContainer.style.display = 'flex';
      chartContainer.style.flexDirection = 'column';
      chartContainer.style.justifyContent = 'center';
      chartContainer.style.alignItems = 'center';
      
      // 添加图表的文本提示
      const chartText = document.createElement('div');
      chartText.textContent = '余额趋势图 (模拟数据)';
      chartText.style.color = '#606266';
      chartText.style.marginBottom = '15px';
      
      // 创建模拟的图表条形展示
      const chartBars = document.createElement('div');
      chartBars.style.display = 'flex';
      chartBars.style.alignItems = 'flex-end';
      chartBars.style.height = '150px';
      chartBars.style.width = '100%';
      chartBars.style.justifyContent = 'space-around';
      
      // 创建7天的余额条形图
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      const values = [
        row.balance * 0.85,
        row.balance * 0.9,
        row.balance * 0.95,
        row.balance * 0.85,
        row.balance * 0.92,
        row.balance * 0.97,
        row.balance
      ];
      
      // 添加每天的余额柱状图
      days.forEach((day, index) => {
        const barContainer = document.createElement('div');
        barContainer.style.display = 'flex';
        barContainer.style.flexDirection = 'column';
        barContainer.style.alignItems = 'center';
        
        const barHeight = (values[index] / row.balance) * 120;
        const bar = document.createElement('div');
        bar.style.width = '30px';
        bar.style.height = `${barHeight}px`;
        bar.style.backgroundColor = '#409EFF';
        bar.style.borderRadius = '3px 3px 0 0';
        
        const label = document.createElement('div');
        label.textContent = day;
        label.style.marginTop = '5px';
        label.style.fontSize = '12px';
        label.style.color = '#606266';
        
        const value = document.createElement('div');
        value.textContent = formatAmount(values[index]).replace('¥', '');
        value.style.fontSize = '10px';
        value.style.color = '#909399';
        value.style.marginTop = '2px';
        
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        barContainer.appendChild(value);
        
        chartBars.appendChild(barContainer);
      });
      
      chartContainer.appendChild(chartText);
      chartContainer.appendChild(chartBars);
    }
  }, 100);
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

<style scoped>
.merchant-balance-container {
  padding: 16px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-direction: column;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filter-row .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
}

.table-toolbar .right .el-button {
  margin-left: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.amount-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.merchant-detail-chart {
  margin-top: 20px;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #606266;
}

.balance-chart {
  height: 300px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 