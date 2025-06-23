<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-container">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="群组类型:">
          <el-select v-model="filterForm.groupType" placeholder="请选择群组类型" style="width: 168px;" clearable>
            <el-option label="全部" value="" />
            <el-option label="商户群" value="merchant" />
            <el-option label="上游群" value="upstream" />
            <el-option label="管理群" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="群组名称:">
          <el-input v-model="filterForm.groupName" placeholder="请输入群组名称" style="width: 168px;" clearable />
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="filterForm.status" placeholder="请选择状态" style="width: 168px;" clearable>
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
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
            <el-form-item label="TG用户ID:">
              <el-input v-model="filterForm.telegramId" placeholder="请输入TG用户ID" style="width: 168px;" clearable />
            </el-form-item>
            <el-form-item label="绑定商户:">
              <el-select 
                v-model="filterForm.merchantId" 
                placeholder="请选择商户"
                filterable
                clearable
                style="width: 168px;"
              >
                <el-option 
                  v-for="item in merchantOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="活跃时间:">
              <el-date-picker
                v-model="filterForm.activityDate"
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

    <!-- 表格与操作区 -->
    <el-card shadow="never" class="table-container">
    <!-- 操作栏 -->
    <div class="table-toolbar">
      <div class="table-toolbar-left">
        <el-space>
          <el-button type="primary" @click="handleImportGroup" :icon="FolderAdd">导入群组</el-button>
          <el-dropdown split-button type="primary" @click="handleBatchDisable" :disabled="!selectedRows.length">
            <template #default>
              <el-icon class="el-icon--left"><CircleClose /></el-icon>
              批量禁用
              <template v-if="selectedRows.length">({{ selectedRows.length }})</template>
            </template>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleBatchEnable">
                  <el-icon><Check /></el-icon>
                  批量启用
                </el-dropdown-item>
                <el-dropdown-item @click="handleBatchUnbind">
                  <el-icon><Connection /></el-icon>
                  批量解绑
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-space>
      </div>
      <div class="table-toolbar-right">
        <el-space>
          <el-button @click="refreshTable" :icon="Refresh">刷新</el-button>
          <el-button type="primary" @click="handleExport" :icon="Download">导出</el-button>
        </el-space>
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
        <el-table-column prop="groupName" label="群组名称" min-width="160" show-overflow-tooltip fixed="left">
          <template #default="{ row }">
            <div class="group-name-cell">
              <el-tooltip :content="row.groupName" placement="top" effect="dark">
                <span>{{ row.groupName }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="groupId" label="群组ID" width="130" show-overflow-tooltip />
        <el-table-column prop="groupType" label="群组类型" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.groupType === '商户群' ? 'success' : row.groupType === '上游群' ? 'warning' : 'info'"
              size="small"
              effect="plain"
            >
              {{ row.groupType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="user-info-cell">
              <el-tooltip :content="row.user" placement="top" effect="dark">
                <span>{{ row.user }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="绑定商户" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="row.boundMerchant" class="merchant-cell">
              <el-tag size="small" effect="plain" type="success">
                {{ row.boundMerchant }}
              </el-tag>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastActiveTime" label="最近活跃时间" width="150" sortable />
        <el-table-column prop="msgCount" label="消息数" width="90" sortable align="center">
          <template #default="{ row }">
            <el-badge :value="row.msgCount" :max="999" type="primary" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === '启用' ? 'success' : 'danger'"
              :effect="row.status === '启用' ? 'dark' : 'plain'"
              size="small"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button 
                :type="row.status === '启用' ? 'danger' : 'success'" 
                size="small"
                text
                :icon="row.status === '启用' ? CircleClose : Check"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === '启用' ? '禁用' : '启用' }}
              </el-button>
              <el-button 
                type="warning" 
                size="small"
                text
                :icon="Link"
                v-if="row.boundMerchant"
                @click="handleUnbind(row)"
              >
                解绑
              </el-button>
              <el-button 
                type="primary" 
                size="small"
                text
                :icon="View"
                @click="handleViewDetail(row)"
              >
                详情
              </el-button>
              <el-button 
                type="info" 
                size="small"
                text
                :icon="Document"
                @click="handleViewLog(row)"
              >
                日志
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

    <!-- 群组详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="群组详情"
      width="700px"
      destroy-on-close
    >
      <div class="detail-header">
        <div class="detail-title">
          <h3>{{ currentDetail.groupName }}</h3>
          <el-tag 
            :type="currentDetail.groupType === '商户群' ? 'success' : currentDetail.groupType === '上游群' ? 'warning' : 'info'"
            effect="plain"
          >
            {{ currentDetail.groupType }}
          </el-tag>
          <el-tag 
            :type="currentDetail.status === '启用' ? 'success' : 'danger'"
            :effect="currentDetail.status === '启用' ? 'dark' : 'plain'"
            style="margin-left: 8px;"
          >
            {{ currentDetail.status }}
          </el-tag>
        </div>
      </div>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="群组ID">{{ currentDetail.groupId }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentDetail.createdTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="绑定商户">
          <el-tag v-if="currentDetail.boundMerchant" type="success" effect="plain">
            {{ currentDetail.boundMerchant }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="成员数量">
          <el-badge :value="currentDetail.memberCount || 0" :max="999" type="primary" />
        </el-descriptions-item>
        <el-descriptions-item label="最近活跃时间">{{ currentDetail.lastActiveTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="消息数量">{{ currentDetail.msgCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="机器人权限" :span="2">{{ currentDetail.botPermissions || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="center">群组成员</el-divider>
      
      <el-table :data="groupMembers" border stripe style="width: 100%" max-height="300px">
        <el-table-column prop="nickname" label="用户昵称" min-width="120" />
        <el-table-column prop="telegramId" label="TG ID" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.role === 'admin' ? 'danger' : row.role === 'moderator' ? 'warning' : ''"
              size="small"
              effect="plain"
            >
              {{ row.role === 'admin' ? '管理员' : row.role === 'moderator' ? '版主' : '成员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinTime" label="加入时间" width="150" />
        <el-table-column prop="msgCount" label="消息数" width="90" align="center">
          <template #default="{ row }">
            <el-badge :value="row.msgCount" :max="999" type="primary" />
          </template>
        </el-table-column>
      </el-table>
      
      <div class="dialog-footer-actions">
        <el-button-group>
          <el-button 
            type="success" 
            :icon="MessageBox"
            @click="handleSendTestMessage"
          >
            发送测试消息
          </el-button>
          <el-button 
            :type="currentDetail.status === '启用' ? 'danger' : 'success'"
            :icon="currentDetail.status === '启用' ? CircleClose : Check"
            @click="handleToggleStatusInDialog"
          >
            {{ currentDetail.status === '启用' ? '禁用群组' : '启用群组' }}
          </el-button>
        </el-button-group>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="detailDialogVisible = false">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入群组弹窗 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入群组"
      width="500px"
      destroy-on-close
    >
      <div class="import-notice">
        <el-alert
          title="请确保机器人已被邀请到该群组并赋予必要权限"
          type="info"
          :closable="false"
          show-icon
        />
      </div>
      
      <el-form :model="importForm" label-width="100px" class="import-form">
        <el-form-item label="群组ID:" required>
          <el-input 
            v-model="importForm.groupId"
            placeholder="请输入TG群组ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="群组类型:" required>
          <el-select v-model="importForm.groupType" placeholder="请选择群组类型" style="width: 100%">
            <el-option label="商户群" value="merchant" />
            <el-option label="上游群" value="upstream" />
            <el-option label="管理群" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定商户:">
          <el-select 
            v-model="importForm.merchantId"
            placeholder="请选择商户(可选)"
            filterable
            clearable
            style="width: 100%"
            :disabled="importForm.groupType !== 'merchant'"
          >
            <el-option 
              v-for="item in merchantOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"
            />
          </el-select>
          <div class="form-tip">若为商户群，建议选择关联商户</div>
        </el-form-item>
        <el-form-item label="备注:">
          <el-input 
            v-model="importForm.remark"
            type="textarea"
            :rows="2"
            placeholder="可选"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport" :loading="submitLoading">确定导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看日志弹窗 -->
    <el-dialog
      v-model="logDialogVisible"
      title="群组操作日志"
      width="700px"
      destroy-on-close
    >
      <div class="log-header">
        <div class="log-group-info">
          <h3>{{ currentLog.groupName }}</h3>
          <div class="log-id-info">
            <span>群组ID: {{ currentLog.groupId }}</span>
          </div>
        </div>
      </div>
      
      <el-divider content-position="center">操作历史</el-divider>
      
      <el-timeline>
        <el-timeline-item
          v-for="(log, index) in activityLogs"
          :key="index"
          :timestamp="log.time"
          :type="log.type"
          :hollow="index !== 0"
          :icon="log.type === 'success' ? Check : log.type === 'danger' ? Close : Info"
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowDown, 
  ArrowUp, 
  Search, 
  Refresh, 
  Filter, 
  FolderAdd,
  CircleClose,
  Check,
  Download, 
  Connection,
  View,
  Link,
  Document,
  UserFilled,
  MessageBox,
  Close,
  Info
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
  groupType: '',
  groupName: '',
  status: '',
  telegramId: '',
  merchantId: '',
  activityDate: ''
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

// 表格数据
const tableData = ref([
  {
    id: '1',
    groupName: 'VIP客户群',
    groupId: '111222333',
    groupType: '商户群',
    user: '张三 (@zhangsan, 123123123)',
    boundMerchant: '大客户商户A',
    lastActiveTime: '2023-10-27 10:00:00',
    msgCount: 326,
    status: '启用',
    createdTime: '2023-08-15 09:00:00',
    memberCount: 35,
    botPermissions: '读写消息、发起投票、删除消息',
  },
  {
    id: '2',
    groupName: '上游渠道A沟通群',
    groupId: '777888999',
    groupType: '上游群',
    user: '王五 (@wangwu, 789789789)',
    boundMerchant: '',
    lastActiveTime: '2023-10-27 09:00:00',
    msgCount: 128,
    status: '启用',
    createdTime: '2023-09-01 14:30:00',
    memberCount: 12,
    botPermissions: '读写消息',
  },
  {
    id: '3',
    groupName: '内部管理群',
    groupId: '000111222',
    groupType: '管理群',
    user: '赵六 (@zhaoliu, 012012012)',
    boundMerchant: '',
    lastActiveTime: '2023-10-26 18:00:00',
    msgCount: 452,
    status: '禁用',
    createdTime: '2023-07-20 11:15:00',
    memberCount: 8,
    botPermissions: '读写消息、管理成员、固定消息',
  }
])

// 群组成员数据
const groupMembers = ref([
  { nickname: '张三', telegramId: '123123123', role: 'admin', joinTime: '2023-08-15 09:00:00', msgCount: 156 },
  { nickname: '李四', telegramId: '456456456', role: 'moderator', joinTime: '2023-08-16 10:20:00', msgCount: 98 },
  { nickname: '王五', telegramId: '789789789', role: 'member', joinTime: '2023-08-17 14:30:00', msgCount: 72 }
])

// 活动日志数据
const activityLogs = ref([])

// 弹窗控制
const detailDialogVisible = ref(false)
const importDialogVisible = ref(false)
const logDialogVisible = ref(false)

// 当前查看的详情
const currentDetail = ref({})
const currentLog = ref({})

// 导入表单
const importForm = reactive({
  groupId: '',
  groupType: '',
  merchantId: '',
  remark: ''
})

// 监听表单类型变化，自动处理商户选择
watch(() => importForm.groupType, (newType) => {
  if (newType !== 'merchant') {
    importForm.merchantId = ''
  }
})

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

const handleToggleStatus = (row) => {
  const action = row.status === '启用' ? '禁用' : '启用'
  
  ElMessageBox.confirm(
    `确定要${action}该群组吗？`,
    `${action}确认`,
    {
      confirmButtonText: `确定${action}`,
      cancelButtonText: '取消',
      type: row.status === '启用' ? 'warning' : 'info',
    }
  ).then(() => {
    // 实际项目中这里需要调用API，这里只是模拟
    row.status = row.status === '启用' ? '禁用' : '启用'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

// 在详情弹窗中的状态切换
const handleToggleStatusInDialog = () => {
  const action = currentDetail.value.status === '启用' ? '禁用' : '启用'
  
  ElMessageBox.confirm(
    `确定要${action}该群组吗？`,
    `${action}确认`,
    {
      confirmButtonText: `确定${action}`,
      cancelButtonText: '取消',
      type: currentDetail.value.status === '启用' ? 'warning' : 'info',
    }
  ).then(() => {
    // 实际项目中这里需要调用API，这里只是模拟
    currentDetail.value.status = currentDetail.value.status === '启用' ? '禁用' : '启用'
    
    // 同步更新表格数据
    const targetRow = tableData.value.find(item => item.id === currentDetail.value.id)
    if (targetRow) {
      targetRow.status = currentDetail.value.status
    }
    
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleUnbind = (row) => {
  ElMessageBox.confirm(
    `确定要解除商户 "${row.boundMerchant}" 与群组 "${row.groupName}" 的关联吗？`,
    '解绑确认',
    {
      confirmButtonText: '确定解绑',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 实际项目中这里需要调用API，这里只是模拟
    row.boundMerchant = ''
    ElMessage.success('解绑成功')
  }).catch(() => {})
}

const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) return
  
  // 筛选出已启用的行
  const enabledRows = selectedRows.value.filter(row => row.status === '启用')
  if (enabledRows.length === 0) {
    ElMessage.warning('所选记录中没有可禁用的项')
    return
  }
  
  ElMessageBox.confirm(
    `确定要批量禁用选中的 ${enabledRows.length} 个群组吗？`,
    '批量禁用',
    {
      confirmButtonText: '确定禁用',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 实际项目中这里需要调用API，这里只是模拟
    enabledRows.forEach(row => {
      const targetRow = tableData.value.find(item => item.id === row.id)
      if (targetRow) {
        targetRow.status = '禁用'
      }
    })
    ElMessage.success(`已成功禁用 ${enabledRows.length} 个群组`)
  }).catch(() => {})
}

const handleBatchEnable = () => {
  if (selectedRows.value.length === 0) return
  
  // 筛选出已禁用的行
  const disabledRows = selectedRows.value.filter(row => row.status === '禁用')
  if (disabledRows.length === 0) {
    ElMessage.warning('所选记录中没有可启用的项')
    return
  }
  
  ElMessageBox.confirm(
    `确定要批量启用选中的 ${disabledRows.length} 个群组吗？`,
    '批量启用',
    {
      confirmButtonText: '确定启用',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    // 实际项目中这里需要调用API，这里只是模拟
    disabledRows.forEach(row => {
      const targetRow = tableData.value.find(item => item.id === row.id)
      if (targetRow) {
        targetRow.status = '启用'
      }
    })
    ElMessage.success(`已成功启用 ${disabledRows.length} 个群组`)
  }).catch(() => {})
}

const handleBatchUnbind = () => {
  if (selectedRows.value.length === 0) return
  
  // 筛选出已绑定商户的行
  const boundRows = selectedRows.value.filter(row => row.boundMerchant)
  if (boundRows.length === 0) {
    ElMessage.warning('所选记录中没有已绑定商户的群组')
    return
  }
  
  ElMessageBox.confirm(
    `确定要批量解绑选中的 ${boundRows.length} 个群组吗？`,
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
        targetRow.boundMerchant = ''
      }
    })
    ElMessage.success(`已成功解绑 ${boundRows.length} 个群组`)
  }).catch(() => {})
}

const handleViewDetail = (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

const handleViewLog = (row) => {
  // 保存当前日志查看的群组信息
  currentLog.value = row
  
  // 模拟加载日志数据
  activityLogs.value = [
    {
      time: '2023-10-15 10:30:00',
      content: `群组 "${row.groupName}" 被导入系统，类型：${row.groupType}`,
      type: 'primary'
    },
    {
      time: '2023-10-16 14:20:00',
      content: `群组 "${row.groupName}" 关联商户：${row.boundMerchant || '无'}`,
      type: 'success'
    },
    {
      time: '2023-10-16 14:25:30',
      content: '系统自动扫描群组成员信息',
      type: 'info'
    }
  ]
  
  // 如果状态是禁用，添加禁用记录
  if (row.status === '禁用') {
    activityLogs.value.unshift({
      time: '2023-10-26 18:10:00',
      content: `群组 "${row.groupName}" 被禁用，操作人：管理员`,
      type: 'danger'
    })
  }
  
  // 显示日志弹窗
  logDialogVisible.value = true
}

const handleImportGroup = () => {
  importDialogVisible.value = true
}

const confirmImport = () => {
  if (!importForm.groupId || !importForm.groupType) {
    ElMessage.warning('请填写必要的群组信息')
    return
  }
  
  submitLoading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 获取商户名称
    const merchant = importForm.merchantId ? merchantOptions.value.find(item => item.value === importForm.merchantId) : null
    
    // 生成新群组
    const newGroup = {
      id: Date.now().toString(),
      groupName: `新导入群组 (ID: ${importForm.groupId})`,
      groupId: importForm.groupId,
      groupType: importForm.groupType === 'merchant' ? '商户群' : importForm.groupType === 'upstream' ? '上游群' : '管理群',
      user: '',
      boundMerchant: merchant ? merchant.label : '',
      lastActiveTime: new Date().toLocaleString(),
      msgCount: 0,
      status: '启用',
      createdTime: new Date().toLocaleString(),
      memberCount: 0,
      botPermissions: '读写消息',
    }
    
    // 添加到表格数据
    tableData.value.unshift(newGroup)
    
    ElMessage.success('群组导入成功')
    submitLoading.value = false
    importDialogVisible.value = false
    
    // 重置表单
    Object.keys(importForm).forEach(key => {
      importForm[key] = ''
    })
  }, 1000)
}

const handleSendTestMessage = () => {
  ElMessage.success(`已向群组 ${currentDetail.value.groupName} 发送测试消息`)
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

.expand-icon {
  margin-left: 4px;
  transition: transform 0.3s;
}

.advanced-section {
  padding-top: 15px;
  border-top: 1px solid #e9e9eb;
  margin-top: 15px;
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

.group-name-cell,
.user-info-cell {
  cursor: pointer;
}

.merchant-cell .el-tag {
  cursor: default;
}

.el-button.is-text {
  padding: 8px;
}

.el-dropdown .el-button-group {
  vertical-align: middle;
}

.el-icon--left {
  margin-right: 4px;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-title {
  display: flex;
  align-items: center;
}

.detail-title h3 {
  margin: 0 10px 0 0;
  font-size: 16px;
}

.dialog-footer-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.import-notice {
  margin-bottom: 20px;
}

.import-form .el-form-item {
  margin-bottom: 18px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.log-header {
  margin-bottom: 20px;
}

.log-group-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
}

.log-id-info {
  color: #606266;
}
</style>
