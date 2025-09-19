<template>
  <div class="page-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="ID">
          <el-input 
            v-model="filterForm.id" 
            placeholder="请输入"
            style="width: 168px"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="代付通道名称">
          <el-input 
            v-model="filterForm.channelName" 
            placeholder="请输入"
            style="width: 168px"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="代付通道编码">
          <el-input 
            v-model="filterForm.channelCode" 
            placeholder="请输入"
            style="width: 168px"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="代付上游">
          <el-select 
            v-model="filterForm.upstreamName" 
            placeholder="请选择"
            style="width: 168px"
            clearable
          >
            <el-option label="融通代付" value="融通代付" />
            <el-option label="熊猫代付" value="熊猫代付" />
            <el-option label="流川枫代付" value="流川枫代付" />
            <el-option label="红牛代付" value="红牛代付" />
            <el-option label="KK备付金" value="KK备付金" />
            <el-option label="小草代付" value="小草代付" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="支付类型">
          <el-select 
            v-model="filterForm.paymentType" 
            placeholder="请选择"
            style="width: 168px"
            clearable
          >
            <el-option label="银行卡" value="银行卡" />
            <el-option label="支付宝H5" value="支付宝H5" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分组">
          <el-select 
            v-model="filterForm.group" 
            placeholder="请选择"
            style="width: 168px"
            clearable
          >
            <el-option label="默认分组" value="默认分组" />
            <el-option label="高级分组" value="高级分组" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="启用状态">
          <el-select 
            v-model="filterForm.status" 
            placeholder="请选择"
            style="width: 168px"
            clearable
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          批量删除
        </el-button>
        <el-button @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加通道
        </el-button>
        <el-button @click="handleBatchSetup">
          <el-icon><Setting /></el-icon>
          批量设置分组
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button>
          <el-icon><Grid /></el-icon>
        </el-button>
        <el-button>
          <el-icon><Printer /></el-icon>
        </el-button>
        <el-button>
          <el-icon><Download /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <el-table 
        :data="tableData" 
        border 
        stripe
        v-loading="tableLoading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column 
          prop="id" 
          label="ID" 
          width="80"
          sortable
        />
        
        <el-table-column 
          prop="channelName" 
          label="代付通道名称" 
          min-width="150"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="channelCode" 
          label="代付通道编码" 
          width="140"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="channelRate" 
          label="代付通道费率" 
          width="120"
          align="right"
        >
          <template #default="{ row }">
            {{ row.channelRate }}%
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="fixedFee" 
          label="固费" 
          width="100"
          align="right"
        >
          <template #default="{ row }">
            ¥{{ row.fixedFee }}
          </template>
        </el-table-column>
        
        <el-table-column 
          prop="upstreamName" 
          label="代付上游" 
          width="120"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="upstreamCode" 
          label="代付上游编码" 
          width="140"
          show-overflow-tooltip
        />
        
        <el-table-column 
          prop="paymentType" 
          label="支付类型" 
          width="100"
        />
        
        <el-table-column 
          prop="group" 
          label="分组" 
          width="100"
        />
        
        <el-table-column 
          prop="status" 
          label="启用状态" 
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        
        <el-table-column 
          label="操作" 
          width="150"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="primary" 
              link 
              @click="handlePull(row)"
            >
              拉单
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '编辑通道' : '新增通道'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-form-item label="通道名称" prop="channelName">
          <el-input v-model="editForm.channelName" placeholder="请输入通道名称" />
        </el-form-item>
        
        <el-form-item label="通道编码" prop="channelCode">
          <el-input v-model="editForm.channelCode" placeholder="请输入通道编码" />
        </el-form-item>
        
        <el-form-item label="通道费率" prop="channelRate">
          <el-input-number
            v-model="editForm.channelRate"
            :min="0"
            :max="100"
            :precision="2"
            placeholder="请输入费率"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="固定费用" prop="fixedFee">
          <el-input-number
            v-model="editForm.fixedFee"
            :min="0"
            :precision="2"
            placeholder="请输入固定费用"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="代付上游" prop="upstreamName">
          <el-select v-model="editForm.upstreamName" placeholder="请选择代付上游" style="width: 100%">
            <el-option label="融通代付" value="融通代付" />
            <el-option label="熊猫代付" value="熊猫代付" />
            <el-option label="流川枫代付" value="流川枫代付" />
            <el-option label="红牛代付" value="红牛代付" />
            <el-option label="KK备付金" value="KK备付金" />
            <el-option label="小草代付" value="小草代付" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="上游编码" prop="upstreamCode">
          <el-input v-model="editForm.upstreamCode" placeholder="请输入上游编码" />
        </el-form-item>
        
        <el-form-item label="支付类型" prop="paymentType">
          <el-select v-model="editForm.paymentType" placeholder="请选择支付类型" style="width: 100%">
            <el-option label="银行卡" value="银行卡" />
            <el-option label="支付宝H5" value="支付宝H5" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分组" prop="group">
          <el-select v-model="editForm.group" placeholder="请选择分组" style="width: 100%">
            <el-option label="默认分组" value="默认分组" />
            <el-option label="高级分组" value="高级分组" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="启用状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Setting, Grid, Printer, Download } from '@element-plus/icons-vue'
