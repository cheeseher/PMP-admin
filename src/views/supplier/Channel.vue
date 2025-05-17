<!-- 供应商管理/供应商通道列表 - 管理供应商通道信息 -->
<template>
  <div class="supplier-channel-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="供应商通道ID：">
            <el-input v-model="searchForm.id" placeholder="请输入供应商通道ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="通道名称：">
            <el-input v-model="searchForm.channelName" placeholder="请输入通道名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="通道编码：">
            <el-input v-model="searchForm.channelCode" placeholder="请输入通道编码" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="分组：">
            <el-select v-model="searchForm.category" placeholder="请选择分组" style="width: 168px" clearable>
              <el-option label="全部" value="" />
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态：">
            <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 120px" clearable>
              <el-option label="全部" value="" />
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </el-form-item>
        </div>
        
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button type="warning" :icon="SetUp" :disabled="selectedRows.length === 0" @click="handleBatchSetCategory">批量设置分组</el-button>
          <el-button type="danger" :icon="Delete" :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="fetchData" />
          </el-tooltip>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="供应商通道ID" prop="id" width="120" align="center" />
        <el-table-column label="通道名称" min-width="120">
          <template #default="scope">
            {{ scope.row.supplier }}|{{ scope.row.channelName }}
          </template>
        </el-table-column>
        <el-table-column label="通道编码" prop="channelCode" width="100" align="center" />
        <el-table-column label="通道费率" width="200" align="right">
          <template #default="scope">
            <div class="fee-rate-container">
              <div class="current-fee">
                <span class="fee-label">当前费率：</span>
                <span class="fee-value">{{ scope.row.rate.toFixed(2) }}%</span>
              </div>
              
              <div v-if="scope.row.scheduledFeeEnabled === 'YES' && scope.row.pendingFeeRate !== undefined" class="pending-fee">
                <span class="fee-label">定时费率：</span>
                <span class="fee-value pending">{{ scope.row.pendingFeeRate.toFixed(2) }}%</span>
                <div class="effective-time">
                  <el-icon><timer /></el-icon>
                  <span>{{ getRemainingTimeText(scope.row.scheduledFeeTime) }}生效</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="交易金额区间" width="180" align="right">
          <template #default="scope">
            <div class="amount-range">
              <span>{{ scope.row.minAmount ? formatAmount(scope.row.minAmount) : '0.00' }} - </span>
              <span>{{ scope.row.maxAmount ? formatAmount(scope.row.maxAmount) : '不限' }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="渠道名称" prop="supplier" min-width="120" />
        <el-table-column label="支付类型" prop="payType" width="100" align="center" />
        <el-table-column label="分组" prop="category" width="100" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enabled"
              @change="(val) => handleStatusChange(scope.row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              link
              :icon="EditPen"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="primary"
              link
              :icon="DocumentCopy"
              @click="handlePullOrder(scope.row)"
            >
              拉单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加通道' : '编辑通道'"
      v-model="dialogVisible"
      width="550px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="channelForm"
        :rules="rules"
        label-width="120px"
        class="channel-form"
      >
        <el-form-item label="通道名称" prop="channelName">
          <el-input v-model="channelForm.channelName" placeholder="请输入通道名称" />
        </el-form-item>
        <el-form-item label="通道编码" prop="channelCode">
          <el-input v-model="channelForm.channelCode" placeholder="请输入通道编码" />
        </el-form-item>
        <el-form-item label="通道费率" prop="rate">
          <div class="rate-input-group">
            <el-input-number 
              v-model="channelForm.rate" 
              :precision="2" 
              :step="0.1" 
              :min="0"
              style="width: calc(100% - 30px)"
            />
            <div class="rate-addon">%</div>
          </div>
        </el-form-item>
        <el-form-item label="定时生效" prop="scheduledFeeEnabled" v-if="dialogType === 'edit'">
          <el-switch
            v-model="channelForm.scheduledFeeEnabled"
            active-value="YES"
            inactive-value="NO"
            active-text="启用"
            inactive-text="禁用"
          />
          <div class="form-tip" v-if="channelForm.scheduledFeeEnabled === 'YES'">
            启用后，费率变更将在指定时间生效而非立即生效
          </div>
        </el-form-item>
        
        <el-form-item 
          label="生效时间" 
          prop="scheduledFeeTime" 
          v-if="dialogType === 'edit' && channelForm.scheduledFeeEnabled === 'YES'"
        >
          <el-date-picker
            v-model="channelForm.scheduledFeeTime"
            type="datetime"
            placeholder="选择费率变更生效时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabledDate="disabledDate"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="渠道名称" prop="supplier">
          <el-select v-model="channelForm.supplier" placeholder="请选择渠道" clearable style="width: 100%" filterable>
            <el-option
              v-for="item in supplierOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付类型" prop="payType">
          <el-select v-model="channelForm.payType" placeholder="请选择支付类型" clearable style="width: 100%">
            <el-option
              v-for="item in payTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单笔最小金额" prop="minAmount">
          <el-input-number 
            v-model="channelForm.minAmount" 
            :precision="2" 
            :step="100" 
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="单笔最大金额" prop="maxAmount">
          <el-input-number 
            v-model="channelForm.maxAmount" 
            :precision="2" 
            :step="1000" 
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="channelForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入备注信息"
          />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-switch
            v-model="channelForm.enabled"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量设置分组对话框 -->
    <el-dialog
      title="批量设置分组"
      v-model="batchCategoryDialogVisible"
      width="450px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="batchCategoryFormRef"
        :model="batchCategoryForm"
        label-width="120px"
      >
        <el-form-item label="自定义分组" prop="category">
          <el-input 
            v-model="batchCategoryForm.category" 
            placeholder="请输入自定义分组名称"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchCategoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitBatchCategory">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 拉单测试对话框 -->
    <el-dialog
      title="拉单测试"
      v-model="pullOrderDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="pullOrderFormRef"
        :model="pullOrderForm"
        :rules="pullOrderRules"
        label-width="100px"
      >
        <el-form-item label="拉单金额" prop="amount">
          <el-input-number
            v-model="pullOrderForm.amount"
            :precision="2"
            :step="100"
            :min="currentChannel?.minAmount || 0"
            :max="currentChannel?.maxAmount || 50000"
            style="width: 100%"
          />
        </el-form-item>
        
        <div v-if="pullOrderResult" class="pull-order-result">
          <div v-if="pullOrderLoading" class="loading-text">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在获取支付链接...</span>
          </div>
          <div v-else class="result-link">{{ pullOrderResult }}</div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="pullOrderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitPullOrder" :loading="pullOrderLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { Search, Refresh, Plus, Check, Close, EditPen, DocumentCopy, SetUp, Delete, Download, Timer, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { channelList, payTypeOptions, categoryOptions } from '@/data/channelData'
import { supplierList } from '@/data/supplierData'

// 格式化金额显示
const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '-'
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 搜索表单
const searchForm = reactive({
  id: '',
  channelName: '',
  channelCode: '',
  category: '',
  status: ''
})

// 表格数据相关
const tableData = ref([])
const tableLoading = ref(false)
const selectedRows = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const formRef = ref(null)
const channelForm = reactive({
  id: '',
  channelName: '',
  channelCode: '',
  rate: 6.00,
  supplier: '',
  payType: '',
  category: '',
  minAmount: 0.00,
  maxAmount: 50000.00,
  remark: '',
  enabled: true,
  scheduledFeeEnabled: 'NO',
  scheduledFeeTime: '',
  pendingFeeRate: undefined
})

// 批量设置分组相关
const batchCategoryDialogVisible = ref(false)
const batchCategoryFormRef = ref(null)
const batchCategoryForm = reactive({
  category: ''
})

// 拉单测试相关
const pullOrderDialogVisible = ref(false)
const pullOrderFormRef = ref(null)
const currentChannel = ref(null)
const pullOrderLoading = ref(false)
const pullOrderResult = ref('')

const pullOrderForm = reactive({
  amount: 100.00
})

const pullOrderRules = {
  amount: [
    { required: true, message: '请输入拉单金额', trigger: 'blur' },
    { type: 'number', message: '金额必须为数字', trigger: 'blur' }
  ]
}

// 表单验证规则
const rules = {
  channelName: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
  channelCode: [{ required: true, message: '请输入通道编码', trigger: 'blur' }],
  rate: [{ required: true, message: '请输入通道费率', trigger: 'blur' }],
  supplier: [{ required: true, message: '请选择渠道', trigger: 'change' }],
  payType: [{ required: true, message: '请选择支付类型', trigger: 'change' }],
  minAmount: [{ required: true, message: '请输入单笔最小金额', trigger: 'blur' }],
  maxAmount: [{ required: true, message: '请输入单笔最大金额', trigger: 'blur' }],
  scheduledFeeTime: [
    { required: true, message: '请选择费率变更生效时间', trigger: 'change' }
  ]
}

// 上游选项
const supplierOptions = computed(() => {
  return supplierList.map(item => ({
    label: item.supplier,
    value: item.supplier,
    code: item.code
  }))
})

// 监听上游变化，自动填充上游编码
watch(() => channelForm.supplier, (newVal) => {
  if (newVal) {
    const selectedSupplier = supplierOptions.value.find(item => item.value === newVal)
    channelForm.supplierCode = selectedSupplier ? selectedSupplier.code : ''
  } else {
    channelForm.supplierCode = ''
  }
})

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 计算剩余时间文本
const getRemainingTimeText = (scheduledTime) => {
  if (!scheduledTime) return '时间未设置';
  
  const targetTime = new Date(scheduledTime).getTime();
  const now = Date.now();
  
  // 如果已经过了生效时间
  if (now >= targetTime) {
    return '已生效';
  }
  
  // 计算剩余时间
  const diffMs = targetTime - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays}天${diffHours}小时后`;
  } else if (diffHours > 0) {
    return `${diffHours}小时${diffMinutes}分钟后`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟后`;
  } else {
    return `即将`;
  }
}

