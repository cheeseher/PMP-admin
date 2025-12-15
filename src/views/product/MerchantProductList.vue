<!-- 商户产品列表页面 - 展示商户与产品关联信息 -->
<template>
  <div class="merchant-product-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="multi-line-filter-form">
        <div class="filter-grid">
          <el-form-item label="商户ID：">
            <el-input v-model="searchForm.id" placeholder="请输入商户ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户账号：">
            <el-input v-model="searchForm.merchantNo" placeholder="请输入商户账号" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户名称：">
            <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="支付产品名称：">
            <el-input v-model="searchForm.product" placeholder="请输入支付产品名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="自定义通道：">
            <el-select v-model="searchForm.customOption" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部" :value="''" />
              <el-option label="是" :value="'true'" />
              <el-option label="否" :value="'false'" />
            </el-select>
          </el-form-item>
          <el-form-item label="轮询/权重：">
            <el-select v-model="searchForm.balanceType" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部" :value="''" />
              <el-option label="轮询" :value="'polling'" />
              <el-option label="权重" :value="'weight'" />
            </el-select>
          </el-form-item>
          <el-form-item label="商户费率：">
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-input v-model="searchForm.minRate" placeholder="最小费率" style="width: 100px" clearable />
              <span>-</span>
              <el-input v-model="searchForm.maxRate" placeholder="最大费率" style="width: 100px" clearable />
              <span>%</span>
            </div>
          </el-form-item>
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
          <span class="table-title">商户产品列表</span>
          <el-tag type="info" size="small" effect="plain">{{ total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" @click="handleBatchAddChannels">批量添加通道</el-button>
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
      >
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
        <el-table-column label="轮询/权重" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.balanceType === 'polling' ? 'primary' : 'warning'" size="small">
              {{ scope.row.balanceType === 'polling' ? '轮询' : '权重' }}
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

    <!-- 批量添加通道弹窗 -->
    <el-dialog
      v-model="batchAddChannelsDialog.visible"
      title="批量添加通道"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form label-width="120px" class="batch-add-form">
        <!-- 全部商户 -->
        <el-form-item label="全部商户">
          <div style="display: flex; align-items: center;">
            <el-switch
              v-model="batchAddChannelsDialog.applyToAllMerchants"
              active-text="是"
              inactive-text="否"
              @change="handleApplyToAllMerchantsChange"
            />
            <span style="margin-left: 12px; color: #909399; font-size: 12px;">
              启用后将针对全部商户产品添加通道
            </span>
          </div>
        </el-form-item>

        <!-- 商户产品 -->
        <el-form-item label="商户产品" v-show="!batchAddChannelsDialog.applyToAllMerchants">
          <el-select
            v-model="batchAddChannelsDialog.selectedMerchantsDisplay"
            placeholder="请选择商户产品"
            style="width: 100%"
            @change="handleSelectedMerchantsChange"
            clearable
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="item in getSelectedMerchantOptions()"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 供应商通道选择 -->
        <el-form-item label="供应商通道">
          <el-select
            v-model="batchAddChannelsDialog.selectedChannels"
            multiple
            filterable
            placeholder="请选择供应商通道"
            style="width: 100%"
          >
            <el-option
              v-for="item in supplierChannels"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelBatchAddChannels">取消</el-button>
          <el-button type="primary" @click="confirmBatchAddChannels">确认添加</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { merchantProductList } from '@/data/merchantProductData'

// 搜索表单
const searchForm = reactive({
  id: '',
  merchantNo: '',
  merchantName: '',
  product: '',
  customOption: '',
  balanceType: '',
  minRate: '',
  maxRate: ''
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
    
    // 轮询/权重筛选
    if (searchForm.balanceType !== '') {
      filteredData = filteredData.filter(item => item.balanceType === searchForm.balanceType)
    }
    
    // 商户费率筛选
    if (searchForm.minRate !== '') {
      filteredData = filteredData.filter(item => item.rate >= parseFloat(searchForm.minRate))
    }
    
    if (searchForm.maxRate !== '') {
      filteredData = filteredData.filter(item => item.rate <= parseFloat(searchForm.maxRate))
    }
    
    total.value = filteredData.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    
    tableData.value = filteredData.slice(start, end)
    loading.value = false
  }, 300)
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

// 批量添加通道弹窗
const batchAddChannelsDialog = ref({
  visible: false,
  selectedMerchants: [],
  selectedMerchantsDisplay: [],
  selectedChannels: [],
  applyToAllMerchants: false // 默认设置为"否"
})

// 供应商通道选项
const supplierChannels = ref([
  { id: 1, name: '渠道A | 通道A | 6%' },
  { id: 2, name: '渠道A | 通道B | 5.5%' },
  { id: 3, name: '渠道B | 通道A | 6.2%' },
  { id: 4, name: '渠道B | 通道B | 5.8%' },
  { id: 5, name: '渠道C | 通道A | 5.9%' },
  { id: 6, name: '渠道C | 通道B | 6.1%' }
])

// 示例商户产品选项（用于未选择具体行时的演示数据）
const sampleMerchantProductOptions = [
  { label: '商户A | 产品A', value: 'sample_1' },
  { label: '商户B | 产品B', value: 'sample_2' },
  { label: '商户C | 产品C', value: 'sample_3' },
  { label: '商户D | 产品D', value: 'sample_4' },
  { label: '商户E | 产品E', value: 'sample_5' }
]

// 批量添加通道
const handleBatchAddChannels = () => {
  // 由于默认启用针对全部商户，不需要重置开关状态
  // 默认隐藏已选商户产品下拉菜单，所以不需要设置selectedMerchantsDisplay
  
  batchAddChannelsDialog.value.selectedChannels = []
  batchAddChannelsDialog.value.visible = true
}

// 确认批量添加通道
const confirmBatchAddChannels = () => {
  if (batchAddChannelsDialog.value.selectedChannels.length === 0) {
    ElMessage.warning('请选择要添加的供应商通道')
    return
  }
  
  let merchantCount = 0
  if (batchAddChannelsDialog.value.applyToAllMerchants) {
    merchantCount = tableData.value.length
  } else {
    if (!batchAddChannelsDialog.value.selectedMerchantsDisplay || batchAddChannelsDialog.value.selectedMerchantsDisplay.length === 0) {
      ElMessage.warning('请选择商户产品范围')
      return
    }
    merchantCount = batchAddChannelsDialog.value.selectedMerchantsDisplay.length
  }
  const channelCount = batchAddChannelsDialog.value.selectedChannels.length
  
  ElMessage.success(`成功为 ${merchantCount} 个商户添加 ${channelCount} 个通道`)
  batchAddChannelsDialog.value.visible = false
  
  // 刷新数据
  fetchData()
}

// 获取已选商户选项
const getSelectedMerchantOptions = () => {
  // 如果启用针对全部商户，显示"全部商户产品"
  if (batchAddChannelsDialog.value.applyToAllMerchants) {
    return [{ label: '全部商户产品', value: 'all_merchants' }]
  }
  
  // 未选择任何行时，返回示例选项
  if (selectedRows.value.length === 0) {
    return sampleMerchantProductOptions
  }
  
  // 返回具体选项，格式为"商户A | 产品A"
  return selectedRows.value.map(row => ({
    label: `${row.merchantName} | ${row.productName}`,
    value: row.id
  }))
}

// 处理商户产品下拉菜单变化（多选）
const handleSelectedMerchantsChange = (value) => {
  if (Array.isArray(value)) {
    ElMessage.info(`当前已选择 ${value.length} 个商户产品`)
  }
}

// 取消批量添加通道
const cancelBatchAddChannels = () => {
  batchAddChannelsDialog.value.visible = false
  batchAddChannelsDialog.value.selectedChannels = []
}

// 表格选择
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 判断行是否可选（当启用针对全部商户时，禁用选择功能）
const isRowSelectable = (row, index) => {
  return !batchAddChannelsDialog.value.applyToAllMerchants
}

// 处理针对全部商户开关变化
const handleApplyToAllMerchantsChange = (value) => {
  if (value) {
    // 启用针对全部商户时，清空之前的选择状态
    selectedRows.value = []
    batchAddChannelsDialog.value.selectedMerchantsDisplay = []
    ElMessage.info('已启用针对全部商户，将清空当前选择')
  } else {
    // 禁用针对全部商户时，恢复选择功能
    if (selectedRows.value.length > 0) {
      if (selectedRows.value.length <= 5) {
        // 选择1-5个时，默认选中全部这些项
        batchAddChannelsDialog.value.selectedMerchantsDisplay = selectedRows.value.map(r => r.id)
      } else {
        // 选择超过5个时，默认选中前5个，标签折叠显示统计
        batchAddChannelsDialog.value.selectedMerchantsDisplay = selectedRows.value.slice(0, 5).map(r => r.id)
      }
    } else {
      // 未选择行时默认选中第一个示例选项
      batchAddChannelsDialog.value.selectedMerchantsDisplay = [sampleMerchantProductOptions[0].value]
    }
    ElMessage.info('已禁用针对全部商户，可选择商户产品范围')
  }
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

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.filter-container {
  overflow: hidden;
}

.multi-line-filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 0;
  display: flex;
  align-items: center;
}

.multi-line-filter-form .el-form-item__label {
  line-height: 32px;
  white-space: nowrap;
  width: auto !important;
  padding-right: 6px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
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

.table-toolbar .right {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* 下拉菜单样式优化 */
:deep(.el-select__tags) {
  flex-wrap: nowrap !important;
  overflow: hidden;
}

:deep(.el-select__tags-text) {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-select .el-tag__close) {
  display: none;
}
</style>