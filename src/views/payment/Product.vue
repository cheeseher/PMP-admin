<!-- 支付配置/支付产品管理 - 管理系统支持的支付产品 -->
<template>
  <div class="payment-product">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="支付产品ID：">
            <el-input v-model="searchForm.id" placeholder="请输入支付产品ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="支付产品名称：">
            <el-input v-model="searchForm.productName" placeholder="请输入支付产品名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="支付产品编码：">
            <el-input v-model="searchForm.productCode" placeholder="请输入支付产品编码" style="width: 220px" clearable />
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
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button :icon="Check" plain @click="handleBatchApprove">产品一键开启</el-button>
          <el-button :icon="Close" plain @click="handleBatchReject">产品一键关闭</el-button>
          <el-button :icon="Remove" plain @click="handleBatchRemove">下单一键关闭</el-button>
          <el-button :icon="Delete" plain :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="fetchData" />
          </el-tooltip>
        </div>
      </div>

      <el-table 
        :data="tableData" 
        border 
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="id" label="支付产品ID" width="120" />
        <el-table-column prop="productName" label="支付产品名称" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <div class="field-container">
              <span>{{ scope.row.productName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="productCode" label="支付产品编码" min-width="120" show-overflow-tooltip>
          <template #default="scope">
            <div class="field-container">
              <span>{{ scope.row.productCode }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="feeRate" label="商户费率" width="120">
          <template #default="scope">
            <div class="field-container">
              <span class="fee-value">{{ scope.row.feeRate }}%</span>
              <div v-if="scope.row.scheduledFeeEnabled === 'YES' && scope.row.pendingFeeRate !== undefined" class="pending-value">
                <span class="pending-text">{{ scope.row.pendingFeeRate }}%</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <div class="field-container">
              <el-tag
                :type="scope.row.status === 'ONLINE' ? 'success' : 'danger'"
                effect="plain"
              >
                {{ scope.row.status === 'ONLINE' ? '启用' : '禁用' }}
              </el-tag>
              <div v-if="scope.row.scheduledFeeEnabled === 'YES' && scope.row.pendingStatus" class="pending-value">
                <span class="pending-text">{{ scope.row.pendingStatus === 'OFFLINE' ? '禁用' : '启用' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="scope">
            <el-button link type="primary" :icon="View" @click="handleView(scope.row)">查看</el-button>
            <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="formType === 'add' ? '新增支付产品' : '编辑支付产品'"
      v-model="formDialogVisible"
      width="600px"
      destroy-on-close
    >
      <el-form 
        :model="productForm" 
        :rules="formRules" 
        ref="productFormRef" 
        label-width="140px"
        class="product-form"
      >
        <el-form-item label="支付产品名称" prop="productName">
          <el-input v-model="productForm.productName" placeholder="请输入支付产品名称" />
        </el-form-item>
        <el-form-item label="支付产品编码" prop="productCode">
          <el-input v-model="productForm.productCode" placeholder="请输入支付产品编码" />
        </el-form-item>
        <el-form-item label="供应商通道" prop="channelCode">
          <el-select v-model="productForm.channelCode" multiple filterable placeholder="请选择供应商通道" style="width: 100%" @change="handleChannelChange">
            <el-option
              v-for="item in supplierChannelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 供应商通道表格 -->
        <el-form-item label="" v-if="productForm.channelCode && productForm.channelCode.length > 0">
          <div class="channel-table-container">
            <el-table :data="channelTableData" border style="width: 100%" size="small">
              <el-table-column prop="channelName" label="通道名称" min-width="120" />
              <el-table-column prop="channelCode" label="通道编码" min-width="120" />
              <el-table-column prop="channelFeeRate" label="通道费率" width="100">
                <template #default="scope">
                  <span>{{ scope.row.channelFeeRate }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="weight" label="权重" width="120">
                <template #default="scope">
                  <el-input-number 
                    v-model="scope.row.weight" 
                    :precision="0" 
                    :step="1" 
                    :min="1" 
                    :max="100"
                    controls-position="right"
                    style="width: 90%" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
        
        <el-form-item label="商户费率" prop="feeRate">
          <div class="fee-rate-input">
            <el-input-number 
              v-model="productForm.feeRate" 
              :precision="0" 
              :step="1" 
              :min="0" 
              :max="100"
              style="width: calc(100% - 20px)" />
            <span class="fee-rate-suffix">%</span>
          </div>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="productForm.status"
            active-value="ONLINE"
            inactive-value="OFFLINE"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        <el-form-item label="是否轮询" prop="isPolling">
          <el-radio-group v-model="productForm.isPolling">
            <el-radio label="WEIGHT">权重</el-radio>
            <el-radio label="POLLING">轮询</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 修改为同步配置到商户的三选一方案 -->
        <el-form-item label="同步配置到商户" prop="syncOption" v-if="formType === 'edit'">
          <el-radio-group v-model="productForm.syncOption" @change="handleSyncOptionChange">
            <el-radio label="none">不同步</el-radio>
            <el-radio label="immediate">立即同步</el-radio>
            <el-radio label="scheduled">定时同步</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 生效时间设置 -->
        <el-form-item 
          label="生效时间" 
          prop="effectiveTime"
          v-if="formType === 'edit' && (productForm.syncOption === 'none' || productForm.syncOption === 'scheduled')"
          :rules="[
            { required: productForm.syncOption === 'scheduled', message: '定时同步时生效时间为必填项', trigger: 'change' }
          ]"
        >
          <el-date-picker
            v-model="productForm.effectiveTime"
            type="datetime"
            placeholder="选择生效时间"
            style="width: 240px"
            :disabled-date="disabledDate"
            format="YYYY-MM-DD HH:00:00"
            value-format="YYYY-MM-DD HH:00:00"
            :default-time="new Date(2000, 0, 1, 0, 0, 0)"
          />
          
          <span v-if="productForm.syncOption === 'scheduled' && productForm.effectiveTime && !isEffectiveTimeExpired" class="countdown-tip">
            距离生效还有：{{ formattedCountdown }}
          </span>
          
          <span v-if="productForm.syncOption === 'none' && productForm.effectiveTime" class="sync-tip">
            (仅修改模板配置，不影响商户)
          </span>
        </el-form-item>
        
        <el-form-item label="超级密码" prop="superPassword" v-if="formType === 'edit' && productForm.syncOption !== 'none'">
          <el-input 
            v-model="productForm.superPassword" 
            type="password"
            placeholder="请输入超级密码"
            show-password 
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="productForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleFormSubmit" 
            :loading="submitLoading">确认</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 查看弹窗 -->
    <el-dialog
      title="查看支付产品"
      v-model="viewDialogVisible"
      width="600px"
      destroy-on-close
    >
      <el-form 
        :model="viewForm" 
        label-width="140px"
        class="product-form"
        disabled
      >
        <el-form-item label="支付产品名称">
          <el-input v-model="viewForm.productName" disabled />
        </el-form-item>
        <el-form-item label="支付产品编码">
          <el-input v-model="viewForm.productCode" disabled />
        </el-form-item>
        <el-form-item label="供应商通道">
          <el-select v-model="viewForm.channelCode" multiple filterable disabled style="width: 100%">
            <el-option
              v-for="item in supplierChannelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 供应商通道表格 -->
        <el-form-item label="" v-if="viewForm.channelCode && viewForm.channelCode.length > 0">
          <div class="channel-table-container">
            <el-table :data="viewChannelTableData" border style="width: 100%" size="small">
              <el-table-column prop="channelName" label="通道名称" min-width="120" />
              <el-table-column prop="channelCode" label="通道编码" min-width="120" />
              <el-table-column prop="channelFeeRate" label="通道费率" width="100">
                <template #default="scope">
                  <span>{{ scope.row.channelFeeRate }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="weight" label="权重" width="120">
                <template #default="scope">
                  <span>{{ scope.row.weight }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
        
        <!-- 查看弹窗中的商户费率 - 只显示当前费率 -->
        <el-form-item label="商户费率">
          <el-input 
            v-model="viewForm.feeRateDisplay" 
            disabled
            style="width: calc(100% - 20px)"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch
            v-model="viewForm.status"
            active-value="ONLINE"
            inactive-value="OFFLINE"
            active-text="启用"
            inactive-text="禁用"
            disabled
          />
        </el-form-item>
        <el-form-item label="是否轮询">
          <el-radio-group v-model="viewForm.isPolling" disabled>
            <el-radio label="WEIGHT">权重</el-radio>
            <el-radio label="POLLING">轮询</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="viewForm.remark"
            type="textarea"
            :rows="3"
            disabled
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { Search, Delete, Plus, Edit, Refresh, Check, Close, Remove, Download, Timer, Right, InfoFilled, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCleanup } from '@/utils/cleanupUtils'

// 测试通道数据
const testChannelList = [
  { id: 'C001', supplier: '供应商A', channelName: '通道A', channelCode: 'CHANNEL_A', rate: 2.5 },
  { id: 'C002', supplier: '供应商B', channelName: '通道B', channelCode: 'CHANNEL_B', rate: 1.8 },
  { id: 'C003', supplier: '供应商C', channelName: '通道C', channelCode: 'CHANNEL_C', rate: 3.0 },
  { id: 'C004', supplier: '供应商D', channelName: '通道D', channelCode: 'CHANNEL_D', rate: 2.0 },
  { id: 'C005', supplier: '供应商E', channelName: '通道E', channelCode: 'CHANNEL_E', rate: 3.2 }
]

// 模拟导入
const channelList = testChannelList
import { getTomorrowDate, disabledDate, formatScheduledTime, getRemainingTimeText } from '@/utils/datetimeUtils'

const searchForm = reactive({
  id: '',
  productName: '',
  productCode: ''
})

const tableData = ref([
  {
    id: 1,
    productName: '支付产品A',
    productCode: '8888',
    payType: 'ALIPAY',
    feeRate: 0,
    channelCode: ['C001', 'C003'],
    scheduledFeeEnabled: 'NO',
    scheduledFeeTime: '',
    status: 'ONLINE',
    isPolling: 'WEIGHT',
    remark: '这是演示产品的备注说明'
  },
  {
    id: 2,
    productName: '支付产品B',
    productCode: 'WECHATPAY',
    payType: 'WECHAT',
    feeRate: 0.5,
    channelCode: ['C002', 'C004', 'C005'],
    scheduledFeeEnabled: 'YES',
    scheduledFeeTime: (() => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      return futureDate.toISOString().split('T')[0];
    })(),
    pendingFeeRate: 1.0,
    pendingProductName: '支付产品B（升级版）',
    pendingProductCode: 'WECHATPAY_V2',
    pendingStatus: 'OFFLINE',
    status: 'ONLINE',
    isPolling: 'WEIGHT',
    remark: '微信支付通道产品'
  },
  {
    id: 3,
    productName: '支付产品C',
    productCode: 'UNIONPAY',
    payType: 'UNIONPAY',
    feeRate: 0,
    channelCode: ['C001', 'C002', 'C003', 'C004'],
    scheduledFeeEnabled: 'NO',
    scheduledFeeTime: '',
    status: 'OFFLINE',
    isPolling: 'WEIGHT',
    remark: '银联支付通道产品，暂时下线维护'
  },
  {
    id: 4,
    productName: '支付产品D',
    productCode: 'QUICKPAY',
    payType: 'QUICKPAY',
    feeRate: 1.2,
    channelCode: ['C005'],
    scheduledFeeEnabled: 'NO',
    scheduledFeeTime: '',
    status: 'ONLINE',
    isPolling: 'POLLING',
    remark: '快捷支付产品'
  }
])

const selectedRows = ref([])
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const loading = ref(false)

const formDialogVisible = ref(false)
const formType = ref('add')
const productFormRef = ref(null)
const productForm = reactive({
  id: null,
  productName: '',
  productCode: '',
  channelCode: [],
  feeRate: 0,
  scheduledFeeEnabled: 'NO',
  scheduledFeeTime: '',
  status: 'ONLINE',
  isPolling: 'WEIGHT',
  syncOption: 'none',
  effectiveTime: '',
  superPassword: '',
  remark: ''
})

const submitLoading = ref(false)

const channelTableData = ref([])

// 新增：用于重置产品表单的函数
const resetProductForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  
  // 重置所有表单字段
  Object.keys(productForm).forEach(key => {
    if (Array.isArray(productForm[key])) {
      productForm[key] = []
    } else if (typeof productForm[key] === 'number') {
      productForm[key] = 0
    } else if (typeof productForm[key] === 'boolean') {
      productForm[key] = false
    } else {
      productForm[key] = ''
    }
  })
  
  // 设置默认值
  productForm.id = null
  productForm.status = 'ONLINE'
  productForm.isPolling = 'WEIGHT'
  productForm.syncOption = 'none'
  productForm.scheduledFeeEnabled = 'NO'
  
  // 清空通道表格数据
  channelTableData.value = []
}

// 新增计算属性，用于格式化供应商通道下拉菜单的选项
const supplierChannelOptions = computed(() => {
  return testChannelList.map(channel => ({
    value: channel.id, // 使用 channel.id 作为 el-option 的 value
    label: `${channel.supplier} | ${channel.channelName} | ${channel.rate}%` // 修改label格式
  }))
})

const formRules = {
  productName: [
    { required: true, message: '请输入支付产品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  productCode: [
    { required: true, message: '请输入支付产品编码', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  channelCode: [
    { required: true, type: 'array', message: '请选择供应商通道', trigger: 'change' }
  ],
  feeRate: [
    { required: true, message: '请输入商户费率', trigger: 'blur' }
  ],
  scheduledFeeTime: [
    { required: true, message: '请选择费率变更生效时间', trigger: 'change' }
  ],
  effectiveTime: [
    { required: false, message: '请选择生效时间', trigger: 'change' }
  ],
  superPassword: [
    { required: true, message: '请输入超级密码', trigger: 'blur', validator: (rule, value, callback) => {
      if (formType.value === 'edit' && productForm.syncOption !== 'none' && !value) {
        callback(new Error('请输入超级密码'))
      } else {
        callback()
      }
    }}
  ]
}

const handleSearch = () => {
  loading.value = true
  
  setTimeout(() => {
    let filteredData = [...tableData.value]
    
    if (searchForm.id) {
      filteredData = filteredData.filter(item => 
        item.id.toString().includes(searchForm.id))
    }
    
    if (searchForm.productName) {
      filteredData = filteredData.filter(item => 
        item.productName.toLowerCase().includes(searchForm.productName.toLowerCase()))
    }
    
    if (searchForm.productCode) {
      filteredData = filteredData.filter(item => 
        item.productCode.toLowerCase().includes(searchForm.productCode.toLowerCase()))
    }
    
    tableData.value = filteredData
    loading.value = false
  }, 500)
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  // 注意：这里可能需要重新获取完整数据，如果 searchForm 是用于前端过滤的话
  // fetchData() // 如果需要重置后重新拉取所有数据，取消此行注释
}

const handleAdd = () => {
  formType.value = 'add'
  resetProductForm() // 使用新的重置函数
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  formType.value = 'edit'
  resetProductForm()
  
  // 填充表单数据
  productForm.id = row.id
  productForm.productName = row.productName
  productForm.productCode = row.productCode
  productForm.feeRate = row.feeRate
  productForm.scheduledFeeEnabled = row.scheduledFeeEnabled
  productForm.scheduledFeeTime = row.scheduledFeeTime
  productForm.status = row.status
  productForm.isPolling = row.isPolling || 'WEIGHT'
  productForm.remark = row.remark
  
  // 处理通道数据
  productForm.channelCode = Array.isArray(row.channelCode) ? [...row.channelCode] : []
  
  // 根据是否有定时功能，设置syncOption的值
  if (row.scheduledFeeEnabled === 'YES' && row.scheduledFeeTime) {
    productForm.syncOption = 'scheduled'
    
    // 修复时间格式问题：确保时间格式正确并包含时分秒
    const dateObj = new Date(row.scheduledFeeTime)
    // 格式化为 YYYY-MM-DD HH:MM:SS
    const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`
    
    productForm.effectiveTime = formattedDate
  } else if (row.syncFeeToMerchant === 'YES') {
    productForm.syncOption = 'immediate'
    productForm.effectiveTime = ''
  } else {
    productForm.syncOption = 'none'
    productForm.effectiveTime = ''
  }
  
  // 更新通道表格数据
  handleChannelChange(productForm.channelCode)
  
  formDialogVisible.value = true
  
  // 更新倒计时的显示（如果有effectiveTime）
  if (productForm.effectiveTime) {
    updateCountdown()
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认要删除支付产品"${row.productName}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现删除逻辑
    loading.value = true
    safeTimeout(() => {
      loading.value = false
      ElMessage.success('删除成功')
    }, 500)
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的支付产品')
    return
  }
  
  ElMessageBox.confirm(
    `确认要删除选中的${selectedRows.value.length}个支付产品吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现批量删除逻辑
    loading.value = true
    safeTimeout(() => {
      loading.value = false
      ElMessage.success('批量删除成功')
    }, 500)
  }).catch(() => {})
}

const handleBatchApprove = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }

  ElMessageBox.confirm(
    `确认要将选中的${selectedRows.value.length}个支付产品开启吗？`,
    '批量开启确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现支付产品一键开启逻辑
    loading.value = true
    safeTimeout(() => {
      // 将选中的记录状态改为开启
      const selectedIds = selectedRows.value.map(row => row.id)
      tableData.value.forEach(item => {
        if (selectedIds.includes(item.id)) {
          item.status = 'ONLINE'
        }
      })
      loading.value = false
      ElMessage.success(`已成功开启${selectedRows.value.length}个支付产品`)
    }, 500)
  }).catch(() => {})
}

const handleBatchReject = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }

  ElMessageBox.confirm(
    `确认要将选中的${selectedRows.value.length}个支付产品关闭吗？`,
    '批量关闭确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现支付产品一键关闭逻辑
    loading.value = true
    safeTimeout(() => {
      // 将选中的记录状态改为关闭
      const selectedIds = selectedRows.value.map(row => row.id)
      tableData.value.forEach(item => {
        if (selectedIds.includes(item.id)) {
          item.status = 'OFFLINE'
        }
      })
      loading.value = false
      ElMessage.success(`已成功关闭${selectedRows.value.length}个支付产品`)
    }, 500)
  }).catch(() => {})
}

const handleBatchRemove = () => {
  ElMessageBox.confirm(
    '确认要将所有下单通道一键关闭吗？',
    '批量关闭确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现下单通道一键关闭逻辑
    loading.value = true
    safeTimeout(() => {
      // 将所有表格数据状态改为关闭
      tableData.value.forEach(item => {
        item.status = 'OFFLINE'
      })
      loading.value = false
      ElMessage.success('已成功关闭所有下单通道')
    }, 500)
  }).catch(() => {})
}