// 获取数据
const fetchData = () => {
  tableLoading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    let filteredData = [...channelList]
    
    if (searchForm.id) {
      filteredData = filteredData.filter(item => 
        item.id.toString().includes(searchForm.id))
    }
    
    if (searchForm.channelName) {
      filteredData = filteredData.filter(item => 
        item.channelName.includes(searchForm.channelName))
    }
    
    if (searchForm.channelCode) {
      filteredData = filteredData.filter(item => 
        item.channelCode.includes(searchForm.channelCode))
    }
    
    if (searchForm.category) {
      filteredData = filteredData.filter(item => item.category === searchForm.category)
    }
    
    if (searchForm.status !== '') {
      filteredData = filteredData.filter(item => item.enabled === (searchForm.status === true || searchForm.status === 'true'))
    }
    
    tableData.value = filteredData
    total.value = filteredData.length
    
    tableLoading.value = false
  }, 300)
}

// 搜索方法
const handleSearch = () => {
  fetchData()
}

// 重置搜索条件
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  fetchData()
}

// 添加通道
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑通道
const handleEdit = (row) => {
  dialogType.value = 'edit'
  resetForm()
  
  // 填充表单数据
  Object.keys(channelForm).forEach(key => {
    if (key in row) {
      channelForm[key] = row[key]
    }
  })
  
  // 如果存在待生效的费率，则填充到表单的费率字段中
  if (row.pendingFeeRate !== undefined && row.scheduledFeeEnabled === 'YES') {
    channelForm.rate = row.pendingFeeRate;
    channelForm.scheduledFeeEnabled = 'YES';
    channelForm.scheduledFeeTime = row.scheduledFeeTime;
  } else {
    // 默认不启用定时生效
    channelForm.scheduledFeeEnabled = 'NO';
    channelForm.scheduledFeeTime = '';
  }
  
  dialogVisible.value = true
}

