<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-container">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="群发日期:">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 320px;"
          />
        </el-form-item>
        <el-form-item label="发起人TG ID:">
          <el-input v-model="filterForm.telegramId" placeholder="请输入发起人TG ID" style="width: 168px;" clearable />
        </el-form-item>
        <el-form-item label="执行状态:">
          <el-select v-model="filterForm.status" placeholder="请选择执行状态" style="width: 168px;" clearable>
            <el-option label="全部" value="" />
            <el-option label="成功" value="成功" />
            <el-option label="部分失败" value="部分失败" />
            <el-option label="全部失败" value="全部失败" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息类型:">
          <el-select v-model="filterForm.messageType" placeholder="请选择消息类型" style="width: 168px;" clearable>
            <el-option label="全部" value="" />
            <el-option label="文本" value="text" />
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="文件" value="file" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
          <el-button @click="resetForm" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 内容区 -->
    <el-card shadow="never" class="table-container">
    <!-- 操作栏 -->
    <div class="table-toolbar">
      <div class="table-toolbar-left">
        <el-button type="primary" @click="handleCreateTask" :icon="Plus">创建群发任务</el-button>
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
        height="calc(100vh - 420px)"
      >
        <el-table-column prop="taskId" label="任务ID" width="80" fixed="left" />
        <el-table-column prop="date" label="群发日期" width="180" sortable />
        <el-table-column prop="pusher" label="推送人（TG ID）" min-width="180" show-overflow-tooltip />
        <el-table-column prop="messageType" label="消息类型" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getMessageTypeTagType(row.messageType)" 
              size="small"
              effect="plain"
            >
              {{ row.messageType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="目标类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info" effect="plain">{{ row.targetType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalGroups" label="推送总数" width="100" align="center">
          <template #default="{ row }">
            <el-badge :value="row.totalGroups" :max="999" type="primary" />
          </template>
        </el-table-column>
        <el-table-column label="成功/失败" width="120">
          <template #default="{ row }">
            <div class="success-failure-count">
              <span class="success-count">{{ row.successCount }}</span>
              <span class="separator">/</span>
              <span class="failure-count">{{ row.failureCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === '成功' ? 'success' : (row.status === '部分失败' ? 'warning' : 'danger')"
              size="small"
              effect="dark"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时" width="100" align="center">
          <template #default="{ row }">
            {{ row.duration }}<span class="time-unit">秒</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button type="primary" size="small" text :icon="View" @click="handleViewDetail(row)">详情</el-button>
              <el-button 
                type="success" 
                size="small"
                text
                :icon="VideoPlay"
                @click="handleResend(row)"
                v-if="row.status !== '成功'"
              >
                重发
              </el-button>
              <el-button type="warning" size="small" text :icon="CopyDocument" @click="handleClone(row)">克隆</el-button>
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

    <!-- 创建群发任务弹窗 -->
    <el-dialog
      v-model="createTaskVisible"
      title="创建群发任务"
      width="650px"
      destroy-on-close
    >
      <el-form :model="taskForm" :rules="taskRules" label-width="100px" ref="taskFormRef" class="task-form">
        <el-form-item label="消息类型:" prop="messageType">
          <el-radio-group v-model="taskForm.messageType">
            <el-radio label="text">文本消息</el-radio>
            <el-radio label="image">图片消息</el-radio>
            <el-radio label="video">视频消息</el-radio>
            <el-radio label="file">文件消息</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="消息内容:" prop="messageContent">
          <el-input
            v-if="taskForm.messageType === 'text'"
            v-model="taskForm.messageContent"
            type="textarea"
            :rows="4"
            placeholder="请输入消息内容"
            maxlength="2000"
            show-word-limit
          />
          <el-upload
            v-else
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-exceed="() => ElMessage.warning('只能上传一个文件')"
          >
            <template #trigger>
              <el-button type="primary" :icon="Upload">选择{{ getUploadButtonText() }}</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                {{ getUploadTipText() }}
              </div>
            </template>
            <template #default="{ fileList }">
              <div v-if="fileList.length > 0" class="upload-list">
                <el-tag class="file-tag" type="info">
                  <el-icon class="file-icon"><Document /></el-icon>
                  {{ fileList[0].name }}
                  <span class="file-size" v-if="fileList[0].size">
                    ({{ (fileList[0].size / 1024).toFixed(1) }}KB)
                  </span>
                </el-tag>
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-divider content-position="left">推送目标</el-divider>
        
        <el-form-item label="目标类型:" prop="targetType">
          <el-radio-group v-model="taskForm.targetType">
            <el-radio label="all">所有群组</el-radio>
            <el-radio label="selected">指定群组</el-radio>
            <el-radio label="tagged">标签群组</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="选择群组:" prop="selectedGroups" v-if="taskForm.targetType === 'selected'">
          <el-select
            v-model="taskForm.selectedGroups"
            multiple
            filterable
            placeholder="请选择要推送的群组"
            style="width: 100%"
          >
            <el-option
              v-for="item in groupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div class="form-tip">已选择 {{ taskForm.selectedGroups.length }} 个群组</div>
        </el-form-item>
        
        <el-form-item label="选择标签:" prop="selectedTags" v-if="taskForm.targetType === 'tagged'">
          <el-select
            v-model="taskForm.selectedTags"
            multiple
            filterable
            placeholder="请选择要推送的群组标签"
            style="width: 100%"
          >
            <el-option
              v-for="item in tagOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div class="form-tip">已选择 {{ taskForm.selectedTags.length }} 个标签，估计覆盖 {{ getEstimatedGroupCount() }} 个群组</div>
        </el-form-item>
        
        <el-form-item label="发送时间:" prop="sendTimeType">
          <el-radio-group v-model="taskForm.sendTimeType">
            <el-radio label="now">立即发送</el-radio>
            <el-radio label="scheduled">定时发送</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="定时时间:" v-if="taskForm.sendTimeType === 'scheduled'" prop="scheduledTime">
          <el-date-picker
            v-model="taskForm.scheduledTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabledDate="disabledDate"
            :disabledTime="disabledTime"
          />
          <div class="form-tip">请选择未来的时间点</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createTaskVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCreateTask" :loading="submitLoading">确定创建</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`群发任务详情 - ${currentDetail.taskId || ''}`"
      width="700px"
      destroy-on-close
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID">{{ currentDetail.taskId }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentDetail.date }}</el-descriptions-item>
        <el-descriptions-item label="推送人">{{ currentDetail.pusher }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag 
            :type="currentDetail.status === '成功' ? 'success' : (currentDetail.status === '部分失败' ? 'warning' : 'danger')"
            size="small"
            effect="dark"
          >
            {{ currentDetail.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="消息类型">
          <el-tag 
            :type="getMessageTypeTagType(currentDetail.messageType)"
            size="small"
            effect="plain"
          >
            {{ currentDetail.messageType }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标类型">
          <el-tag type="info" size="small" effect="plain">{{ currentDetail.targetType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="推送总数">
          <el-badge :value="currentDetail.totalGroups" :max="999" type="primary" />
        </el-descriptions-item>
        <el-descriptions-item label="成功/失败">
          <span class="success-count">{{ currentDetail.successCount }}</span> / 
          <span class="failure-count">{{ currentDetail.failureCount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="执行耗时">{{ currentDetail.duration }}秒</el-descriptions-item>
        <el-descriptions-item label="消息大小">{{ currentDetail.messageSize || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">消息内容预览</el-divider>
      
      <div class="message-preview">
        <div v-if="currentDetail.messageType === '文本'" class="text-preview">
          {{ currentDetail.messageContent || '无文本内容' }}
        </div>
        <div v-else-if="currentDetail.messageType === '图片'" class="image-preview">
          <el-image 
            :src="currentDetail.messageContent" 
            fit="contain"
            style="max-width: 100%; max-height: 200px;"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <div>图片加载失败</div>
              </div>
            </template>
          </el-image>
        </div>
        <div v-else class="file-preview">
          <el-button type="primary" link :icon="Download">
            下载{{ currentDetail.messageType === '视频' ? '视频' : '文件' }}
          </el-button>
          <span class="file-name">{{ currentDetail.fileName || '未知文件名' }}</span>
        </div>
      </div>

      <el-divider content-position="left">推送结果</el-divider>
      
      <el-tabs v-model="resultTab" class="result-tabs">
        <el-tab-pane label="推送成功列表" name="success">
          <el-table :data="successList" border stripe style="width: 100%" max-height="300px">
            <el-table-column prop="groupName" label="群组名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="groupId" label="群组ID" width="120" />
            <el-table-column prop="sendTime" label="发送时间" width="180" />
          </el-table>
          <div v-if="successList.length === 0" class="empty-result">
            <el-empty description="暂无成功记录" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="推送失败列表" name="failure">
          <el-table :data="failureList" border stripe style="width: 100%" max-height="300px">
            <el-table-column prop="groupName" label="群组名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="groupId" label="群组ID" width="120" />
            <el-table-column prop="errorMsg" label="失败原因" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" text :icon="VideoPlay" @click="handleResendToGroup(row)">重发</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="failureList.length === 0" class="empty-result">
            <el-empty description="暂无失败记录" />
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            type="success" 
            :icon="VideoPlay"
            @click="handleResend(currentDetail)"
            v-if="currentDetail.status !== '成功' && failureList.length > 0"
          >
            重新发送失败项
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重发确认弹窗 -->
    <el-dialog
      v-model="resendDialogVisible"
      title="重新发送确认"
      width="500px"
      destroy-on-close
    >
      <div class="resend-info">
        <div class="resend-summary">
          <el-icon class="resend-icon"><Warning /></el-icon>
          <span>您将重新发送 <span class="highlight">{{ resendInfo.count }}</span> 条失败的消息</span>
        </div>
        <el-alert
          type="warning"
          :closable="false"
          show-icon
        >
          <p>重发任务将以新任务形式执行，您可以在任务列表中查看执行结果</p>
        </el-alert>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resendDialogVisible = false">取消</el-button>
          <el-button type="primary" :icon="VideoPlay" @click="confirmResend" :loading="submitLoading">确认重发</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Picture, 
  Download, 
  Filter, 
  Search, 
  Refresh, 
  Plus, 
  VideoPlay, 
  CopyDocument, 
  Document, 
  Upload, 
  View,
  Warning,
  MessageBox
} from '@element-plus/icons-vue'

// 筛选表单
const filterForm = reactive({
  dateRange: '',
  telegramId: '',
  status: '',
  messageType: ''
})

// 分页信息
const pagination = reactive({
  total: 5,
  currentPage: 1,
  pageSize: 10
})

// 表格加载状态
const tableLoading = ref(false)

// 提交加载状态
const submitLoading = ref(false)

// 弹窗控制
const createTaskVisible = ref(false)
const detailDialogVisible = ref(false)
const resendDialogVisible = ref(false)

// 详情结果标签页
const resultTab = ref('success')

// 表单引用
const taskFormRef = ref(null)

// 当前查看的详情
const currentDetail = ref({})

// 重发信息
const resendInfo = reactive({
  taskId: '',
  count: 0
})

// 群发任务表单
const taskForm = reactive({
  messageType: 'text',
  messageContent: '',
  targetType: 'all',
  selectedGroups: [],
  selectedTags: [],
  sendTimeType: 'now',
  scheduledTime: '',
  file: null
})

// 表单校验规则
const taskRules = {
  messageType: [
    { required: true, message: '请选择消息类型', trigger: 'change' }
  ],
  messageContent: [
    { required: true, message: '请输入消息内容', trigger: 'blur' }
  ],
  targetType: [
    { required: true, message: '请选择目标类型', trigger: 'change' }
  ],
  selectedGroups: [
    { required: true, message: '请选择群组', trigger: 'change', type: 'array' }
  ],
  selectedTags: [
    { required: true, message: '请选择标签', trigger: 'change', type: 'array' }
  ],
  scheduledTime: [
    { required: true, message: '请选择定时发送时间', trigger: 'change' }
  ]
}

// 群组选项
const groupOptions = ref([
  { value: '1', label: 'VIP客户群 (ID: 111222333)' },
  { value: '2', label: '普通客户群 (ID: 444555666)' },
  { value: '3', label: '商户交流群 (ID: 777888999)' }
])

// 标签选项
const tagOptions = ref([
  { value: '1', label: '客户群' },
  { value: '2', label: '上游群' },
  { value: '3', label: '管理群' },
  { value: '4', label: '重要群组' }
])

// 表格数据
const tableData = ref([
  {
    taskId: 'T001',
    date: '2023-10-27 15:30:00',
    pusher: 'admin (@admin, 12345)',
    messageType: '文本',
    targetType: '所有群组',
    totalGroups: 50,
    successCount: 48,
    failureCount: 2,
    status: '部分失败',
    duration: 12,
    messageContent: '这是一条测试群发消息，请各位注意查收！'
  },
  {
    taskId: 'T002',
    date: '2023-10-26 14:20:00',
    pusher: 'operator (@operator, 67890)',
    messageType: '图片',
    targetType: '指定群组',
    totalGroups: 100,
    successCount: 100,
    failureCount: 0,
    status: '成功',
    duration: 25,
    messageContent: 'https://example.com/image.jpg',
    messageSize: '256KB'
  },
  {
    taskId: 'T003',
    date: '2023-10-25 09:15:00',
    pusher: 'admin (@admin, 12345)',
    messageType: '文件',
    targetType: '标签群组',
    totalGroups: 30,
    successCount: 0,
    failureCount: 30,
    status: '全部失败',
    duration: 8,
    fileName: 'report.pdf',
    messageSize: '2.5MB'
  },
  {
    taskId: 'T004',
    date: '2023-10-24 16:45:00',
    pusher: 'manager (@manager, 55555)',
    messageType: '视频',
    targetType: '指定群组',
    totalGroups: 5,
    successCount: 3,
    failureCount: 2,
    status: '部分失败',
    duration: 45,
    fileName: 'demo.mp4',
    messageSize: '8.7MB'
  },
  {
    taskId: 'T005',
    date: '2023-10-23 11:30:00',
    pusher: 'admin (@admin, 12345)',
    messageType: '文本',
    targetType: '所有群组',
    totalGroups: 80,
    successCount: 78,
    failureCount: 2,
    status: '部分失败',
    duration: 15,
    messageContent: '系统维护通知：今晚22:00-23:00将进行系统升级，期间服务可能短暂不可用。'
  }
])

// 成功列表
const successList = ref([
  { groupName: 'VIP客户群', groupId: '111222333', sendTime: '2023-10-27 15:30:12' },
  { groupName: '普通客户群', groupId: '444555666', sendTime: '2023-10-27 15:30:15' },
  { groupName: '商户交流群', groupId: '777888999', sendTime: '2023-10-27 15:30:18' }
])

// 失败列表
const failureList = ref([
  { groupName: '测试群A', groupId: '123456789', errorMsg: '机器人权限不足', sendTime: '2023-10-27 15:30:20' },
  { groupName: '测试群B', groupId: '987654321', errorMsg: '群组不存在', sendTime: '2023-10-27 15:30:25' }
])

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

// 获取消息类型标签样式
const getMessageTypeTagType = (type) => {
  const map = {
    '文本': '',
    '图片': 'success',
    '视频': 'warning',
    '文件': 'info'
  }
  return map[type] || ''
}

// 获取上传按钮文本
const getUploadButtonText = () => {
  const map = {
    'image': '图片',
    'video': '视频',
    'file': '文件'
  }
  return map[taskForm.messageType] || '文件'
}

// 获取上传提示文本
const getUploadTipText = () => {
  const map = {
    'image': '支持JPG、PNG格式，大小不超过10MB',
    'video': '支持MP4格式，大小不超过50MB',
    'file': '支持PDF、DOC、XLS等格式，大小不超过20MB'
  }
  return map[taskForm.messageType] || '请上传文件'
}

// 处理文件上传
const handleFileChange = (file) => {
  taskForm.file = file.raw
}

// 处理创建任务
const handleCreateTask = () => {
  // 重置表单
  Object.keys(taskForm).forEach(key => {
    if (key === 'messageType') {
      taskForm[key] = 'text'
    } else if (key === 'targetType') {
      taskForm[key] = 'all'
    } else if (key === 'sendTimeType') {
      taskForm[key] = 'now'
    } else if (Array.isArray(taskForm[key])) {
      taskForm[key] = []
    } else {
      taskForm[key] = ''
    }
  })
  
  // 显示弹窗
  createTaskVisible.value = true
}

// 确认创建任务
const confirmCreateTask = () => {
  taskFormRef.value.validate((valid) => {
    if (!valid) return
    
    // 检查文件上传
    if (taskForm.messageType !== 'text' && !taskForm.file) {
      ElMessage.warning(`请上传${getUploadButtonText()}`)
      return
    }
    
    submitLoading.value = true
    
    // 模拟API请求延时
    setTimeout(() => {
      // 生成新任务ID
      const taskId = `T${String(Date.now()).substr(-6)}`
      
      // 生成新任务
      const newTask = {
        taskId,
        date: new Date().toLocaleString(),
        pusher: 'admin (@admin, 12345)',
        messageType: taskForm.messageType === 'text' ? '文本' : taskForm.messageType === 'image' ? '图片' : taskForm.messageType === 'video' ? '视频' : '文件',
        targetType: taskForm.targetType === 'all' ? '所有群组' : taskForm.targetType === 'selected' ? '指定群组' : '标签群组',
        totalGroups: taskForm.targetType === 'all' ? 80 : taskForm.targetType === 'selected' ? taskForm.selectedGroups.length : 30,
        successCount: 0,
        failureCount: 0,
        status: '待执行',
        duration: 0,
        messageContent: taskForm.messageType === 'text' ? taskForm.messageContent : '',
        fileName: taskForm.file ? taskForm.file.name : '',
        messageSize: taskForm.file ? `${(taskForm.file.size / 1024).toFixed(1)}KB` : '0KB'
      }
      
      // 添加到表格数据
      tableData.value.unshift(newTask)
      
      ElMessage.success('群发任务创建成功')
      submitLoading.value = false
      createTaskVisible.value = false
    }, 1000)
  })
}

// 处理查看详情
const handleViewDetail = (row) => {
  currentDetail.value = row
  
  // 模拟加载成功和失败列表
  if (row.status === '成功') {
    // 全部成功
    const total = row.totalGroups
    successList.value = Array.from({ length: Math.min(total, 5) }, (_, index) => ({
      groupName: `群组${index + 1}`,
      groupId: `${100000 + index}`,
      sendTime: row.date
    }))
    failureList.value = []
  } else if (row.status === '全部失败') {
    // 全部失败
    successList.value = []
    failureList.value = Array.from({ length: Math.min(row.totalGroups, 5) }, (_, index) => ({
      groupName: `群组${index + 1}`,
      groupId: `${200000 + index}`,
      errorMsg: index % 2 === 0 ? '机器人权限不足' : '群组不存在',
      sendTime: row.date
    }))
  } else {
    // 部分失败
    successList.value = Array.from({ length: Math.min(row.successCount, 3) }, (_, index) => ({
      groupName: `成功群组${index + 1}`,
      groupId: `${300000 + index}`,
      sendTime: row.date
    }))
    failureList.value = Array.from({ length: Math.min(row.failureCount, 2) }, (_, index) => ({
      groupName: `失败群组${index + 1}`,
      groupId: `${400000 + index}`,
      errorMsg: index % 2 === 0 ? '机器人权限不足' : '群组不存在',
      sendTime: row.date
    }))
  }
  
  // 显示弹窗
  detailDialogVisible.value = true
  
  // 默认显示第一个标签页
  resultTab.value = failureList.value.length > 0 ? 'failure' : 'success'
}

// 处理重发
const handleResend = (row) => {
  // 设置重发信息
  resendInfo.taskId = row.taskId
  resendInfo.count = row.failureCount
  
  // 显示弹窗
  resendDialogVisible.value = true
}

// 确认重发
const confirmResend = () => {
  submitLoading.value = true
  
  // 模拟API请求延时
  setTimeout(() => {
    ElMessage.success(`重发任务已创建，任务ID: RT${resendInfo.taskId}`)
    submitLoading.value = false
    resendDialogVisible.value = false
    
    // 关闭详情弹窗
    detailDialogVisible.value = false
  }, 1000)
}

// 处理单个群组重发
const handleResendToGroup = (row) => {
  ElMessage.success(`已重新发送消息到群组: ${row.groupName}`)
}

// 处理克隆任务
const handleClone = (row) => {
  // 关闭详情弹窗
  detailDialogVisible.value = false
  
  // 填充表单
  taskForm.messageType = row.messageType === '文本' ? 'text' : row.messageType === '图片' ? 'image' : row.messageType === '视频' ? 'video' : 'file'
  taskForm.messageContent = row.messageContent || ''
  taskForm.targetType = row.targetType === '所有群组' ? 'all' : row.targetType === '指定群组' ? 'selected' : 'tagged'
  taskForm.sendTimeType = 'now'
  
  // 显示创建弹窗
  createTaskVisible.value = true
  
  ElMessage.success(`已克隆任务 ${row.taskId} 的设置`)
}

// 导出数据
const handleExport = () => {
  ElMessage.success('数据导出成功')
}

// 获取估计的群组数量
const getEstimatedGroupCount = () => {
  if (taskForm.selectedTags.length === 0) return 0
  
  // 假设每个标签平均包含10个群组，实际项目中应该通过API获取
  return taskForm.selectedTags.length * 10
}

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 禁用过去的时间
const disabledTime = (date) => {
  if (date && date.toDateString() === new Date().toDateString()) {
    const now = new Date()
    return {
      hours: Array.from({ length: now.getHours() }, (_, i) => i),
      minutes: date && date.getHours() === now.getHours() ? Array.from({ length: now.getMinutes() }, (_, i) => i) : [],
      seconds: date && date.getHours() === now.getHours() && date.getMinutes() === now.getMinutes() ? Array.from({ length: now.getSeconds() }, (_, i) => i) : []
    }
  }
  return {
    hours: [],
    minutes: [],
    seconds: []
  }
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

.success-failure-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}
.success-count {
  color: #67c23a;
}
.failure-count {
  color: #f56c6c;
}
.separator {
  color: #dcdfe6;
}

.time-unit {
  font-size: 12px;
  color: #909399;
  margin-left: 2px;
}

.task-form .el-form-item {
  margin-bottom: 22px;
}

.upload-demo {
  width: 100%;
}

.upload-list {
  margin-top: 8px;
}

.file-tag {
  display: inline-flex;
  align-items: center;
}
.file-icon {
  margin-right: 6px;
}
.file-size {
  color: #909399;
  margin-left: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  line-height: 1.4;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-content-box {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e9e9eb;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.target-groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}
</style>