const handleFormSubmit = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.validate()
    
    submitLoading.value = true
    
    // 创建要提交的数据副本
    const submitData = { ...productForm }
    
    // 根据syncOption设置相应的字段
    if (submitData.syncOption === 'none') {
      submitData.syncFeeToMerchant = 'NO'
      submitData.scheduledSyncEnabled = 'NO'
      // 保留effectiveTime，它可能被设置用于模板的生效时间
    } else if (submitData.syncOption === 'immediate') {
      submitData.syncFeeToMerchant = 'YES'
      submitData.scheduledSyncEnabled = 'NO'
      submitData.effectiveTime = '' // 清空生效时间
    } else if (submitData.syncOption === 'scheduled') {
      submitData.syncFeeToMerchant = 'YES'
      submitData.scheduledSyncEnabled = 'YES'
      // effectiveTime已设置
    }
    
    // 更新scheduledFeeEnabled和scheduledFeeTime字段，用于向后兼容
    submitData.scheduledFeeEnabled = 'NO'
    submitData.scheduledFeeTime = ''
    
    // 如果是新增操作
    if (formType.value === 'add') {
      // API调用：创建产品
      console.log('新增产品数据:', submitData)
      // 模拟API调用成功
      setTimeout(() => {
        ElMessage.success('新增支付产品成功')
        formDialogVisible.value = false
        fetchData() // 重新加载表格数据
        submitLoading.value = false
      }, 1000)
    } 
    // 编辑操作
    else {
      // API调用：更新产品
      console.log('更新产品数据:', submitData)
      // 模拟API调用成功
      setTimeout(() => {
        ElMessage.success('更新支付产品成功')
        formDialogVisible.value = false
        
        // 更新表格中对应的行数据，模拟后端更新结果
        const rowIndex = tableData.value.findIndex(row => row.id === submitData.id)
        if (rowIndex !== -1) {
          // 直接更新当前数据
          tableData.value[rowIndex] = {
            ...tableData.value[rowIndex],
            productName: submitData.productName,
            productCode: submitData.productCode,
            feeRate: submitData.feeRate,
            status: submitData.status,
            remark: submitData.remark,
            scheduledFeeEnabled: 'NO',
            scheduledFeeTime: '',
            pendingFeeRate: undefined,
            pendingProductName: undefined,
            pendingProductCode: undefined,
            pendingStatus: undefined
          }
        }
        
        submitLoading.value = false
      }, 1000)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请完善表单信息')
    submitLoading.value = false
  }
}

