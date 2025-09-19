<!-- 代付配置/代付产品管理 - 管理系统支持的代付产品 -->
<template>
  <div class="payout-product">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="ID：">
            <el-input v-model="searchForm.id" placeholder="请输入" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="产品：">
            <el-input v-model="searchForm.productName" placeholder="请输入" style="width: 168px" clearable />
          </el-form-item>
        </div>
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAdd">新增代付产品</el-button>
          <el-button @click="handleExport">导出</el-button>
          <el-dropdown v-if="selectedRows.length > 0" @command="handleBatchAction">
            <el-button type="warning">
              批量操作({{ selectedRows.length }}) <el-icon><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="enable">批量启用</el-dropdown-item>
                <el-dropdown-item command="disable">批量禁用</el-dropdown-item>
                <el-dropdown-item command="delete" divided>批量删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <el-table 
        :data="tableData" 
        border 
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productName" label="产品名称" width="150" />
        <el-table-column prop="productCode" label="产品编码" width="120" />
        <el-table-column label="费率" width="120">
          <template #default="{ row }">
            {{ row.rateType === 'percentage' ? row.rate + '%' : row.rate + '元' }}
          </template>
        </el-table-column>
        <el-table-column label="金额范围" width="180">
          <template #default="{ row }">
            {{ row.minAmount }}元 - {{ row.maxAmount }}元
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ENABLED' ? 'success' : 'danger'">
              {{ row.status === 'ENABLED' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formType === 'view' ? {} : rules"
        label-width="120px"
      >
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入产品名称" :disabled="formType === 'view'" />
        </el-form-item>
        <el-form-item label="产品编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入产品编码" :disabled="formType === 'view'" />
        </el-form-item>
        <el-form-item label="通道代码" prop="channelCode">
          <el-select v-model="form.channelCode" placeholder="请选择通道代码" style="width: 100%" :disabled="formType === 'view'">
            <el-option label="BANK_A" value="BANK_A" />
            <el-option label="BANK_B" value="BANK_B" />
            <el-option label="BANK_C" value="BANK_C" />
            <el-option label="ALIPAY" value="ALIPAY" />
            <el-option label="WECHAT" value="WECHAT" />
          </el-select>
        </el-form-item>
        <el-form-item label="费率类型" prop="rateType">
          <el-radio-group v-model="form.rateType" :disabled="formType === 'view'">
            <el-radio label="fixed">固定费率</el-radio>
            <el-radio label="percentage">百分比费率</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="费率值" prop="rate">
          <el-input v-model="form.rate" placeholder="请输入费率值" :disabled="formType === 'view'">
            <template #append>{{ form.rateType === 'percentage' ? '%' : '元' }}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="最小金额" prop="minAmount">
          <el-input v-model="form.minAmount" placeholder="请输入最小金额" :disabled="formType === 'view'">
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="最大金额" prop="maxAmount">
          <el-input v-model="form.maxAmount" placeholder="请输入最大金额" :disabled="formType === 'view'">
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status" :disabled="formType === 'view'">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            :disabled="formType === 'view'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ formType === 'view' ? '关闭' : '取消' }}</el-button>
          <el-button v-if="formType !== 'view'" type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, ArrowDown } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  id: '',
  productName: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 弹窗相关
const dialogVisible = ref(false)
const formType = ref('add') // add | edit
const submitLoading = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  code: '',
  channelCode: '',
  rateType: 'percentage',
  rate: '',
  minAmount: '',
  maxAmount: '',
  status: 1,
  remark: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入产品编码', trigger: 'blur' }
  ],
  channelCode: [
    { required: true, message: '请选择通道代码', trigger: 'change' }
  ],
  rateType: [
    { required: true, message: '请选择费率类型', trigger: 'change' }
  ],
  rate: [
    { required: true, message: '请输入费率值', trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'blur' }
  ],
  minAmount: [
    { required: true, message: '请输入最小金额', trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的金额', trigger: 'blur' }
  ],
  maxAmount: [
    { required: true, message: '请输入最大金额', trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的金额', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  if (formType.value === 'view') return '查看代付产品'
  return formType.value === 'edit' ? '编辑代付产品' : '新增代付产品'
})

// 模拟数据
const mockData = [
  {
    id: 1,
    productName: '代付',
    productCode: '10086',
    rateType: 'percentage',
    rate: '0.5',
    minAmount: '100',
    maxAmount: '50000',
    status: 'ENABLED',
    remark: '银行卡代付产品'
  },
  {
    id: 2,
    productName: '代付产品A',
    productCode: 'PAYOUT_A',
    rateType: 'percentage',
    rate: '0.8',
    minAmount: '200',
    maxAmount: '100000',
    status: 'ENABLED',
    remark: '支付宝代付通道'
  },
  {
    id: 3,
    productName: '代付产品B',
    productCode: 'PAYOUT_B',
    rateType: 'fixed',
    rate: '5',
    minAmount: '50',
    maxAmount: '20000',
    status: 'DISABLED',
    remark: '微信代付通道'
  },
  {
    id: 4,
    productName: '代付产品C',
    productCode: 'PAYOUT_C',
    rateType: 'percentage',
    rate: '0.6',
    minAmount: '10',
    maxAmount: '30000',
    status: 'ENABLED',
    remark: '银联代付通道'
  },
  {
    id: 5,
    productName: '代付产品D',
    productCode: 'PAYOUT_D',
    rateType: 'percentage',
    rate: '1.2',
    minAmount: '500',
    maxAmount: '200000',
    status: 'ENABLED',
    remark: '综合代付通道'
  }
]

// 初始化数据
const initData = () => {
  tableData.value = [...mockData]
  total.value = mockData.length
}

// 搜索
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = [...mockData]
    
    if (searchForm.id) {
      filteredData = filteredData.filter(item => 
        item.id.toString().includes(searchForm.id)
      )
    }
    
    if (searchForm.productName) {
      filteredData = filteredData.filter(item => 
        item.productName.includes(searchForm.productName)
      )
    }
    
    tableData.value = filteredData
    total.value = filteredData.length
    loading.value = false
  }, 500)
}

