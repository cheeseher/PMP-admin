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
        <el-table-column prop="feeRate" label="商户费率" width="200">
          <template #default="scope">
            <div class="fee-rate-container">
              <div class="current-fee">
                <span class="fee-label">当前费率：</span>
                <span class="fee-value">{{ scope.row.feeRate }}%</span>
              </div>
              
              <div v-if="scope.row.scheduledFeeEnabled === 'YES' && scope.row.pendingFeeRate !== undefined" class="pending-fee">
                <span class="fee-label">定时费率：</span>
                <span class="fee-value pending">{{ scope.row.pendingFeeRate }}%</span>
                <div class="effective-time">
                  <el-icon><timer /></el-icon>
                  <span>{{ getRemainingTimeText(scope.row.scheduledFeeTime) }}生效</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
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
        
        <!-- 修改：改为费率变更定时生效 -->
        <el-form-item label="定时生效" prop="scheduledFeeEnabled" v-if="formType === 'edit'">
          <el-switch
            v-model="productForm.scheduledFeeEnabled"
            active-value="YES"
            inactive-value="NO"
            active-text="启用"
            inactive-text="禁用"
          />
          <div class="form-tip" v-if="productForm.scheduledFeeEnabled === 'YES'">
            启用后，费率变更将在指定时间生效而非立即生效
          </div>
        </el-form-item>
        
        <el-form-item 
          label="生效时间" 
          prop="scheduledFeeTime" 
          v-if="formType === 'edit' && productForm.scheduledFeeEnabled === 'YES'"
        >
          <el-date-picker
            v-model="productForm.scheduledFeeTime"
            type="datetime"
            placeholder="选择费率变更生效时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabledDate="disabledDate"
            style="width: 100%"
          />
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
        <el-form-item label="同步配置到商户" prop="syncFeeToMerchant">
          <el-switch
            v-model="productForm.syncFeeToMerchant"
            active-value="YES"
            inactive-value="NO"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="超级密码" prop="superPassword" v-if="productForm.syncFeeToMerchant === 'YES'">
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
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { Search, Delete, Plus, Edit, Refresh, Check, Close, Remove, Download, Timer, Right, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCleanup } from '@/utils/cleanupUtils'
import { channelList } from '@/data/channelData.js'

const searchForm = reactive({
  id: '',
  productName: '',
  productCode: ''
})

// 获取明天的日期字符串
const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')} ${String(tomorrow.getHours()).padStart(2, '0')}:${String(tomorrow.getMinutes()).padStart(2, '0')}:${String(tomorrow.getSeconds()).padStart(2, '0')}`;
}