const handleToggleStatus = (row, val) => {
  // 先恢复到原来的状态，等确认后再修改
  const oldStatus = row.status;
  const newStatus = val;
  // 立即恢复，避免界面上已经切换了
  row.status = oldStatus;
  
  const action = newStatus === 'ONLINE' ? '启用' : '禁用';
  ElMessageBox.confirm(
    `确认要${action}该支付产品吗？`,
    `${action}确认`,
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现状态切换逻辑
    loading.value = true
    safeTimeout(() => {
      // 确认后修改为新状态
      row.status = newStatus
      loading.value = false
      ElMessage.success(`${action}成功`)
    }, 500)
  }).catch(() => {
    // 取消操作，不做任何改变，因为已经恢复到原状态了
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

const handleChannelChange = (selectedChannelIds) => {
  const newChannelTableData = [];
  if (selectedChannelIds && selectedChannelIds.length > 0) {
    selectedChannelIds.forEach(id => {
      const channelFromList = testChannelList.find(c => c.id === id);
      if (channelFromList) {
        // 尝试从旧的 channelTableData 中查找是否已存在该通道，以保留权重
        const existingChannelInTable = channelTableData.value.find(tc => tc.id === id);
        newChannelTableData.push({
          id: channelFromList.id, // 添加id到表格行数据中
          channelName: channelFromList.channelName,
          channelCode: channelFromList.channelCode,
          channelFeeRate: channelFromList.rate, // 使用真实的费率
          weight: existingChannelInTable ? existingChannelInTable.weight : 10 // 保留权重或默认10
        });
      }
    });
  }
  channelTableData.value = newChannelTableData;
}

// 获取安全定时器
const { safeTimeout } = useCleanup()

// 新增计算属性：是否已过生效时间
const isEffectiveTimeExpired = computed(() => {
  if (!productForm.effectiveTime) return false
  
  const now = new Date()
  const effectiveDate = new Date(productForm.effectiveTime)
  
  return effectiveDate < now // 使用小于而不是小于等于，避免刚刚好的时间也显示为已过期
})

// 新增：倒计时相关
const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

// 新增计算属性：格式化倒计时显示
const formattedCountdown = computed(() => {
  const { days, hours, minutes, seconds } = countdown.value
  return `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`
})

const countdownTimer = ref(null)

// 新增：更新倒计时
const updateCountdown = () => {
  if (!productForm.effectiveTime) return
  
  const effectiveDate = new Date(productForm.effectiveTime)
  const now = new Date()
  
  if (effectiveDate <= now) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }
  
  const diff = effectiveDate - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  countdown.value = { days, hours, minutes, seconds }
}

// 处理同步选项变更
const handleSyncOptionChange = (value) => {
  if (value === 'immediate' && productForm.effectiveTime) {
    ElMessageBox.confirm(
      '切换为立即同步将取消定时任务，是否继续？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      productForm.effectiveTime = ''
    }).catch(() => {
      productForm.syncOption = 'scheduled'
    })
  }
}

