<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-container">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="商户名称:">
          <el-select 
            v-model="filterForm.merchantId" 
            placeholder="请选择商户" 
            style="width: 168px;"
            filterable
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
        <el-form-item label="绑定状态:">
          <el-select v-model="filterForm.status" placeholder="请选择状态" style="width: 168px;" clearable>
            <el-option label="全部" value="" />
            <el-option label="已绑定" value="bound" />
            <el-option label="已解绑" value="unbound" />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定来源:">
          <el-select v-model="filterForm.source" placeholder="请选择来源" style="width: 168px;" clearable>
            <el-option label="全部" value="" />
            <el-option label="指令" value="command" />
            <el-option label="后台" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
          <el-button @click="resetForm" :icon="Refresh">重置</el-button>
          <el-button type="text" @click="showAdvanced = !showAdvanced">
            {{ showAdvanced ? '收起' : '高级筛选' }}
            <el-icon class="expand-icon"><ArrowDown v-if="!showAdvanced" /><ArrowUp v-else /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 高级筛选区域 -->
      <el-collapse-transition>
        <div v-show="showAdvanced" class="advanced-section">
          <el-form :inline="true" :model="filterForm" class="filter-form">
            <el-form-item label="用户TG ID:">
              <el-input v-model="filterForm.telegramId" placeholder="请输入用户TG ID" style="width: 168px;" clearable />
            </el-form-item>
            <el-form-item label="群组ID:">
              <el-input v-model="filterForm.groupId" placeholder="请输入群组ID" style="width: 168px;" clearable />
            </el-form-item>
            <el-form-item label="绑定时间:">
              <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 240px;"
                clearable
              />
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- 内容区 -->
    <el-card shadow="never" class="table-container">
    <!-- 操作栏 -->
    <div class="table-toolbar">
      <div class="table-toolbar-left">
        <el-button type="primary" @click="addBindingDialogVisible = true" :icon="Plus">新增绑定</el-button>
        <el-button type="danger" plain @click="handleBatchUnbind" :disabled="!selectedRows.length" :icon="Close">
          批量解绑
          <template #default v-if="selectedRows.length">({{ selectedRows.length }})</template>
        </el-button>
      </div>
      <div class="table-toolbar-right">
        <el-button @click="refreshTable" :icon="Refresh">刷新</el-button>
        <el-button type="primary" @click="handleExport" :icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 表格展示 -->
      <el-table 
        :data="tableData" 
        border 
        stripe
        v-loading="tableLoading"
        @selection-change="handleSelectionChange"
        height="calc(100vh - 400px)"
      >
        <el-table-column type="selection" width="45" fixed="left" />
        <el-table-column prop="merchantName" label="商户名称" min-width="150" show-overflow-tooltip fixed="left" />
        <el-table-column label="群组信息" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="info-cell">
              <el-tooltip :content="row.group" placement="top" effect="dark">
                <span>{{ row.group }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="info-cell">
              <el-tooltip :content="row.user" placement="top" effect="dark">
                <span>{{ row.user }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="bindingTime" label="绑定/解绑时间" width="160" sortable />
        <el-table-column prop="source" label="绑定来源" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.source === '指令' ? 'success' : 'info'"
              size="small"
              effect="plain"
            >
              {{ row.source }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === '已绑定' ? 'success' : 'info'" 
              :effect="row.status === '已绑定' ? 'dark' : 'plain'"
              size="small"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button 
                v-if="row.status === '已绑定'"
                type="danger" 
                size="small"
                text
                :icon="CircleClose"
                @click="handleUnbind(row)"
              >
                解绑
              </el-button>
              <el-button 
                type="primary" 
                size="small"
                text
                :icon="DocumentCopy"
                @click="handleViewLog(row)"
              >
                操作日志
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <el-pagination
        class="pagination"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增绑定弹窗 -->
    <el-dialog 
      v-model="addBindingDialogVisible" 
      title="新增绑定" 
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form 
        :model="addForm" 
        :rules="addFormRules"
        label-width="100px"
        ref="addFormRef"
        class="binding-form"
      >
        <el-form-item label="商户:" prop="merchantId">
          <el-select 
            v-model="addForm.merchantId" 
            placeholder="请选择商户"
            filterable
            style="width: 100%"
          >
            <el-option 
              v-for="item in merchantOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="TG群组:" prop="groupId">
          <el-select 
            v-model="addForm.groupId" 
            placeholder="请选择群组或输入群组ID"
            filterable
            allow-create
            style="width: 100%"
          >
            <el-option 
              v-for="item in groupOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"
            />
          </el-select>
          <div class="form-tip">未找到群组时可直接输入ID添加</div>
        </el-form-item>
        
        <el-form-item label="TG用户:" prop="userId">
          <el-select 
            v-model="addForm.userId" 
            placeholder="请选择用户或输入用户ID"
            filterable
            allow-create
            style="width: 100%"
          >
            <el-option 
              v-for="item in userOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"
            />
          </el-select>
          <div class="form-tip">未找到用户时可直接输入ID添加</div>
        </el-form-item>
        
        <el-form-item label="备注:" prop="remark">
          <el-input 
            v-model="addForm.remark" 
            placeholder="可选"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addBindingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdd" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看日志弹窗 -->
    <el-dialog
      v-model="logDialogVisible"
      title="绑定操作日志"
      width="700px"
      destroy-on-close
    >
      <div class="log-header">
        <div class="log-merchant-info">
          <h3>{{ currentLog.merchantName }}</h3>
          <div class="log-group-info">
            <span>群组: {{ currentLog.group }}</span>
          </div>
          <div class="log-user-info">
            <span>用户: {{ currentLog.user }}</span>
          </div>
        </div>
      </div>
      
      <el-divider content-position="center">操作历史</el-divider>
      
      <el-timeline>
        <el-timeline-item
          v-for="(log, index) in bindingLogs"
          :key="index"
          :timestamp="log.time"
          :type="log.type"
          :hollow="index !== 0"
          :icon="log.type === 'success' ? Check : log.type === 'danger' ? Close : More"
        >
          {{ log.content }}
        </el-timeline-item>
      </el-timeline>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="logDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowDown, 
  ArrowUp, 
  Search, 
  Refresh, 
  Filter, 
  Plus, 
  Close, 
  CircleClose,
  Download, 
  Connection,
  DocumentCopy,
  Check,
  More
} from '@element-plus/icons-vue'

// 是否显示高级筛选
const showAdvanced = ref(false)

// 表格加载状态
const tableLoading = ref(false)

// 提交加载状态
const submitLoading = ref(false)

// 选中的行
const selectedRows = ref([])

// 筛选表单
const filterForm = reactive({
  merchantId: '',
  status: '',
  source: '',
  telegramId: '',
  groupId: '',
  dateRange: ''
})

// 分页信息
const pagination = reactive({
  total: 100,
  currentPage: 1,
  pageSize: 10
})

// 商户选项
const merchantOptions = ref([
  { value: '1', label: '大客户商户A' },
  { value: '2', label: '普通商户B' },
  { value: '3', label: '合作伙伴C' }
])

// 群组选项
const groupOptions = ref([
  { value: '111222333', label: 'VIP客户群 (ID: 111222333)' },
  { value: '444555666', label: '普通客户群 (ID: 444555666)' },
  { value: '777888999', label: '商户交流群 (ID: 777888999)' }
])

// 用户选项
const userOptions = ref([
  { value: '123123123', label: '张三 (@zhangsan, 123123123)' },
  { value: '456456456', label: '李四 (@lisi, 456456456)' },
  { value: '789789789', label: '王五 (@wangwu, 789789789)' }
])

// 表单引用
const addFormRef = ref(null)

// 新增绑定表单
const addForm = reactive({
  merchantId: '',
  groupId: '',
  userId: '',
  remark: ''
})

// 表单校验规则
const addFormRules = {
  merchantId: [
    { required: true, message: '请选择商户', trigger: 'change' }
  ],
  groupId: [
    { required: true, message: '请选择或输入群组ID', trigger: 'change' }
  ],
  userId: [
    { required: true, message: '请选择或输入用户ID', trigger: 'change' }
  ]
}

// 表格数据
const tableData = ref([
  {
    id: '1',
    merchantName: '大客户商户A',
    group: 'VIP客户群 (ID: 111222333)',
    user: '张三 (@zhangsan, 123123123)',
    bindingTime: '2023-10-26 15:00:00',
    source: '指令',
    status: '已绑定'
  },
  {
    id: '2',
    merchantName: '普通商户B',
    group: '普通客户群 (ID: 444555666)',
    user: '李四 (@lisi, 456456456)',
    bindingTime: '2023-10-25 12:00:00',
    source: '后台',
    status: '已解绑'
  },
  {
    id: '3',
    merchantName: '合作伙伴C',
    group: '商户交流群 (ID: 777888999)',
    user: '王五 (@wangwu, 789789789)',
    bindingTime: '2023-10-27 09:00:00',
    source: '后台',
    status: '已绑定'
  }
])

// 绑定日志数据
const bindingLogs = ref([])
const currentLog = ref({})

// 弹窗控制
const addBindingDialogVisible = ref(false)
const logDialogVisible = ref(false)

// 生命周期钩子
onMounted(() => {
  // 初始化数据加载
  refreshTable()
})

// 表格操作函数
const refreshTable = () => {
  tableLoading.value = true
  // 模拟请求延时
  setTimeout(() => {
    tableLoading.value = false
  }, 500)
}

const handleSearch = () => {
  pagination.currentPage = 1
  refreshTable()
}

const resetForm = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  handleSearch()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  refreshTable()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  refreshTable()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleUnbind = (row) => {
  ElMessageBox.confirm(
    `确定要解绑商户 "${row.merchantName}" 与 "${row.group}" 的关联吗？`,
    '解绑确认',
    {
      confirmButtonText: '确定解绑',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('解绑成功')
    // 实际项目中这里需要调用API，这里只是模拟
    row.status = '已解绑'
  }).catch(() => {})
}

const handleBatchUnbind = () => {
  if (selectedRows.value.length === 0) return
  
  // 筛选出已绑定的行
  const boundRows = selectedRows.value.filter(row => row.status === '已绑定')
  if (boundRows.length === 0) {
    ElMessage.warning('所选记录中没有可解绑的项')
    return
  }
  
  ElMessageBox.confirm(
    `确定要批量解绑选中的 ${boundRows.length} 条记录吗？`,
    '批量解绑',
    {
      confirmButtonText: '确定解绑',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 实际项目中这里需要调用API，这里只是模拟
    boundRows.forEach(row => {
      const targetRow = tableData.value.find(item => item.id === row.id)
      if (targetRow) {
        targetRow.status = '已解绑'
      }
    })
    ElMessage.success(`已成功解绑 ${boundRows.length} 条记录`)
  }).catch(() => {})
}

const handleViewLog = (row) => {
  // 保存当前查看的记录信息
  currentLog.value = row
  
  // 模拟加载日志数据
  bindingLogs.value = [
    {
      time: '2023-10-26 15:00:00',
      content: `商户 "${row.merchantName}" 与群组 "${row.group}" 绑定成功，来源：${row.source}`,
      type: 'success'
    },
    {
      time: '2023-10-26 14:58:30',
      content: '系统验证TG用户权限，验证通过',
      type: 'primary'
    },
    {
      time: '2023-10-26 14:58:00',
      content: '系统验证商户状态，验证通过',
      type: 'primary'
    }
  ]
  
  // 如果状态是已解绑，添加解绑记录
  if (row.status === '已解绑') {
    bindingLogs.value.unshift({
      time: row.bindingTime,
      content: `商户 "${row.merchantName}" 与群组 "${row.group}" 解绑成功，操作人：管理员`,
      type: 'danger'
    })
  }
  
  // 显示日志弹窗
  logDialogVisible.value = true
}

const confirmAdd = () => {
  addFormRef.value.validate((valid) => {
    if (!valid) return
    
    submitLoading.value = true
    
    // 模拟API请求
    setTimeout(() => {
      // 获取商户名称
      const merchant = merchantOptions.value.find(item => item.value === addForm.merchantId)
      // 获取群组名称
      const group = groupOptions.value.find(item => item.value === addForm.groupId)
      // 获取用户名称
      const user = userOptions.value.find(item => item.value === addForm.userId)
      
      // 生成新记录
      const newBinding = {
        id: Date.now().toString(),
        merchantName: merchant ? merchant.label : `商户ID:${addForm.merchantId}`,
        group: group ? group.label : `群组ID:${addForm.groupId}`,
        user: user ? user.label : `用户ID:${addForm.userId}`,
        bindingTime: new Date().toLocaleString(),
        source: '后台',
        status: '已绑定'
      }
      
      // 添加到表格数据
      tableData.value.unshift(newBinding)
      
      ElMessage.success('绑定成功')
      submitLoading.value = false
      addBindingDialogVisible.value = false
      
      // 重置表单
      addFormRef.value.resetFields()
    }, 1000)
  })
}

const handleExport = () => {
  ElMessage.success('数据导出成功')
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.advanced-section {
  padding-top: 15px;
  border-top: 1px solid #e9e9eb;
  margin-top: 15px;
}

.expand-icon {
  margin-left: 4px;
}

.table-container {
  border-radius: 4px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.table-toolbar-left,
.table-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.info-cell {
  cursor: pointer;
}

.binding-form .el-form-item {
  margin-bottom: 22px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  line-height: 1.4;
}

.log-timeline {
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.log-header {
  padding: 10px 0;
  margin-bottom: 20px;
}

.log-merchant-info {
  margin-bottom: 10px;
}

.log-merchant-info h3 {
  font-size: 16px;
  margin: 0 0 10px 0;
  font-weight: bold;
  color: #303133;
}

.log-group-info, .log-user-info {
  margin: 5px 0;
  color: #606266;
}
</style>
