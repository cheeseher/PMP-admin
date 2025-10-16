<!-- 机器人管理/机器人管理 - 管理系统机器人配置 -->
<template>
  <div class="bot-management-container">


    <!-- 筛选表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="filterForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="机器人名称：">
            <el-input 
              v-model="filterForm.botName" 
              placeholder="请输入机器人名称" 
              clearable 
              style="width: 220px" 
            />
          </el-form-item>
          <el-form-item label="状态：">
            <el-select v-model="filterForm.status" placeholder="请选择状态" clearable style="width: 168px">
              <el-option label="全部" value="" />
              <el-option label="开启" value="enabled" />
              <el-option label="关闭" value="disabled" />
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
          <el-button type="primary" :icon="Plus" @click="openBotDialog('add')">新增机器人</el-button>
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
        :data="displayData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="botName" label="机器人名称" min-width="180" />
        <el-table-column label="Bot 用户名" min-width="180">
          <template #default="{ row }">
            {{ formatBotUsername(row.botUsername) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column fixed="right" label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openBotDialog('edit', row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="confirmDelete(row)">
              删除
            </el-button>
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

    <!-- 机器人表单对话框 -->
    <el-dialog
      v-model="botDialogVisible"
      :title="dialogType === 'add' ? '新增机器人' : '编辑机器人'"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="botFormRef"
        :model="botForm"
        :rules="botRules"
        label-width="130px"
        label-position="left"
      >

        <el-form-item label="机器人名称" prop="botName">
          <el-input v-model="botForm.botName" placeholder="请输入机器人名称" />
        </el-form-item>
        <el-form-item label="Bot Token" prop="token">
          <el-input 
            v-model="botForm.token" 
            placeholder="请输入从 BotFather 获取的 Token"
          />
        </el-form-item>
        <el-form-item label="Bot 用户名" prop="botUsername">
          <el-input 
            v-model="botForm.botUsername" 
            placeholder="请输入机器人用户名，必须以bot结尾，无需添加@符号"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="botForm.statusEnabled"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <div class="right-buttons">
            <el-button @click="botDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitBotForm">确认</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, ArrowDown } from '@element-plus/icons-vue'

// 指引说明展示状态
// 移除了说明卡片

// 筛选表单
const filterForm = reactive({
  botName: '',
  status: ''
})

// 原始表格数据
const tableData = ref([
  {
    id: 1,
    botName: '机器人A',
    botUsername: '@sifang_pay_bot',
    token: '6895029194:AAE...',
    status: 'enabled',
    creator: 'admin',
    createdAt: '2023-10-01 12:00:00'
  },
  {
    id: 2,
    botName: '查单客服机器人',
    botUsername: '@check_order_bot',
    token: '123456:ABCDEF...',
    status: 'enabled',
    creator: 'admin',
    createdAt: '2023-09-15 10:30:00'
  }
])

// 渲染数据（受筛选影响）
const displayData = ref([...tableData.value])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(displayData.value.length)
const loading = ref(false)

// 机器人表单对话框
const botDialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const botFormRef = ref(null)
const botForm = reactive({
  id: null,
  botName: '',
  botUsername: '',
  token: '',
  status: 'enabled', // 默认为开启状态
  statusEnabled: true // 新增状态开关属性，默认为开启
})

// 表单验证规则
const botRules = {
  botName: [
    { required: true, message: '请输入机器人名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  token: [
    { required: true, message: '请输入Token', trigger: 'blur' }
  ],
  botUsername: [
    { required: true, message: '请输入机器人用户名', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_]+bot$/, message: '用户名必须以 bot 结尾，无需添加@符号', trigger: 'blur' }
  ]
}

// 动态验证规则
const getBotRules = () => {
  return {
    botName: [
      { required: true, message: '请输入机器人名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    token: [
      { required: true, message: '请输入Token', trigger: 'blur' }
    ],
    botUsername: [
      { required: true, message: '请输入机器人用户名', trigger: 'blur' },
      { pattern: /^[A-Za-z0-9_]+bot$/, message: '用户名必须以 bot 结尾，无需添加@符号', trigger: 'blur' }
    ]
  }
}

// 搜索方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    // 过滤逻辑：按名称、状态
    const name = filterForm.botName?.trim().toLowerCase()
    displayData.value = tableData.value.filter(item => {
      const matchName = name ? item.botName.toLowerCase().includes(name) : true
      const matchStatus = filterForm.status ? item.status === filterForm.status : true
      return matchName && matchStatus
    })
    total.value = displayData.value.length
    loading.value = false
    ElMessage.success('查询成功')
  }, 300)
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.botName = ''
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
      openBotDialog('edit', row)
      break
    case 'enable':
    case 'disable':
      toggleBotStatus(row)
      break
  }
}