// 初始化获取数据
onMounted(() => {
  fetchData()
  updateCountdown()
  countdownTimer.value = setInterval(updateCountdown, 1000)
})

// 获取数据
const fetchData = () => {
  loading.value = true
  
  safeTimeout(() => {
    loading.value = false
  }, 500)
}

// 导出数据
const handleExport = () => {
  // 准备导出数据
  const exportData = tableData.value.map(item => {
    const exportItem = { ...item };
    return exportItem;
  });
  
  // 实际项目中这里可能需要调用API进行导出
  console.log('导出数据:', exportData);
  ElMessage.success('数据导出成功');
}

// 组件销毁前清除定时器
onBeforeUnmount(() => {
  // 清除倒计时定时器
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
})

// 查看弹窗相关变量
const viewDialogVisible = ref(false)
const viewForm = reactive({
  id: null,
  productName: '',
  productCode: '',
  channelCode: [],
  feeRate: 0,
  feeRateDisplay: '', // 添加用于显示的费率字段
  status: 'ONLINE',
  isPolling: 'WEIGHT',
  remark: ''
})
const viewChannelTableData = ref([])

// 查看支付产品
const handleView = (row) => {
  // 重置表单
  Object.keys(viewForm).forEach(key => {
    if (Array.isArray(viewForm[key])) {
      viewForm[key] = []
    } else if (typeof viewForm[key] === 'number') {
      viewForm[key] = 0
    } else {
      viewForm[key] = ''
    }
  })
  
  // 填充表单数据
  viewForm.id = row.id
  viewForm.productName = row.productName
  viewForm.productCode = row.productCode
  viewForm.feeRate = parseFloat(row.feeRate)
  // 设置当前生效的商户费率显示 - 确保显示正确的数字
  viewForm.feeRateDisplay = row.feeRate !== undefined && row.feeRate !== null ? `${row.feeRate}%` : '0%'
  
  // 输出日志以便调试
  console.log(`查看产品ID ${row.id}，费率: ${row.feeRate}，显示：${viewForm.feeRateDisplay}`)
  
  viewForm.status = row.status
  viewForm.isPolling = row.isPolling || 'WEIGHT'
  viewForm.remark = row.remark
  
  // 处理通道数据
  viewForm.channelCode = Array.isArray(row.channelCode) ? [...row.channelCode] : []
  
  // 更新通道表格数据
  updateViewChannelTable(viewForm.channelCode)
  
  viewDialogVisible.value = true
}

