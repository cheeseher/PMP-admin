<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-container">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="快速搜索:">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索指令名称或示例"
            style="width: 250px;"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 内容区 -->
    <el-card shadow="never" class="table-container">
       <!-- 操作栏 -->
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <el-button type="primary" @click="handleAddCommand" :icon="Plus">添加指令</el-button>
          <el-button type="warning" plain @click="handleBatchUpdate" :disabled="!selectedRows.length" :icon="Edit">
            批量授权
            <template v-if="selectedRows.length">({{ selectedRows.length }})</template>
          </el-button>
        </div>
      </div>
      
      <!-- Tabs -->
      <el-tabs v-model="activeTab" @tab-click="handleTabChange" class="command-tabs">
        <el-tab-pane label="财务操作类" name="finance">
          <el-table 
            :data="filteredData" 
            border 
            stripe
            v-loading="tableLoading"
            @selection-change="handleSelectionChange"
            height="calc(100vh - 400px)"
          >
            <el-table-column type="selection" width="45" fixed="left" />
            <el-table-column prop="commandName" label="指令名称" width="150" fixed="left">
              <template #default="{ row }">
                <div class="command-name">
                  <el-tag effect="plain" type="primary">{{ row.commandName }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="example" label="示例内容" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tooltip :content="row.example" placement="top">
                  <div class="command-example">
                    <code>{{ row.example }}</code>
                  </div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="whitelistEnabled" label="是否开启白名单" width="140">
              <template #default="{ row }">
                <el-switch 
                  v-model="row.whitelistEnabled" 
                  @change="(val) => handleWhitelistChange(row, val)"
                  active-text="已开启"
                  inactive-text="已关闭"
                />
              </template>
            </el-table-column>
            <el-table-column prop="authorizedGroups" label="已授权群组列表" min-width="220">
              <template #default="{ row }">
                <div v-if="row.authorizedGroups && row.authorizedGroups.length">
                  <el-space wrap>
                    <el-tag 
                      v-for="(group, index) in row.authorizedGroups.slice(0, 2)" 
                      :key="index" 
                      type="success"
                      size="small"
                      effect="plain"
                    >
                      {{ group }}
                    </el-tag>
                    <el-tag v-if="row.authorizedGroups.length > 2" type="info" size="small">
                      +{{ row.authorizedGroups.length - 2 }}
                    </el-tag>
                  </el-space>
                </div>
                <span v-else class="no-data">暂无授权群组</span>
              </template>
            </el-table-column>
            <el-table-column prop="authorizedUsers" label="已授权用户列表" min-width="220">
              <template #default="{ row }">
                <div v-if="row.authorizedUsers && row.authorizedUsers.length">
                  <el-space wrap>
                    <el-tag 
                      v-for="(user, index) in row.authorizedUsers.slice(0, 2)" 
                      :key="index" 
                      type="info"
                      size="small"
                      effect="plain"
                    >
                      {{ user }}
                    </el-tag>
                    <el-tag v-if="row.authorizedUsers.length > 2" type="info" size="small">
                      +{{ row.authorizedUsers.length - 2 }}
                    </el-tag>
                  </el-space>
                </div>
                <span v-else class="no-data">暂无授权用户</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-space>
                  <el-button type="primary" size="small" text :icon="Edit" @click="handleEditAuth(row)">编辑授权</el-button>
                  <el-button type="danger" size="small" text :icon="Delete" @click="handleDeleteCommand(row)">删除</el-button>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页器 -->
          <el-pagination
            v-if="filteredData.length > 0"
            class="pagination"
            layout="total, prev, pager, next"
            :total="filteredData.length"
            :page-size="10"
          />
        </el-tab-pane>
        
        <el-tab-pane label="余额调整类" name="balance">
          <div class="empty-tab">
            <el-empty description="暂无余额调整类指令，请点击添加指令按钮添加">
              <template #extra>
                <el-button type="primary" @click="handleAddCommandForCategory('balance')">添加余额调整指令</el-button>
              </template>
            </el-empty>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="订单操作类" name="order">
          <div class="empty-tab">
            <el-empty description="暂无订单操作类指令，请点击添加指令按钮添加">
              <template #extra>
                <el-button type="primary" @click="handleAddCommandForCategory('order')">添加订单操作指令</el-button>
              </template>
            </el-empty>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="绑定操作类" name="binding">
          <div class="empty-tab">
            <el-empty description="暂无绑定操作类指令，请点击添加指令按钮添加">
              <template #extra>
                <el-button type="primary" @click="handleAddCommandForCategory('binding')">添加绑定操作指令</el-button>
              </template>
            </el-empty>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加指令弹窗 -->
    <el-dialog
      v-model="addCommandVisible"
      title="添加指令"
      width="600px"
      destroy-on-close
    >
      <el-form :model="commandForm" :rules="commandRules" label-width="100px" ref="commandFormRef" class="command-form">
        <el-form-item label="指令类别" prop="category">
          <el-select v-model="commandForm.category" placeholder="请选择指令类别" style="width: 100%">
            <el-option label="财务操作类" value="finance" />
            <el-option label="余额调整类" value="balance" />
            <el-option label="订单操作类" value="order" />
            <el-option label="绑定操作类" value="binding" />
          </el-select>
        </el-form-item>
        <el-form-item label="指令名称" prop="commandName">
          <el-input v-model="commandForm.commandName" placeholder="请输入指令名称" clearable />
        </el-form-item>
        <el-form-item label="示例内容" prop="example">
          <el-input v-model="commandForm.example" placeholder="请输入示例内容" clearable />
          <div class="form-tip">示例：修改金额#ORD123#2000</div>
        </el-form-item>
        <el-form-item label="开启白名单" prop="whitelistEnabled">
          <el-switch v-model="commandForm.whitelistEnabled" />
          <span class="switch-tip">{{ commandForm.whitelistEnabled ? '已开启权限控制' : '所有用户均可使用' }}</span>
        </el-form-item>
        
        <el-collapse-transition>
          <div v-if="commandForm.whitelistEnabled" class="auth-section">
            <el-divider content-position="left">授权配置</el-divider>
            
            <el-form-item label="授权群组">
              <el-select
                v-model="commandForm.authorizedGroups"
                multiple
                filterable
                placeholder="请选择授权群组"
                style="width: 100%"
              >
                <el-option
                  v-for="item in groupOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="授权用户">
              <el-select
                v-model="commandForm.authorizedUsers"
                multiple
                filterable
                placeholder="请选择授权用户"
                style="width: 100%"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-collapse-transition>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addCommandVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddCommand" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑授权弹窗 -->
    <el-dialog
      v-model="editAuthVisible"
      title="编辑授权"
      width="600px"
      destroy-on-close
    >
      <div class="command-info">
        <el-alert
          :title="'正在编辑 &quot;' + currentCommand.commandName + '&quot; 指令的授权配置'"
          type="info"
          :closable="false"
          show-icon
        />
        <el-descriptions :column="1" border class="command-desc">
          <el-descriptions-item label="指令名称">
            <el-tag effect="plain" type="primary">{{ currentCommand.commandName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="示例内容">
            <code>{{ currentCommand.example }}</code>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <el-divider content-position="left">授权配置</el-divider>
      
      <el-form :model="authForm" label-width="100px" class="auth-form">
        <el-form-item label="开启白名单">
          <el-switch v-model="authForm.whitelistEnabled" />
          <span class="switch-tip">{{ authForm.whitelistEnabled ? '已开启权限控制' : '所有用户均可使用' }}</span>
        </el-form-item>
        
        <el-collapse-transition>
          <div v-if="authForm.whitelistEnabled">
            <el-form-item label="授权群组">
              <el-select
                v-model="authForm.authorizedGroups"
                multiple
                filterable
                placeholder="请选择授权群组"
                style="width: 100%"
              >
                <el-option
                  v-for="item in groupOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="授权用户">
              <el-select
                v-model="authForm.authorizedUsers"
                multiple
                filterable
                placeholder="请选择授权用户"
                style="width: 100%"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-collapse-transition>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editAuthVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEditAuth" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量授权弹窗 -->
    <el-dialog
      v-model="batchAuthVisible"
      title="批量授权"
      width="600px"
      destroy-on-close
    >
      <div class="batch-info">
        <el-alert
          :title="'您已选择 ' + selectedRows.length + ' 条指令记录进行批量授权'"
          type="warning"
          :closable="false"
          show-icon
        />
        
        <div class="selected-commands">
          <div class="command-list-title">已选指令：</div>
          <el-space wrap>
            <el-tag
              v-for="(row, index) in selectedRows"
              :key="index"
              effect="plain"
              type="primary"
            >
              {{ row.commandName }}
            </el-tag>
          </el-space>
        </div>
      </div>
      
      <el-divider content-position="left">批量授权配置</el-divider>
      
      <el-form :model="batchAuthForm" label-width="100px" class="batch-form">
        <el-form-item label="授权操作">
          <el-radio-group v-model="batchAuthForm.actionType">
            <el-radio label="add">添加授权</el-radio>
            <el-radio label="remove">移除授权</el-radio>
            <el-radio label="replace">替换授权</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="授权群组">
          <el-select
            v-model="batchAuthForm.authorizedGroups"
            multiple
            filterable
            placeholder="请选择授权群组"
            style="width: 100%"
          >
            <el-option
              v-for="item in groupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="授权用户">
          <el-select
            v-model="batchAuthForm.authorizedUsers"
            multiple
            filterable
            placeholder="请选择授权用户"
            style="width: 100%"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAuthVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchAuth" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Setting } from '@element-plus/icons-vue'

// 当前激活的选项卡
const activeTab = ref('finance')

// 表格加载状态
const tableLoading = ref(false)

// 提交加载状态
const submitLoading = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 选中的行
const selectedRows = ref([])

// 弹窗控制
const addCommandVisible = ref(false)
const editAuthVisible = ref(false)
const batchAuthVisible = ref(false)

// 当前编辑的指令
const currentCommand = ref({})

// 表单引用
const commandFormRef = ref(null)

// 指令表单
const commandForm = reactive({
  category: '',
  commandName: '',
  example: '',
  whitelistEnabled: false,
  authorizedGroups: [],
  authorizedUsers: []
})

// 授权表单
const authForm = reactive({
  whitelistEnabled: false,
  authorizedGroups: [],
  authorizedUsers: []
})

// 批量授权表单
const batchAuthForm = reactive({
  actionType: 'add',
  authorizedGroups: [],
  authorizedUsers: []
})

// 表单校验规则
const commandRules = {
  category: [
    { required: true, message: '请选择指令类别', trigger: 'change' }
  ],
  commandName: [
    { required: true, message: '请输入指令名称', trigger: 'blur' }
  ],
  example: [
    { required: true, message: '请输入示例内容', trigger: 'blur' }
  ]
}

// 指令数据
const financeData = ref([
  {
    id: '1',
    commandName: '修改金额',
    example: '修改金额#ORD123#2000',
    whitelistEnabled: true,
    authorizedGroups: ['VIP客户群', '财务群'],
    authorizedUsers: ['张三(@zhangsan)', '李四(@lisi)']
  },
  {
    id: '2',
    commandName: '调整费率',
    example: '调整费率#商户A#0.005',
    whitelistEnabled: false,
    authorizedGroups: [],
    authorizedUsers: []
  },
  {
    id: '3',
    commandName: '查询收益',
    example: '查询收益#2023-10',
    whitelistEnabled: true,
    authorizedGroups: ['VIP客户群'],
    authorizedUsers: ['张三(@zhangsan)']
  }
])

// 群组选项
const groupOptions = ref([
  { value: '1', label: 'VIP客户群' },
  { value: '2', label: '财务群' },
  { value: '3', label: '管理群' },
  { value: '4', label: '商户交流群' }
])

// 用户选项
const userOptions = ref([
  { value: '1', label: '张三(@zhangsan)' },
  { value: '2', label: '李四(@lisi)' },
  { value: '3', label: '王五(@wangwu)' },
  { value: '4', label: '赵六(@zhaoliu)' }
])

// 根据搜索关键词过滤数据
const filteredData = computed(() => {
  if (!searchKeyword.value) {
    return financeData.value
  }
  
  return financeData.value.filter(item => 
    item.commandName.includes(searchKeyword.value) || 
    item.example.includes(searchKeyword.value)
  )
})

// 处理选项卡切换
const handleTabChange = (tab) => {
  // 切换选项卡时重置搜索和选择
  searchKeyword.value = ''
  selectedRows.value = []
}

// 处理搜索
const handleSearch = () => {
  // 实际项目中可能需要调用API进行搜索
}

// 处理选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 处理白名单开关变化
const handleWhitelistChange = (row, value) => {
  if (!value) {
    // 关闭白名单时清空授权列表
    row.authorizedGroups = []
    row.authorizedUsers = []
    ElMessage.success(`已关闭 "${row.commandName}" 的白名单功能`)
  } else {
    ElMessage.success(`已开启 "${row.commandName}" 的白名单功能，请配置授权`)
  }
}

// 处理添加指令
const handleAddCommand = () => {
  // 重置表单
  Object.keys(commandForm).forEach(key => {
    commandForm[key] = key === 'category' ? activeTab.value : (key === 'whitelistEnabled' ? false : (Array.isArray(commandForm[key]) ? [] : ''))
  })
  
  // 显示弹窗
  addCommandVisible.value = true
  
  // 等待DOM更新后设置焦点
  nextTick(() => {
    commandFormRef.value && commandFormRef.value.clearValidate()
  })
}

// 为特定类别添加指令
const handleAddCommandForCategory = (category) => {
  // 重置表单
  Object.keys(commandForm).forEach(key => {
    commandForm[key] = key === 'category' ? category : (key === 'whitelistEnabled' ? false : (Array.isArray(commandForm[key]) ? [] : ''))
  })
  
  // 切换到对应选项卡
  activeTab.value = category
  
  // 显示弹窗
  addCommandVisible.value = true
  
  // 等待DOM更新后设置焦点
  nextTick(() => {
    commandFormRef.value && commandFormRef.value.clearValidate()
  })
}

// 确认添加指令
const confirmAddCommand = () => {
  commandFormRef.value.validate((valid) => {
    if (!valid) return
    
    submitLoading.value = true
    
    // 模拟API请求延时
    setTimeout(() => {
      // 生成新指令
      const newCommand = {
        id: Date.now().toString(),
        commandName: commandForm.commandName,
        example: commandForm.example,
        whitelistEnabled: commandForm.whitelistEnabled,
        authorizedGroups: commandForm.authorizedGroups,
        authorizedUsers: commandForm.authorizedUsers
      }
      
      // 添加到对应的数据中
      if (commandForm.category === 'finance') {
        financeData.value.push(newCommand)
      }
      
      ElMessage.success('指令添加成功')
      submitLoading.value = false
      addCommandVisible.value = false
    }, 500)
  })
}

// 处理编辑授权
const handleEditAuth = (row) => {
  currentCommand.value = row
  
  // 初始化授权表单
  authForm.whitelistEnabled = row.whitelistEnabled
  authForm.authorizedGroups = [...row.authorizedGroups]
  authForm.authorizedUsers = [...row.authorizedUsers]
  
  // 显示弹窗
  editAuthVisible.value = true
}

// 确认编辑授权
const confirmEditAuth = () => {
  submitLoading.value = true
  
  // 模拟API请求延时
  setTimeout(() => {
    // 更新授权数据
    currentCommand.value.whitelistEnabled = authForm.whitelistEnabled
    currentCommand.value.authorizedGroups = authForm.whitelistEnabled ? [...authForm.authorizedGroups] : []
    currentCommand.value.authorizedUsers = authForm.whitelistEnabled ? [...authForm.authorizedUsers] : []
    
    ElMessage.success('授权编辑成功')
    submitLoading.value = false
    editAuthVisible.value = false
  }, 500)
}

// 处理删除指令
const handleDeleteCommand = (row) => {
  ElMessageBox.confirm(
    `确定要删除 "${row.commandName}" 指令吗？`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 根据当前激活的选项卡删除对应数据
    if (activeTab.value === 'finance') {
      const index = financeData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        financeData.value.splice(index, 1)
      }
    }
    
    ElMessage.success('指令删除成功')
  }).catch(() => {})
}

// 处理批量授权
const handleBatchUpdate = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择需要批量授权的指令')
    return
  }
  
  // 重置批量授权表单
  batchAuthForm.actionType = 'add'
  batchAuthForm.authorizedGroups = []
  batchAuthForm.authorizedUsers = []
  
  // 显示弹窗
  batchAuthVisible.value = true
}