import { payoutChannelData } from '@/data/payoutChannelData'

// 筛选表单
const filterForm = reactive({
  id: '',
  channelName: '',
  channelCode: '',
  upstreamName: '',
  paymentType: '',
  group: '',
  status: ''
})

// 表格数据
const tableData = ref([])
const tableLoading = ref(false)
const selectedRows = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 编辑弹窗
const editDialogVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({
  id: null,
  channelName: '',
  channelCode: '',
  channelRate: 0,
  fixedFee: 0,
  upstreamName: '',
  upstreamCode: '',
  paymentType: '',
  group: '',
  status: 1
})

// 表单验证规则
const editFormRules = {
  channelName: [
    { required: true, message: '请输入通道名称', trigger: 'blur' }
  ],
  channelCode: [
    { required: true, message: '请输入通道编码', trigger: 'blur' }
  ],
  channelRate: [
    { required: true, message: '请输入通道费率', trigger: 'blur' }
  ],
  upstreamName: [
    { required: true, message: '请选择代付上游', trigger: 'change' }
  ],
  paymentType: [
    { required: true, message: '请选择支付类型', trigger: 'change' }
  ]
}

// 初始化数据
const initData = () => {
  tableLoading.value = true
  setTimeout(() => {
    tableData.value = payoutChannelData.channels
    pagination.total = payoutChannelData.channels.length
    tableLoading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件:', filterForm)
  initData()
}

// 重置
const handleReset = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  initData()
}

// 新增
const handleAdd = () => {
  Object.keys(editForm).forEach(key => {
    if (key === 'status') {
      editForm[key] = 1
    } else if (key === 'channelRate' || key === 'fixedFee') {
      editForm[key] = 0
    } else {
      editForm[key] = key === 'id' ? null : ''
    }
  })
  editDialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  Object.keys(editForm).forEach(key => {
    editForm[key] = row[key]
  })
  editDialogVisible.value = true
}

// 拉单
const handlePull = (row) => {
  ElMessageBox.confirm(
    `确定要对通道"${row.channelName}"执行拉单操作吗？`,
    '确认拉单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('拉单操作成功')
  }).catch(() => {
    ElMessage.info('已取消拉单操作')
  })
}

// 状态切换
const handleStatusChange = (row) => {
  const statusText = row.status === 1 ? '启用' : '禁用'
  ElMessage.success(`通道"${row.channelName}"已${statusText}`)
}

// 批量设置分组
const handleBatchSetup = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要设置的通道')
    return
  }
  ElMessage.info('批量设置分组功能')
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 保存
const handleSave = () => {
  editFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(editForm.id ? '编辑成功' : '新增成功')
      editDialogVisible.value = false
      initData()
    }
  })
}

// 弹窗关闭
const handleDialogClose = () => {
  editFormRef.value?.resetFields()
}

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size
  initData()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  initData()
}

// 组件挂载
onMounted(() => {
  initData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-form .el-form-item {
  margin-bottom: 16px;
  margin-right: 0;
}

.filter-form .el-form-item:last-child {
  margin-left: auto;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.table-card {
  background: white;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>