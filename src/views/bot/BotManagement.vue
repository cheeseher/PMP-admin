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
          <el-form-item label="机器人角色：">
            <el-select v-model="filterForm.role" placeholder="请选择角色" clearable style="width: 168px">
              <el-option label="全部" value="" />
              <el-option label="上游群角色" value="upstream" />
              <el-option label="商户群角色" value="merchant" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态：">
            <el-select v-model="filterForm.status" placeholder="请选择状态" clearable style="width: 168px">
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
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="botName" label="机器人名称" min-width="180" />
        <el-table-column prop="botUsername" label="Bot-Username" min-width="180" />
        <el-table-column prop="role" label="机器人角色" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="row.role === 'upstream' ? 'success' : 'primary'">
              {{ row.role === 'upstream' ? '上游群角色' : '商户群角色' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="欢迎语状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.welcomeMessageEnabled" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column fixed="right" label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button type="primary" link class="operation-button">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="test">测试连接</el-dropdown-item>
                  <el-dropdown-item :command="row.status === 'enabled' ? 'disable' : 'enable'">
                    {{ row.status === 'enabled' ? '停用' : '启用' }}
                  </el-dropdown-item>
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
            :disabled="dialogType === 'edit'" 
          />
        </el-form-item>
        <el-form-item label="Bot 用户名" prop="botUsername">
          <el-input 
            v-model="botForm.botUsername" 
            placeholder="请输入机器人用户名，必须以bot结尾"
            :disabled="dialogType === 'edit'" 
          />
        </el-form-item>
        <el-form-item label="机器人角色" prop="role">
          <el-select v-model="botForm.role" placeholder="请选择机器人角色" style="width: 100%;">
            <el-option label="上游群角色" value="upstream"></el-option>
            <el-option label="商户群角色" value="merchant"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="欢迎语开关" prop="welcomeMessageEnabled">
           <el-switch v-model="botForm.welcomeMessageEnabled" />
        </el-form-item>
        <el-form-item v-if="botForm.welcomeMessageEnabled" label="欢迎语内容" prop="welcomeMessage">
          <el-input
            v-model="botForm.welcomeMessage"
            type="textarea"
            :rows="4"
            placeholder="请输入欢迎语内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="botDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBotForm">确认</el-button>
          <el-button 
            v-if="dialogType === 'edit'" 
            type="success" 
            @click="setupWebhook"
          >
            {{ botForm.statusEnabled ? '更新 Webhook' : '启用 Webhook' }}
          </el-button>
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
const isInstructionVisible = ref(true)

// 筛选表单
const filterForm = reactive({
  botName: '',
  role: '',
  status: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    botName: '官方支付机器人',
    botUsername: '@sifang_pay_bot',
    token: '6895029194:AAE...',
    role: 'upstream',
    status: 'active',
    welcomeMessageEnabled: true,
    welcomeMessage: '欢迎使用官方支付机器人！',
    creator: 'admin',
    createdAt: '2023-10-01 12:00:00'
  },
  {
    id: 2,
    botName: '业务通知机器人',
    botUsername: '@sifang_notify_bot',
    token: '5983472156:BBE...',
    role: 'merchant',
    status: 'offline',
    welcomeMessageEnabled: false,
    welcomeMessage: '',
    creator: 'admin',
    createdAt: '2023-09-15 10:30:00'
  }
])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(2)
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
  role: '', // 'upstream' or 'merchant'
  welcomeMessageEnabled: false,
  welcomeMessage: ''
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
    { pattern: /^[A-Za-z0-9_]+bot$/, message: '用户名必须以 bot 结尾', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择机器人角色', trigger: 'change' }
  ],
  welcomeMessage: [
    { validator: (rule, value, callback) => {
      if (botForm.welcomeMessageEnabled && !value) {
        callback(new Error('开启欢迎语后，内容不能为空'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
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
  filterForm.botName = ''
  filterForm.role = ''
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
    case 'test':
      testConnection(row)
      break
    case 'enable':
    case 'disable':
      toggleBotStatus(row)
      break
  }
}

// 打开机器人表单对话框
const openBotDialog = (type, row) => {
  dialogType.value = type
  botDialogVisible.value = true
  
  nextTick(() => {
    botFormRef.value.resetFields()
    botForm.id = null
    botForm.welcomeMessageEnabled = false
    botForm.welcomeMessage = ''
    
    if (type === 'edit' && row) {
      botForm.id = row.id
      botForm.botName = row.botName
      botForm.botUsername = row.botUsername
      botForm.token = row.token
      botForm.role = row.role
      botForm.welcomeMessageEnabled = row.welcomeMessageEnabled
      botForm.welcomeMessage = row.welcomeMessage
    }
  })
}

// 提交机器人表单
const submitBotForm = () => {
  botFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟提交
      loading.value = true
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 模拟添加数据
          const newBot = {
            id: Date.now(),
            ...botForm,
            creator: 'admin',
            createdAt: new Date().toLocaleString(),
            status: 'offline'
          }
          tableData.value.unshift(newBot)
          total.value++
          ElMessage.success('机器人添加成功')
        } else {
          // 模拟更新数据
          const index = tableData.value.findIndex(item => item.id === botForm.id)
          if (index !== -1) {
            tableData.value[index] = { ...tableData.value[index], ...botForm }
          }
          ElMessage.success('机器人更新成功')
        }
        loading.value = false
        botDialogVisible.value = false
      }, 1000)
    }
  })
}

// 设置 Webhook
const setupWebhook = () => {
  loading.value = true
  setTimeout(() => {
    ElMessage.success(botForm.statusEnabled ? 'Webhook 更新成功' : 'Webhook 启用成功')
    botForm.statusEnabled = true
    loading.value = false
  }, 1000)
}

// 测试连接
const testConnection = (row) => {
  ElMessage.info('正在测试连接...')
  setTimeout(() => {
    ElMessage.success('连接测试成功')
  }, 1000)
}

// 切换机器人状态
const toggleBotStatus = (row) => {
  const action = row.status === 'enabled' ? '停用' : '启用'
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