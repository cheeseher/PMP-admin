<!-- 商户产品列表页面 - 展示商户与产品关联信息 -->
<template>
  <div class="merchant-product-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="商户ID：">
            <el-input v-model="searchForm.id" placeholder="请输入商户ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户账号：">
            <el-input v-model="searchForm.merchantNo" placeholder="请输入商户账号" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="商户名称：">
            <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="支付产品名称：">
            <el-input v-model="searchForm.product" placeholder="请输入支付产品名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="自定义通道：">
            <el-select v-model="searchForm.customOption" placeholder="请选择" style="width: 120px" clearable>
              <el-option label="全部" :value="''" />
              <el-option label="是" :value="'true'" />
              <el-option label="否" :value="'false'" />
            </el-select>
          </el-form-item>
        </div>
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">商户产品列表</span>
          <el-tag type="info" size="small" effect="plain">{{ total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="fetchData" />
          </el-tooltip>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="id" label="商户ID" width="80" sortable />
        <el-table-column prop="merchantNo" label="商户账号" min-width="120" />
        <el-table-column prop="merchantName" label="商户名称" min-width="150" />
        <el-table-column prop="productName" label="支付产品名称" min-width="150" />
        <el-table-column prop="productCode" label="支付产品编码" min-width="120" />
        <el-table-column prop="rate" label="商户费率" width="100" align="right">
          <template #default="scope">
            <span class="rate-cell">{{ scope.row.rate.toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="自定义通道" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.customOption ? 'success' : 'info'" size="small">
              {{ scope.row.customOption ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="供应商通道" min-width="180">
          <template #default="scope">
            <template v-if="scope.row.selectedChannels && scope.row.selectedChannels.length">
              <span v-for="(channel, idx) in scope.row.selectedChannels.slice(0,2)" :key="channel.name" class="supplier-channel-item">
                {{ channel.name }} | 通道A | {{ channel.rate }}%
                <span v-if="idx < Math.min(scope.row.selectedChannels.length,2) - 1">，</span>
              </span>
              <el-button v-if="scope.row.selectedChannels.length > 2" type="text" size="small" @click.stop="showAllChannels(scope.row)">全部</el-button>
            </template>
            <span v-else>-</span>
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
    </el-card>

    <el-dialog v-model="allChannelsDialog.visible" title="全部供应商通道" width="400px" :close-on-click-modal="true">
      <el-table :data="allChannelsDialog.channels" border size="small">
        <el-table-column label="通道名称" min-width="120">
          <template #default="scope">
            {{ scope.row.name }} | 通道A | {{ scope.row.rate }}%
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { merchantProductList } from '@/data/merchantProductData'

// 搜索表单
const searchForm = reactive({
  id: '',
  merchantNo: '',
  merchantName: '',
  product: '',
  customOption: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const jumpPage = ref('')

const allChannelsDialog = ref({ 
  visible: false, 
  channels: []
})

// 获取数据
const fetchData = () => {
  loading.value = true
  // 模拟异步请求
  setTimeout(() => {
    // 过滤数据
    let filteredData = [...merchantProductList]
    
    if (searchForm.id) {
      filteredData = filteredData.filter(item => 
        item.id.toString().includes(searchForm.id))
    }
    
    if (searchForm.merchantNo) {
      filteredData = filteredData.filter(item => 
        item.merchantNo.includes(searchForm.merchantNo))
    }
    
    if (searchForm.merchantName) {
      filteredData = filteredData.filter(item => 
        item.merchantName.toLowerCase().includes(searchForm.merchantName.toLowerCase()))
    }
    
    if (searchForm.product) {
      filteredData = filteredData.filter(item => 
        item.productName.toLowerCase().includes(searchForm.product.toLowerCase()) ||
        item.productCode.toLowerCase().includes(searchForm.product.toLowerCase()))
    }
    
    if (searchForm.customOption !== '') {
      filteredData = filteredData.filter(item => String(item.customOption) === searchForm.customOption)
    }
    
    total.value = filteredData.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    
    tableData.value = filteredData.slice(start, end)
    loading.value = false
  }, 300)
}

// 导出数据
const handleExport = () => {
  ElMessage.success('商户产品关联数据导出成功')
}

// 搜索与重置
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  // 重置搜索表单
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  fetchData()
}

// 表格选择
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

function showAllChannels(row) {
  allChannelsDialog.value.channels = row.selectedChannels || []
  allChannelsDialog.value.visible = true
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.merchant-product-list-container {
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
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
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

.rate-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.supplier-channel-item {
  display: inline-block;
  margin-right: 4px;
  color: #606266;
}
</style> 