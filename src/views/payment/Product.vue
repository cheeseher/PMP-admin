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
        <el-table-column prop="productName" label="支付产品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="productCode" label="支付产品编码" min-width="120" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="ONLINE"
              inactive-value="OFFLINE"
              @change="(val) => handleToggleStatus(scope.row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
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
          <el-select v-model="productForm.channelCode" multiple placeholder="请选择供应商通道" style="width: 100%" @change="handleChannelChange">
            <el-option-group label="未分组">
              <el-option label="通道A" value="ALIPAY" />
              <el-option label="通道B" value="WECHAT" />
              <el-option label="通道C" value="UNIONPAY" />
            </el-option-group>
            <el-option-group label="分组">
              <el-option label="分组A" value="GROUP_1" />
              <el-option label="分组B" value="GROUP_2" />
              <el-option label="分组C" value="GROUP_3" />
            </el-option-group>
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
          <el-select v-model="productForm.isPolling" placeholder="请选择轮询方式" style="width: 100%">
            <el-option label="轮询" value="POLLING" />
            <el-option label="权重" value="WEIGHT" />
          </el-select>
        </el-form-item>
        <el-form-item label="同步费率到商户" prop="syncFeeToMerchant">
          <el-switch
            v-model="productForm.syncFeeToMerchant"
            active-value="YES"
            inactive-value="NO"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="超级密码" prop="superPassword" v-if="formType === 'add'">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Search, Delete, Plus, Edit, Refresh, Check, Close, Remove, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCleanup } from '@/utils/cleanupUtils'

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
    status: 'ONLINE',
    remark: '这是演示产品的备注说明'
  },
  {
    id: 2,
    productName: '支付产品B',
    productCode: 'WECHAT_PAY',
    payType: 'WECHAT',
    feeRate: 0,
    status: 'ONLINE',
    remark: '微信支付通道产品'
  },
  {
    id: 3,
    productName: '支付产品C',
    productCode: 'UNION_PAY',
    payType: 'UNIONPAY',
    feeRate: 0,
    status: 'OFFLINE',
    remark: '银联支付通道产品，暂时下线维护'
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
  productName: '',
  productCode: '',
  channelCode: [],
  feeRate: 0,
  status: 'ONLINE',
  isPolling: 'POLLING',
  syncFeeToMerchant: 'NO',
  superPassword: '',
  remark: ''
})

const submitLoading = ref(false)

const channelTableData = ref([])

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
}

const handleAdd = () => {
  formType.value = 'add'
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  
  productForm.productName = ''
  productForm.productCode = ''
  productForm.channelCode = []
  productForm.feeRate = 0
  productForm.status = 'ONLINE'
  productForm.isPolling = 'POLLING'
  productForm.syncFeeToMerchant = 'NO'
  productForm.superPassword = ''
  productForm.remark = ''
  
  channelTableData.value = []
  
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  formType.value = 'edit'
  Object.keys(productForm).forEach(key => {
    productForm[key] = row[key] || ''
  })
  
  if (productForm.channelCode && productForm.channelCode.length > 0) {
    handleChannelChange(productForm.channelCode);
  }
  
  formDialogVisible.value = true
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

const handleFormSubmit = () => {
  if (!productFormRef.value) return
  
  productFormRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      // TODO: 实现表单提交逻辑
      safeTimeout(() => {
        submitLoading.value = false
        ElMessage.success(formType.value === 'add' ? '添加成功' : '修改成功')
        formDialogVisible.value = false
        fetchData()
      }, 800)
    } else {
      return false
    }
  })
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

const handleChannelChange = (selectedChannels) => {
  // 保留已存在的通道及其设置
  const existingChannels = channelTableData.value.reduce((acc, curr) => {
    acc[curr.channelCode] = curr;
    return acc;
  }, {});
  
  // 定义分组内容
  const groups = {
    GROUP_1: [
      { code: 'ALIPAY_GROUP1', name: '通道A-1' },
      { code: 'WECHAT_GROUP1', name: '通道B-1' }
    ],
    GROUP_2: [
      { code: 'ALIPAY_GROUP2', name: '通道A-2' },
      { code: 'WECHAT_GROUP2', name: '通道B-2' },
      { code: 'JD_GROUP2', name: '通道D' }
    ],
    GROUP_3: [
      { code: 'UNIONPAY_GROUP3', name: '通道C-1' },
      { code: 'BAIDU_GROUP3', name: '通道E' }
    ]
  };
  
  // 处理选择的通道，包括分组
  let processedChannels = [];
  
  selectedChannels.forEach(channel => {
    // 如果是分组，添加该分组下所有通道
    if (channel.startsWith('GROUP_') && groups[channel]) {
      processedChannels = [...processedChannels, ...groups[channel].map(item => ({
        channelCode: item.code,
        channelName: item.name,
        channelFeeRate: 0,
        weight: 1,
        groupCode: channel // 记录所属分组
      }))];
    } else if (!channel.startsWith('GROUP_')) {
      // 如果是单独的通道，直接添加
      let channelName = '';
      if (channel === 'ALIPAY') channelName = '通道A';
      else if (channel === 'WECHAT') channelName = '通道B';
      else if (channel === 'UNIONPAY') channelName = '通道C';
      
      processedChannels.push({
        channelCode: channel,
        channelName,
        channelFeeRate: 0,
        weight: 1
      });
    }
  });
  
  // 更新表格数据，保留已存在的设置
  channelTableData.value = processedChannels.map(channel => {
    if (existingChannels[channel.channelCode]) {
      return {
        ...existingChannels[channel.channelCode],
        groupCode: channel.groupCode
      };
    }
    return channel;
  });
}

// 获取安全定时器
const { safeTimeout } = useCleanup()

// 初始化获取数据
onMounted(() => {
  fetchData()
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
  ElMessage.success('数据导出成功')
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
</style> 