// 状态切换处理
const handleStatusChange = (row, newValue) => {
  const action = newValue ? '启用' : '禁用'
  
  ElMessageBox.confirm(
    `确认${action}通道 "${row.channelName}"?`,
    `${action}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟API调用
    ElMessage.success(`${action}成功`)
  }).catch(() => {
    // 取消操作，恢复原状态
    row.enabled = !newValue
    ElMessage.info('已取消操作')
  })
}

// 拉单处理
const handlePullOrder = (row) => {
  currentChannel.value = row
  pullOrderForm.amount = row.minAmount > 0 ? row.minAmount : 100.00
  pullOrderResult.value = '' // 重置结果
  pullOrderDialogVisible.value = true
}

// 提交拉单测试
const handleSubmitPullOrder = () => {
  pullOrderFormRef.value.validate((valid) => {
    if (valid) {
      const channelName = currentChannel.value.channelName
      const amount = pullOrderForm.amount
      
      ElMessageBox.confirm(
        `确认通过通道 "${channelName}" 拉取金额为 ${amount.toFixed(2)} 元的订单?`,
        '拉单确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        // 开始加载
        pullOrderLoading.value = true
        pullOrderResult.value = ''
        
        // 模拟API调用
        setTimeout(() => {
          pullOrderLoading.value = false
          pullOrderResult.value = 'https://pay.example.com/order/123456789?amount=100.00&channel=test'
        }, 1500)
      }).catch(() => {
        ElMessage.info('已取消操作')
      })
    }
  })
}

// 批量设置分组
const handleBatchSetCategory = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  batchCategoryForm.category = ''
  batchCategoryDialogVisible.value = true
}

// 提交批量设置分组
const handleSubmitBatchCategory = () => {
  if (!batchCategoryForm.category) {
    ElMessage.warning('请输入自定义分组名称')
    return
  }
  
  ElMessageBox.confirm(
    `确认将选中的 ${selectedRows.value.length} 条记录的分组设置为 "${batchCategoryForm.category}"?`,
    '批量设置分组',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟API调用
    const ids = selectedRows.value.map(item => item.id)
    tableData.value.forEach(item => {
      if (ids.includes(item.id)) {
        item.category = batchCategoryForm.category
      }
    })
    ElMessage.success(`批量设置分组成功`)
    batchCategoryDialogVisible.value = false
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessageBox.confirm(
    `确认删除已选中的 ${selectedRows.value.length} 条记录? 此操作不可恢复!`,
    '批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger',
    }
  ).then(() => {
    // 模拟API调用
    const ids = selectedRows.value.map(item => item.id)
    tableData.value = tableData.value.filter(item => !ids.includes(item.id))
    total.value = tableData.value.length
    ElMessage.success(`批量删除成功`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 导出数据
const handleExport = () => {
  ElMessage.success('供应商通道数据导出成功')
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置为默认值
  Object.assign(channelForm, {
    id: '',
    channelName: '',
    channelCode: '',
    rate: 6.00,
    supplier: '',
    payType: '',
    category: '',
    minAmount: 0.00,
    maxAmount: 50000.00,
    remark: '',
    enabled: true,
    scheduledFeeEnabled: 'NO',
    scheduledFeeTime: '',
    pendingFeeRate: undefined
  })
}

// 提交表单
const handleSubmitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 验证定时费率时间是否合法（如果启用）
      if (dialogType.value === 'edit' && channelForm.scheduledFeeEnabled === 'YES') {
        const now = new Date();
        const scheduledTime = new Date(channelForm.scheduledFeeTime);
        
        if (scheduledTime <= now) {
          ElMessage.warning('费率变更生效时间必须晚于当前时间');
          return false;
        }
      }
      
      if (dialogType.value === 'add') {
        // 添加操作
        const newId = Math.max(...tableData.value.map(item => item.id), 0) + 1
        const newChannel = {
          ...channelForm,
          id: newId
        }
        tableData.value.push(newChannel)
        ElMessage.success('添加成功')
      } else {
        // 编辑操作
        const index = tableData.value.findIndex(item => item.id === channelForm.id)
        if (index !== -1) {
          if (channelForm.scheduledFeeEnabled === 'YES') {
            // 保存原始费率
            const originalRate = tableData.value[index].rate;
            // 设置定时生效信息
            tableData.value[index] = {
              ...channelForm,
              rate: originalRate, // 保持原始费率不变
              pendingFeeRate: channelForm.rate, // 设置待生效费率
              scheduledFeeEnabled: 'YES',
              scheduledFeeTime: channelForm.scheduledFeeTime
            };
          } else {
            // 立即生效
            tableData.value[index] = {
              ...channelForm,
              scheduledFeeEnabled: 'NO',
              scheduledFeeTime: '',
              pendingFeeRate: undefined // 移除待生效费率
            };
          }
          ElMessage.success('更新成功')
        }
      }
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

// 每页条数改变
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchData()
}

// 页码改变
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchData()
}

// 表格选择变化处理
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
  
  // 设置定时检查
  feeRateTimer = setInterval(() => {
    checkScheduledFeeRates();
  }, 60000); // 每分钟检查一次
})

// 组件销毁前清除定时器
onBeforeUnmount(() => {
  if (feeRateTimer) {
    clearInterval(feeRateTimer);
    feeRateTimer = null;
  }
})

// 检查是否有定时费率需要生效
const checkScheduledFeeRates = () => {
  const now = new Date();
  let hasUpdates = false;
  
  tableData.value.forEach(item => {
    if (item.scheduledFeeEnabled === 'YES' && item.scheduledFeeTime && item.pendingFeeRate !== undefined) {
      const scheduledTime = new Date(item.scheduledFeeTime);
      
      // 如果已到达或超过设定时间，应用新费率
      if (now >= scheduledTime) {
        // 更新费率
        item.rate = item.pendingFeeRate;
        // 禁用定时费率设置（避免重复应用）
        item.scheduledFeeEnabled = 'NO';
        item.scheduledFeeTime = '';
        // 清除待生效费率
        delete item.pendingFeeRate;
        hasUpdates = true;
      }
    }
  });
  
  // 如果有更新，提示用户
  if (hasUpdates) {
    ElMessage.success('系统已自动应用定时费率变更');
  }
}

// 设置定时器，每分钟检查一次是否有定时费率需要生效
let feeRateTimer = null;
</script>

<style scoped>
.supplier-channel-container {
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

.rate-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.channel-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}

.rate-input-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.rate-addon {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.pull-order-result {
  margin-top: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.loading-text {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.loading-text .el-icon {
  margin-right: 8px;
}

.result-link {
  word-break: break-all;
  color: #409EFF;
  font-size: 14px;
  line-height: 1.4;
  font-family: monospace;
}
</style> 