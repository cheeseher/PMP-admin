<!-- 机器人管理/指令管理 - 配置机器人可执行的指令 -->
<template>
  <div class="command-management-container">
    <!-- 筛选表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="filterForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="关键词：">
            <el-input 
              v-model="filterForm.keyword" 
              placeholder="请输入指令关键词" 
              clearable 
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="状态：">
            <el-select 
              v-model="filterForm.status" 
              placeholder="请选择状态" 
              clearable
              style="width: 168px"
            >
              <el-option label="全部" value="" />
              <el-option label="启用" value="enabled" />
              <el-option label="停用" value="disabled" />
            </el-select>
          </el-form-item>
        </div>
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="resetFilter">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="openCommandDialog('add')">新增指令</el-button>
        </div>
        <div class="right">
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="handleSearch" />
          </el-tooltip>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="keyword" label="指令关键词" min-width="120" />
        <el-table-column prop="format" label="示例格式" min-width="160" show-overflow-tooltip />
        <el-table-column prop="requiresBinding" label="需要绑定" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.requiresBinding ? 'warning' : 'info'" effect="plain">
              {{ row.requiresBinding ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" effect="plain">
              {{ row.status === 'enabled' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button type="primary" link class="operation-button">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item :command="row.status === 'enabled' ? 'disable' : 'enable'">
                    {{ row.status === 'enabled' ? '停用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" style="color: red;">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 指令表单对话框 -->
    <el-dialog
      v-model="commandDialogVisible"
      :title="dialogType === 'add' ? '新增指令' : '编辑指令'"
      width="650px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="commandFormRef"
        :model="commandForm"
        :rules="commandRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="指令关键词" prop="keyword">
          <el-input 
            v-model="commandForm.keyword" 
            placeholder="请输入指令关键词，如：ye"
          />
        </el-form-item>
        <el-form-item label="示例格式" prop="format">
          <el-input 
            v-model="commandForm.format" 
            placeholder="请输入示例格式，如：ye#商户名"
          />
        </el-form-item>
        <el-form-item label="响应模板" prop="responseTemplate">
          <el-input 
            v-model="commandForm.responseTemplate"
            type="textarea"
            :rows="6"
            placeholder="支持 Mustache 模板语法，如：您当前配置的支付产品如下：
{{#each products}}
- {{name}}（{{code}}）
{{/each}}"
          />
          <div class="form-tip">支持 Mustache 变量替换语法，使用 {{变量名}} 引用变量</div>
        </el-form-item>
        <el-form-item label="需要绑定身份" prop="requiresBinding">
          <el-switch
            v-model="commandForm.requiresBinding"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-switch
            v-model="commandForm.statusEnabled"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="commandDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCommandForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, ArrowDown } from '@element-plus/icons-vue'

// 筛选表单
const filterForm = reactive({
  keyword: '',
  status: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    keyword: '产品',
    format: '产品',
    responseTemplate: '您当前配置的支付产品如下：\n{{#each products}}\n- {{name}}（{{code}}）\n{{/each}}',
    requiresBinding: true,
    status: 'enabled'
  },
  {
    id: 2,
    keyword: '余额',
    format: '余额',
    responseTemplate: '商户 {{merchantName}} 的当前余额为：¥{{balance}}',
    requiresBinding: true,
    status: 'enabled'
  },
  {
    id: 3,
    keyword: '绑定',
    format: '绑定#商户号#商户密钥',
    responseTemplate: '商户 {{merchantName}} 绑定成功！',
    requiresBinding: false,
    status: 'enabled'
  }
])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(3)
const loading = ref(false)

// 指令表单对话框
const commandDialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const commandFormRef = ref(null)
const commandForm = reactive({
  id: null,
  keyword: '',
  format: '',
  responseTemplate: '',
  requiresBinding: true,
  statusEnabled: true,
})

// 表单验证规则
const commandRules = {
  keyword: [
    { required: true, message: '请输入指令关键词', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  format: [
    { required: true, message: '请输入指令示例格式', trigger: 'blur' }
  ],
  responseTemplate: [
    { required: true, message: '请输入响应模板', trigger: 'blur' }
  ]
}

// 获取分类标签类型
const getCategoryTagType = (category) => {
  const typeMap = {
    'query': 'info',
    'operation': 'warning',
    'dynamic': 'success',
    'binding': 'primary'
  }
  return typeMap[category] || 'info'
}

// 获取分类标签文本
const getCategoryLabel = (category) => {
  const labelMap = {
    'query': '查询类',
    'operation': '操作类',
    'dynamic': '动态类',
    'binding': '绑定类'
  }
  return labelMap[category] || category
}

// 搜索方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

// 处理下拉命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'edit':
      openCommandDialog('edit', row)
      break
    case 'delete':
      handleDeleteCommand(row)
      break
    case 'enable':
    case 'disable':
      toggleCommandStatus(row)
      break
  }
}

// 打开指令表单对话框
const openCommandDialog = (type, row) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    // 编辑时回填数据
    commandForm.id = row.id
    commandForm.keyword = row.keyword
    commandForm.format = row.format
    commandForm.responseTemplate = row.responseTemplate
    commandForm.requiresBinding = row.requiresBinding
    commandForm.statusEnabled = row.status === 'enabled'
  } else {
    // 新增时重置表单
    commandForm.id = null
    commandForm.keyword = ''
    commandForm.format = ''
    commandForm.responseTemplate = ''
    commandForm.requiresBinding = true
    commandForm.statusEnabled = true
  }
  commandDialogVisible.value = true
}

// 提交指令表单
const submitCommandForm = () => {
  commandFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟提交
      loading.value = true
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 模拟添加数据
          const newCommand = {
            id: tableData.value.length + 1,
            ...commandForm,
            status: commandForm.statusEnabled ? 'enabled' : 'disabled'
          }
          tableData.value.push(newCommand)
          total.value++
          ElMessage.success('指令添加成功')
        } else {
          // 模拟更新数据
          const index = tableData.value.findIndex(item => item.id === commandForm.id)
          if (index !== -1) {
            tableData.value[index] = {
              ...commandForm,
              id: tableData.value[index].id,
              status: commandForm.statusEnabled ? 'enabled' : 'disabled'
            }
          }
          ElMessage.success('指令更新成功')
        }
        loading.value = false
        commandDialogVisible.value = false
      }, 1000)
    }
  })
}

// 删除指令
const handleDeleteCommand = (row) => {
  ElMessageBox.confirm('确认删除该指令?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value.splice(index, 1)
        total.value--
        ElMessage.success('指令删除成功')
      }
      loading.value = false
    }, 500)
  }).catch(() => {})
}

// 切换指令状态
const toggleCommandStatus = (row) => {
  const action = row.status === 'enabled' ? '停用' : '启用'
  ElMessageBox.confirm(`确认${action}该指令?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value[index].status = row.status === 'enabled' ? 'disabled' : 'enabled'
        ElMessage.success(`指令${action}成功`)
      }
      loading.value = false
    }, 500)
  }).catch(() => {})
}

// 生命周期钩子
onMounted(() => {
  // 加载数据
  handleSearch()
})
</script>

<style scoped>
.command-management-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.filter-buttons {
  display: flex;
  margin-left: auto;
  align-items: flex-start;
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-toolbar .left {
  display: flex;
  gap: 10px;
}

.table-toolbar .right {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  padding-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.dialog-footer .el-button {
  margin-left: 12px;
}

.operation-button {
  display: flex;
  align-items: center;
}
</style> 