// 重置
const handleReset = () => {
  searchForm.id = ''
  searchForm.productName = ''
  initData()
}

// 新增
const handleAdd = () => {
  formType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 查看详情
const handleView = (row) => {
  formType.value = 'view'
  Object.assign(form, {
    id: row.id,
    name: row.productName,
    code: row.productCode,
    channelCode: 'BANK_A',
    rateType: row.rateType,
    rate: row.rate,
    minAmount: row.minAmount,
    maxAmount: row.maxAmount,
    status: row.status === 'ENABLED' ? 1 : 0,
    remark: row.remark
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  formType.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.productName,
    code: row.productCode,
    channelCode: 'BANK_A',
    rateType: row.rateType,
    rate: row.rate,
    minAmount: row.minAmount,
    maxAmount: row.maxAmount,
    status: row.status === 'ENABLED' ? 1 : 0,
    remark: row.remark
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除代付产品"${row.productName}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      total.value = tableData.value.length
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 批量操作
const handleBatchAction = (command) => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要操作的数据')
    return
  }

  const selectedIds = selectedRows.value.map(row => row.id)
  const actionText = {
    enable: '启用',
    disable: '禁用',
    delete: '删除'
  }

  ElMessageBox.confirm(
    `确定要${actionText[command]}选中的 ${selectedRows.value.length} 条记录吗？`,
    '批量操作确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    if (command === 'delete') {
      // 批量删除
      tableData.value = tableData.value.filter(item => !selectedIds.includes(item.id))
      total.value = tableData.value.length
      ElMessage.success(`成功删除 ${selectedRows.value.length} 条记录`)
    } else {
      // 批量启用/禁用
      const newStatus = command === 'enable' ? 'ENABLED' : 'DISABLED'
      tableData.value.forEach(item => {
        if (selectedIds.includes(item.id)) {
          item.status = newStatus
        }
      })
      ElMessage.success(`成功${actionText[command]} ${selectedRows.value.length} 条记录`)
    }
    selectedRows.value = []
  })
}

// 导出功能
const handleExport = () => {
  const exportData = tableData.value.map(item => ({
    ID: item.id,
    产品名称: item.productName,
    产品编码: item.productCode,
    费率类型: item.rateType === 'percentage' ? '百分比' : '固定',
    费率值: item.rateType === 'percentage' ? `${item.rate}%` : `${item.rate}元`,
    最小金额: `${item.minAmount}元`,
    最大金额: `${item.maxAmount}元`,
    状态: item.status === 'ENABLED' ? '启用' : '禁用',
    备注: item.remark
  }))
  
  // 模拟导出功能
  console.log('导出数据:', exportData)
  ElMessage.success(`成功导出 ${exportData.length} 条记录`)
}

const handleBatchEnable = () => {
  handleBatchAction('enable')
}

const handleBatchDisable = () => {
  handleBatchAction('disable')
}

const handleBatchOrderDisable = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要操作的数据')
    return
  }
  ElMessage.success('下单批量关闭成功')
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  handleSearch()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  handleSearch()
}

// 表单提交
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 验证最大金额大于最小金额
    if (parseFloat(form.maxAmount) <= parseFloat(form.minAmount)) {
      ElMessage.error('最大金额必须大于最小金额')
      return
    }
    
    submitLoading.value = true
    
    // 模拟API调用
    setTimeout(() => {
      if (formType.value === 'add') {
        const newId = Math.max(...tableData.value.map(item => item.id)) + 1
        tableData.value.push({
          id: newId,
          productName: form.name,
          productCode: form.code,
          rateType: form.rateType,
          rate: form.rate,
          minAmount: form.minAmount,
          maxAmount: form.maxAmount,
          status: form.status === 1 ? 'ENABLED' : 'DISABLED',
          remark: form.remark
        })
        ElMessage.success('新增成功')
      } else {
        const index = tableData.value.findIndex(item => item.id === form.id)
        if (index > -1) {
          tableData.value[index] = {
            id: form.id,
            productName: form.name,
            productCode: form.code,
            rateType: form.rateType,
            rate: form.rate,
            minAmount: form.minAmount,
            maxAmount: form.maxAmount,
            status: form.status === 1 ? 'ENABLED' : 'DISABLED',
            remark: form.remark
          }
          ElMessage.success('编辑成功')
        }
      }
      total.value = tableData.value.length
      dialogVisible.value = false
      submitLoading.value = false
    }, 1000)
  } catch (error) {
    console.log('表单验证失败', error)
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    id: null,
    name: '',
    code: '',
    channelCode: '',
    rateType: 'percentage',
    rate: '',
    minAmount: '',
    maxAmount: '',
    status: 1,
    remark: ''
  })
}

// 初始化
onMounted(() => {
  initData()
})
</script>

<style scoped>
.payout-product {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-buttons {
  display: flex;
  gap: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-toolbar .left {
  display: flex;
  gap: 12px;
}

.table-toolbar .right {
  display: flex;
  gap: 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.product-form .fee-unit {
  margin-left: 8px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>