// 确认批量授权
const confirmBatchAuth = () => {
  if (batchAuthForm.authorizedGroups.length === 0 && batchAuthForm.authorizedUsers.length === 0) {
    ElMessage.warning('请至少选择一个授权群组或用户')
    return
  }
  
  submitLoading.value = true
  
  // 模拟API请求延时
  setTimeout(() => {
    // 对选中的行进行批量授权操作
    selectedRows.value.forEach(row => {
      if (!row.whitelistEnabled) {
        // 如果白名单未开启，则自动开启
        row.whitelistEnabled = true
      }
      
      if (batchAuthForm.actionType === 'add') {
        // 添加授权
        batchAuthForm.authorizedGroups.forEach(group => {
          if (!row.authorizedGroups.includes(group)) {
            row.authorizedGroups.push(group)
          }
        })
        
        batchAuthForm.authorizedUsers.forEach(user => {
          if (!row.authorizedUsers.includes(user)) {
            row.authorizedUsers.push(user)
          }
        })
      } else if (batchAuthForm.actionType === 'remove') {
        // 移除授权
        row.authorizedGroups = row.authorizedGroups.filter(group => !batchAuthForm.authorizedGroups.includes(group))
        row.authorizedUsers = row.authorizedUsers.filter(user => !batchAuthForm.authorizedUsers.includes(user))
      } else if (batchAuthForm.actionType === 'replace') {
        // 替换授权
        row.authorizedGroups = [...batchAuthForm.authorizedGroups]
        row.authorizedUsers = [...batchAuthForm.authorizedUsers]
      }
    })
    
    ElMessage.success(`已成功对 ${selectedRows.value.length} 条指令进行批量授权`)
    submitLoading.value = false
    batchAuthVisible.value = false
    selectedRows.value = []
  }, 500)
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

.table-toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.command-tabs {
  margin-top: -10px; /* Offset the default tab header margin */
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.command-name .el-tag,
.command-example code {
  cursor: pointer;
}

.no-data {
  color: #909399;
  font-size: 13px;
}

.empty-tab {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 40px 0;
}

.command-form .el-form-item,
.auth-form .el-form-item {
  margin-bottom: 22px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  line-height: 1.4;
}

.switch-tip {
  margin-left: 10px;
  font-size: 13px;
  color: #606266;
}

.auth-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #dcdfe6;
}

.command-info {
  margin-bottom: 20px;
}

.command-desc {
  margin-top: 12px;
}

.command-desc .el-tag {
  font-size: 14px;
}
</style>
