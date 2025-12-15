<template>
  <div class="page-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="上游ID">
            <el-input 
              v-model="filterForm.upstreamId" 
              placeholder="请输入" 
              style="width: 168px"
              clearable
            />
          </el-form-item>
          <el-form-item label="代付上游名称">
            <el-input 
              v-model="filterForm.upstreamName" 
              placeholder="请输入" 
              style="width: 168px"
              clearable
            />
          </el-form-item>
          <el-form-item label="代付上游编码">
            <el-input 
              v-model="filterForm.upstreamCode" 
              placeholder="请输入" 
              style="width: 168px"
              clearable
            />
          </el-form-item>
          <el-form-item label="商户号">
            <el-input 
              v-model="filterForm.merchantId" 
              placeholder="请输入" 
              style="width: 168px"
              clearable
            />
          </el-form-item>
          <el-form-item label="启用状态">
            <el-select 
              v-model="filterForm.status" 
              placeholder="请选择" 
              style="width: 168px"
              clearable
            >
              <el-option 
                v-for="item in statusOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <div class="filter-buttons">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never">
      <!-- 操作工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">代付上游列表</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table 
      :data="tableData" 
      border 
      stripe 
      v-loading="tableLoading"
      style="width: 100%"
    >
      <el-table-column prop="id" label="代付上游ID" width="120" />
      <el-table-column prop="upstreamName" label="代付上游名称" width="150" />
      <el-table-column prop="upstreamCode" label="代付上游编码" width="150" />
      <el-table-column prop="merchantId" label="商户号" width="150" />
      <el-table-column prop="balance" label="余额" width="120" align="center">
        <template #default="{ row }">
          <span>{{ formatCurrency(row.balance) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="frozenAmount" label="冻结金额" width="120">
        <template #default="{ row }">
          <span>{{ formatAmount(row.frozenAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="alertThreshold" label="提醒阈值" width="120">
        <template #default="{ row }">
          <span>{{ formatAmount(row.alertThreshold) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="启用状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-dropdown @command="(command) => handleOperation(command, row)">
              <el-button type="primary" link>
                操作 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑上游</el-dropdown-item>
                  <el-dropdown-item command="balance">余额操作</el-dropdown-item>
                  <el-dropdown-item command="unfreeze">余额解冻</el-dropdown-item>
                  <el-dropdown-item divided command="delete" style="color: #f56c6c;">删除上游</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="120px">
        <el-form-item label="上游名称" prop="upstreamName">
          <el-input v-model="editForm.upstreamName" placeholder="请输入代付上游名称" />
        </el-form-item>
        <el-form-item label="上游编码" prop="upstreamCode">
          <el-input v-model="editForm.upstreamCode" placeholder="请输入代付上游编码" />
        </el-form-item>
        <el-form-item label="商户号" prop="merchantId">
          <el-input v-model="editForm.merchantId" placeholder="请输入商户号" />
        </el-form-item>
        <el-form-item label="余额" prop="balance">
          <el-input v-model="editForm.balance" placeholder="请输入余额" />
        </el-form-item>
        <el-form-item label="提醒阈值" prop="alertThreshold">
          <el-input v-model="editForm.alertThreshold" placeholder="请输入提醒阈值" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="editForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
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
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import { payoutUpstreamData, statusOptions } from '@/data/payoutUpstreamData'

// 响应式数据
const tableData = ref([])
const tableLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editFormRef = ref()

// 筛选表单
const filterForm = reactive({
  upstreamId: '',
  upstreamName: '',
  upstreamCode: '',
  merchantId: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 编辑表单
const editForm = reactive({
  id: null,
  upstreamName: '',
  upstreamCode: '',
  merchantId: '',
  balance: '',
  alertThreshold: '',
  remark: '',
  status: 1
})

// 表单验证规则
const editRules = {
  upstreamName: [
    { required: true, message: '请输入代付上游名称', trigger: 'blur' }
  ],
  upstreamCode: [
    { required: true, message: '请输入代付上游编码', trigger: 'blur' }
  ],
  merchantId: [
    { required: true, message: '请输入商户号', trigger: 'blur' }
  ],
  balance: [
    { required: true, message: '请输入余额', trigger: 'blur' }
  ],
  alertThreshold: [
    { required: true, message: '请输入提醒阈值', trigger: 'blur' }
  ]
}

// 初始化数据
onMounted(() => {
  loadTableData()
})

// 加载表格数据
function loadTableData() {
  tableLoading.value = true
  setTimeout(() => {
    tableData.value = payoutUpstreamData.upstreams
    pagination.total = payoutUpstreamData.upstreams.length
    tableLoading.value = false
  }, 500)
}

// 格式化金额
function formatAmount(amount) {
  if (!amount) return '0.00'
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化货币
function formatCurrency(amount) {
  if (!amount) return '¥0.00'
  return '¥' + Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 搜索
function handleSearch() {
  ElMessage.success('搜索功能已触发')
  loadTableData()
}

// 重置
function handleReset() {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  ElMessage.info('筛选条件已重置')
  loadTableData()
}



// 下拉菜单操作
function handleOperation(command, row) {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'delete':
      handleDelete(row)
      break
    case 'balance':
      handleBalanceOperation(row)
      break
    case 'unfreeze':
      handleUnfreeze(row)
      break
  }
}

// 编辑
function handleEdit(row) {
  dialogTitle.value = '编辑代付上游'
  Object.keys(editForm).forEach(key => {
    editForm[key] = row[key]
  })
  dialogVisible.value = true
}

// 删除
function handleDelete(row) {
  ElMessageBox.confirm(
    `确定要删除上游"${row.upstreamName}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    loadTableData()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 余额操作
function handleBalanceOperation(row) {
  ElMessage.info(`余额操作功能 - ${row.upstreamName}`)
}

// 余额解冻
function handleUnfreeze(row) {
  ElMessageBox.confirm(
    `确定要解冻上游"${row.upstreamName}"的冻结余额吗？`,
    '解冻确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('余额解冻成功')
    loadTableData()
  }).catch(() => {
    ElMessage.info('已取消解冻')
  })
}

// 保存
function handleSave() {
  editFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(editForm.id ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      loadTableData()
    }
  })
}

// 关闭弹窗
function handleDialogClose() {
  editFormRef.value?.resetFields()
}

// 重置编辑表单
function resetEditForm() {
  Object.keys(editForm).forEach(key => {
    if (key === 'status') {
      editForm[key] = 1
    } else {
      editForm[key] = key === 'id' ? null : ''
    }
  })
}

// 分页相关
function handleSizeChange(val) {
  pagination.pageSize = val
  loadTableData()
}

function handleCurrentChange(val) {
  pagination.currentPage = val
  loadTableData()
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 0;
  display: flex;
  align-items: center;
}

.filter-form .el-form-item__label {
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

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-toolbar .left .table-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>