// 更新查看通道表格
const updateViewChannelTable = (selectedChannelIds) => {
  const newChannelTableData = []
  if (selectedChannelIds && selectedChannelIds.length > 0) {
    selectedChannelIds.forEach(id => {
      // 使用测试通道列表
      const channelFromList = testChannelList.find(c => c.id === id)
      if (channelFromList) {
        newChannelTableData.push({
          id: channelFromList.id,
          channelName: channelFromList.channelName,
          channelCode: channelFromList.channelCode,
          channelFeeRate: channelFromList.rate,
          weight: 10
        })
      }
    })
  }
  viewChannelTableData.value = newChannelTableData
}
</script>

<style scoped>
.payment-product {
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
  align-items: center;
  flex-wrap: wrap;
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

.fee-rate {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.product-form .el-form-item {
  margin-bottom: 20px;
}

.fee-rate-input {
  position: relative;
  display: flex;
  align-items: center;
}

.fee-rate-suffix {
  margin-left: 3px;
  color: #606266;
  font-size: 14px;
}

.channel-table-container {
  margin-left: -140px; /* 与 label-width 对应，使表格左侧与表单项文字对齐 */
  width: calc(100% + 140px); /* 确保表格宽度仍然是100% */
}

.fee-rate-change {
  display: inline-flex;
  align-items: center;
}

.timer-icon {
  margin-right: 4px;
}

.arrow-icon {
  margin: 0 4px;
}

.pending-rate {
  color: #E6A23C;
  font-weight: bold;
}

.fee-rate-tag {
  margin-top: 4px;
  margin-right: 4px;
}

.time-tag {
  margin-top: 4px;
}

.current-fee-rate {
  font-weight: 500;
}

.scheduled-time {
  font-size: 12px;
  color: #E6A23C;
  display: block;
  margin-top: 3px;
}

.fee-rate-container {
  display: flex;
  flex-direction: column;
}

.current-fee, .pending-fee {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  line-height: 1.5;
}

.pending-fee {
  margin-top: 4px;
}

.fee-label {
  color: #909399;
  margin-right: 4px;
  font-size: 13px;
}

.fee-value {
  font-weight: 500;
  color: #303133;
}

.fee-value.pending {
  color: #E6A23C;
  font-weight: bold;
}

.effective-time {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  margin-left: 4px;
}

.effective-time .el-icon {
  margin-right: 4px;
  font-size: 12px;
}

.countdown-text {
  vertical-align: middle;
  font-size: 12px;
}

.field-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pending-value {
  font-size: 12px;
  color: #E6A23C;
  line-height: 1.2;
}

.pending-text {
  color: #E6A23C;
  font-weight: 500;
}

.countdown-tip {
  margin-left: 8px;
  color: #E6A23C;
  font-size: 12px;
}

.sync-tip {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.pending-value {
  margin-top: 4px;
  display: flex;
  align-items: center;
}

.pending-text {
  font-size: 12px;
  color: #E6A23C;
  margin-right: 4px;
}

.pending-text:before {
  content: "待生效: ";
  color: #909399;
}

.fee-value {
  font-weight: bold;
}

.field-container {
  display: flex;
  flex-direction: column;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  margin-left: 2px;
}

/* 修改一些表单元素的样式 */
.el-radio {
  margin-right: 20px;
}

.el-radio__label {
  font-size: 14px;
}

.el-date-picker {
  width: 240px;
}

.channel-table-container {
  margin-top: 8px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  overflow: hidden;
}
</style> 