// 确认删除
const confirmDelete = (row) => {
  ElMessageBox.confirm(`确认删除机器人"${row.botName}"?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value.splice(index, 1)
        ElMessage.success('机器人删除成功')
      }
      // 删除后重新计算渲染数据
      handleSearch()
      loading.value = false
    }, 500)
  }).catch(() => {})
}



// 打开机器人表单对话框
const openBotDialog = (type, row) => {
  dialogType.value = type
  botDialogVisible.value = true
  
  nextTick(() => {
    if (botFormRef.value) {
      botFormRef.value.resetFields()
    }
    botForm.id = null
    botForm.statusEnabled = true // 默认设置为开启
    
    if (type === 'edit' && row) {
      botForm.id = row.id
      botForm.botName = row.botName
      botForm.botUsername = formatBotUsername(row.botUsername) // 去除@符号
      botForm.token = row.token || ''
      botForm.status = row.status
      botForm.statusEnabled = row.status === 'enabled' // 设置开关状态
    }
  })
}

// 提交机器人表单
const submitBotForm = () => {
  // 使用动态验证规则
  const currentRules = getBotRules()
  
  // 手动验证表单
  let isValid = true
  const errorMessages = []
  
  // 验证机器人名称
  if (!botForm.botName || botForm.botName.length < 2 || botForm.botName.length > 50) {
    isValid = false
    errorMessages.push('请输入正确的机器人名称（2-50个字符）')
  }
  
  // 验证 Token 与用户名为必填
  if (!botForm.token) {
    isValid = false
    errorMessages.push('请输入Token')
  }
  if (!botForm.botUsername) {
    isValid = false
    errorMessages.push('请输入机器人用户名')
  } else if (!/^[A-Za-z0-9_]+bot$/.test(botForm.botUsername)) {
    isValid = false
    errorMessages.push('用户名必须以 bot 结尾，无需添加@符号')
  }
  
  if (!isValid) {
    ElMessage.error(errorMessages.join('；'))
    return
  }
  
  // 模拟提交
  loading.value = true
  
  setTimeout(() => {
    if (dialogType.value === 'add') {
      // 模拟添加数据
      const newBot = {
        id: Date.now(),
        botName: botForm.botName,
        botUsername: botForm.botUsername.startsWith('@') ? botForm.botUsername : '@' + botForm.botUsername,
        token: botForm.token,
        status: botForm.statusEnabled ? 'enabled' : 'disabled',
        creator: 'admin',
        createdAt: new Date().toLocaleString()
      }
      tableData.value.unshift(newBot)
      ElMessage.success('机器人添加成功')
    } else {
      // 模拟更新数据
      const index = tableData.value.findIndex(item => item.id === botForm.id)
      if (index !== -1) {
        tableData.value[index] = { 
          ...tableData.value[index], 
          botName: botForm.botName,
          botUsername: botForm.botUsername.startsWith('@') ? botForm.botUsername : '@' + botForm.botUsername,
          token: botForm.token,
          status: botForm.statusEnabled ? 'enabled' : 'disabled'
        }
      }
      ElMessage.success('机器人更新成功')
    }
    // 提交后重新刷新渲染数据与总数
    handleSearch()
    loading.value = false
    botDialogVisible.value = false
  }, 1000)
}

// 切换机器人状态
const toggleBotStatus = (row) => {
  const action = row.status === 'enabled' ? '关闭' : '开启'
  ElMessageBox.confirm(`确认${action}该机器人?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value[index].status = row.status === 'enabled' ? 'disabled' : 'enabled'
        ElMessage.success(`机器人${action}成功`)
      }
      handleSearch()
      loading.value = false
    }, 500)
  }).catch(() => {})
}

// 格式化机器人用户名，去除@符号
const formatBotUsername = (username) => {
  if (!username) return ''
  return username.replace('@', '')
}



// 获取状态标签类型
const getStatusType = (status) => {
  const statusMap = {
    'enabled': 'success',
    'disabled': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const statusMap = {
    'enabled': '开启',
    'disabled': '关闭'
  }
  return statusMap[status] || status
}


// 生命周期钩子
onMounted(() => {
  // 初始加载数据
  handleSearch()
})
</script>

<style scoped>
.bot-management-container {
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

.instruction-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.instruction-content {
  padding: 10px 0;
}

.instruction-step {
  display: flex;
  margin-bottom: 16px;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #409EFF;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 16px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
}

.step-content p {
  margin: 0;
  color: #606266;
}

.principle-list {
  margin-top: 10px;
  padding-left: 20px;
  color: #606266;
}

.principle-list li {
  margin-bottom: 5px;
  line-height: 1.5;
}

.principle-list li strong {
  color: #409EFF;
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
  justify-content: space-between;
  align-items: center;
}

.left-buttons {
  display: flex;
  gap: 10px;
}

.right-buttons {
  display: flex;
  gap: 12px;
}

.dialog-footer .el-button {
  margin-left: 0;
}

.operation-button {
  display: flex;
  align-items: center;
}

.pairing-token {
  font-family: monospace;
  font-size: 12px;
  color: #409EFF;
  background-color: #f0f9ff;
  padding: 2px 6px;
  border-radius: 4px;
  word-break: break-all;
}
</style>