const tableData = ref([
  {
    id: 1,
    productName: '支付产品A',
    productCode: '8888',
    payType: 'ALIPAY',
    feeRate: 0,
    scheduledFeeEnabled: 'NO',
    scheduledFeeTime: '',
    status: 'ONLINE',
    remark: '这是演示产品的备注说明'
  },
  {
    id: 2,
    productName: '支付产品B',
    productCode: 'WECHAT_PAY',
    payType: 'WECHAT',
    feeRate: 0.5,
    scheduledFeeEnabled: 'YES',
    scheduledFeeTime: getTomorrowDate(), // 使用明天的日期
    pendingFeeRate: 1.0,
    status: 'ONLINE',
    remark: '微信支付通道产品'
  },
  {
    id: 3,
    productName: '支付产品C',
    productCode: 'UNION_PAY',
    payType: 'UNIONPAY',
    feeRate: 0,
    scheduledFeeEnabled: 'NO',
    scheduledFeeTime: '',
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
  id: null,
  productName: '',
  productCode: '',
  channelCode: [],
  feeRate: 0,
  scheduledFeeEnabled: 'NO',
  scheduledFeeTime: '',
  status: 'ONLINE',
  isPolling: 'POLLING',
  syncFeeToMerchant: 'NO',
  superPassword: '',
  remark: ''
})

const submitLoading = ref(false)

const channelTableData = ref([])

// 新增计算属性，用于格式化供应商通道下拉菜单的选项
const supplierChannelOptions = computed(() => {
  return channelList.map(channel => ({
    value: channel.id, // 使用 channel.id 作为 el-option 的 value
    label: `${channel.supplier} | ${channel.channelName} | ${channel.rate}%` // 修改label格式
  }));
});

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
  superPassword: [
    { required: true, message: '请输入超级密码', trigger: 'blur', validator: (rule, value, callback) => {
      if (productForm.syncFeeToMerchant === 'YES' && !value) {
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
}

const handleAdd = () => {
  formType.value = 'add'
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  
  productForm.id = null;
  productForm.productName = ''
  productForm.productCode = ''
  productForm.channelCode = []
  productForm.feeRate = 0
  productForm.scheduledFeeEnabled = 'NO'
  productForm.scheduledFeeTime = ''
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
  const rowData = { ...row };
  
  // 确保设置ID字段
  productForm.id = rowData.id;
  
  // 为表单赋值
  Object.keys(productForm).forEach(key => {
    if (key in rowData) {
      productForm[key] = rowData[key];
    } else {
      // 如果是编辑但行数据中没有定时费率相关字段，设置默认值
      if (key === 'scheduledFeeEnabled') productForm[key] = 'NO';
      else if (key === 'scheduledFeeTime') productForm[key] = '';
      else productForm[key] = '';
    }
  });
  
  // 如果存在待生效的费率，则填充到表单的费率字段中
  if (rowData.pendingFeeRate !== undefined && rowData.scheduledFeeEnabled === 'YES') {
    productForm.feeRate = rowData.pendingFeeRate;
    productForm.scheduledFeeEnabled = 'YES';
    productForm.scheduledFeeTime = rowData.scheduledFeeTime;
  } else {
    // 默认不启用定时生效
    productForm.scheduledFeeEnabled = 'NO';
    productForm.scheduledFeeTime = '';
  }
  
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
      // 验证定时费率时间是否合法（如果启用）
      if (formType.value === 'edit' && productForm.scheduledFeeEnabled === 'YES') {
        const now = new Date();
        const scheduledTime = new Date(productForm.scheduledFeeTime);
        
        if (scheduledTime <= now) {
          ElMessage.warning('费率变更生效时间必须晚于当前时间');
          return false;
        }
      }
      
      // 验证超级密码
      if (productForm.superPassword !== 'admin123') { // 实际项目中应该使用后端验证
        ElMessage.error('超级密码不正确');
        return false;
      }
      
      submitLoading.value = true
      
      // 模拟提交逻辑
      safeTimeout(() => {
        if (formType.value === 'edit' && productForm.scheduledFeeEnabled === 'YES') {
          // 创建一个待处理的费率变更记录
          const updatedRow = tableData.value.find(item => item.id === productForm.id);
          if (updatedRow) {
            // 存储原始费率
            const originalFeeRate = updatedRow.feeRate;
            // 设置定时生效标志和时间
            updatedRow.scheduledFeeEnabled = 'YES';
            updatedRow.scheduledFeeTime = productForm.scheduledFeeTime;
            // 这里可以添加一个待生效的费率字段，实际项目中可能需要保存到后端
            updatedRow.pendingFeeRate = productForm.feeRate;
            // 不立即修改商户费率，保留原来的费率
            updatedRow.feeRate = originalFeeRate;
            
            console.log('设置定时费率', updatedRow); // 添加调试信息
          } else {
            console.log('未找到要更新的行', productForm.id); // 添加调试信息
          }
        } else {
          // 正常立即更新（新增或者没有启用定时生效的编辑）
          if (formType.value === 'edit') {
            const updatedRow = tableData.value.find(item => item.id === productForm.id);
            if (updatedRow) {
              Object.keys(productForm).forEach(key => {
                if (key in updatedRow) {
                  updatedRow[key] = productForm[key];
                }
              });
              // 清除定时生效标志
              updatedRow.scheduledFeeEnabled = 'NO';
              updatedRow.scheduledFeeTime = '';
              delete updatedRow.pendingFeeRate; // 确保清除待生效费率
            }
          } else {
            // 新增
            const newId = Math.max(...tableData.value.map(item => item.id)) + 1;
            tableData.value.push({
              id: newId,
              ...productForm,
              scheduledFeeEnabled: 'NO',
              scheduledFeeTime: ''
            });
          }
        }
        
        submitLoading.value = false
        ElMessage.success(formType.value === 'add' ? '添加成功' : '修改成功')
        formDialogVisible.value = false
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

const handleChannelChange = (selectedChannelIds) => {
  const newChannelTableData = [];
  if (selectedChannelIds && selectedChannelIds.length > 0) {
    selectedChannelIds.forEach(id => {
      const channelFromList = channelList.find(c => c.id === id);
      if (channelFromList) {
        // 尝试从旧的 channelTableData 中查找是否已存在该通道，以保留权重
        const existingChannelInTable = channelTableData.value.find(tc => tc.id === id);
        newChannelTableData.push({
          id: channelFromList.id, // 添加id到表格行数据中
          channelName: channelFromList.channelName,
          channelCode: channelFromList.channelCode,
          channelFeeRate: channelFromList.rate, // 使用真实的费率
          weight: existingChannelInTable ? existingChannelInTable.weight : 1 // 保留权重或默认1
        });
      }
    });
  }
  channelTableData.value = newChannelTableData;
}

// 获取安全定时器
const { safeTimeout } = useCleanup()

// 初始化获取数据
onMounted(() => {
  fetchData()
  
  // 设置定时检查
  feeRateTimer = setInterval(() => {
    checkScheduledFeeRates();
  }, 60000); // 每分钟检查一次
})

// 获取数据
const fetchData = () => {
  loading.value = true
  // 检查并应用定时费率变更
  checkScheduledFeeRates();
  
  safeTimeout(() => {
    loading.value = false
  }, 500)
}

// 导出数据
const handleExport = () => {
  // 准备导出数据，添加定时费率变更信息
  const exportData = tableData.value.map(item => {
    const exportItem = { ...item };
    if (item.scheduledFeeEnabled === 'YES' && item.pendingFeeRate !== undefined) {
      exportItem.scheduledFeeInfo = `将于${formatScheduledTime(item.scheduledFeeTime)}更新为${item.pendingFeeRate}%`;
    }
    return exportItem;
  });
  
  // 实际项目中这里可能需要调用API进行导出
  console.log('导出数据:', exportData);
  ElMessage.success('数据导出成功');
}

// 新增：禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 格式化定时时间显示
const formatScheduledTime = (timeStr) => {
  if (!timeStr) return '-';
  
  try {
    // 如果是真实数据，可以使用日期格式化库来处理
    // 这里只做简单处理，实际项目中建议使用dayjs或date-fns等库
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (e) {
    return timeStr;
  }
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
        item.feeRate = item.pendingFeeRate;
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

// 组件销毁前清除定时器
onBeforeUnmount(() => {
  if (feeRateTimer) {
    clearInterval(feeRateTimer);
    feeRateTimer = null;
  }
})
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
</style> 