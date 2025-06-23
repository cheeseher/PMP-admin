<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-container">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="指令关键词:">
          <el-input v-model="filterForm.keyword" placeholder="请输入指令关键词" style="width: 168px;" clearable></el-input>
        </el-form-item>
        <el-form-item label="操作类型:">
          <el-select v-model="filterForm.operationType" placeholder="请选择操作类型" style="width: 168px;" filterable clearable>
            <el-option label="修改金额" value="修改金额"></el-option>
            <el-option label="撤销订单" value="撤销订单"></el-option>
            <el-option label="查询余额" value="查询余额"></el-option>
            <el-option label="调整费率" value="调整费率"></el-option>
            <el-option label="绑定商户" value="绑定商户"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执行结果:">
          <el-select v-model="filterForm.executionResult" placeholder="请选择执行结果" style="width: 168px;" clearable>
            <el-option label="成功" value="成功"></el-option>
            <el-option label="失败" value="失败"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间:">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px;"
          />
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
          <el-form :inline="true" :model="filterForm" class="filter-form advanced-form">
            <el-form-item label="用户TG ID:">
              <el-input v-model="filterForm.telegramId" placeholder="请输入用户TG ID" style="width: 168px;" clearable></el-input>
            </el-form-item>
            <el-form-item label="群组ID:">
              <el-input v-model="filterForm.groupId" placeholder="请输入群组ID" style="width: 168px;" clearable></el-input>
            </el-form-item>
            <el-form-item label="危险等级:">
              <el-select v-model="filterForm.riskLevel" placeholder="请选择危险等级" style="width: 168px;" clearable>
                <el-option label="高危" value="high"></el-option>
                <el-option label="中危" value="medium"></el-option>
                <el-option label="低危" value="low"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="执行耗时:">
              <el-select v-model="filterForm.executionTime" placeholder="请选择耗时范围" style="width: 168px;" clearable>
                <el-option label="0-1秒" value="0-1"></el-option>
                <el-option label="1-3秒" value="1-3"></el-option>
                <el-option label="3秒以上" value="3+"></el-option>
              </el-select>
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
        <el-space>
          <el-button type="primary" plain @click="handleBatchExport" :disabled="!selectedRows.length" :icon="Download">
            批量导出
            <template #default v-if="selectedRows.length">({{ selectedRows.length }})</template>
          </el-button>
          <el-button type="danger" plain @click="handleBatchDelete" :disabled="!selectedRows.length" :icon="Delete">
            批量删除
            <template #default v-if="selectedRows.length">({{ selectedRows.length }})</template>
          </el-button>
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
        highlight-current-row
      >
        <el-table-column type="selection" width="45" fixed="left" />
        <el-table-column prop="originalCommand" label="指令原文" min-width="200" show-overflow-tooltip fixed="left"></el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="getOperationTypeTag(row.operationType)"
              effect="plain"
              size="small"
            >
              {{ row.operationType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="merchant" label="商户/渠道" width="120"></el-table-column>
        <el-table-column prop="user" label="用户信息" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="user-cell">
              <el-tooltip effect="dark" :content="row.user" placement="top">
                <span>{{ row.user }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="group" label="群组信息" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="group-cell">
              <el-tooltip effect="dark" :content="row.group" placement="top">
                <span>{{ row.group }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="executionTime" label="执行时间" width="150" sortable></el-table-column>
        <el-table-column prop="executionDuration" label="执行耗时" width="100" sortable>
          <template #default="{ row }">
            <span :class="getDurationClass(row.executionDuration)">{{ row.executionDuration }}ms</span>
          </template>
        </el-table-column>
        <el-table-column prop="executionResult" label="执行结果" width="90">
          <template #default="{ row }">
            <el-tag :type="row.executionResult === '成功' ? 'success' : 'danger'" size="small">
              {{ row.executionResult }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="危险等级" width="90">
          <template #default="{ row }">
            <el-tag 
              :type="row.riskLevel === 'high' ? 'danger' : row.riskLevel === 'medium' ? 'warning' : 'info'"
              :effect="row.riskLevel === 'high' ? 'dark' : 'light'"
              size="small"
            >
              {{ getRiskLevelText(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button type="primary" size="small" @click="handleViewDetail(row)" text :icon="View">查看</el-button>
              <el-button 
                type="success" 
                size="small"
                text
                :icon="VideoPlay"
                @click="handleReplay(row)"
                v-if="row.executionResult === '失败' && row.canReplay"
              >重放</el-button>
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

    <!-- 指令详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="指令详情"
      width="700px"
      destroy-on-close
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="指令原文" :span="2">
          <div class="command-code">{{ currentDetail.originalCommand }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag 
            :type="getOperationTypeTag(currentDetail.operationType)"
            effect="plain"
          >
            {{ currentDetail.operationType }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行结果">
          <el-tag :type="currentDetail.executionResult === '成功' ? 'success' : 'danger'">
            {{ currentDetail.executionResult }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="商户/渠道">{{ currentDetail.merchant }}</el-descriptions-item>
        <el-descriptions-item label="执行耗时">
          <span :class="getDurationClass(currentDetail.executionDuration)">
            {{ currentDetail.executionDuration }}ms
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="危险等级">
          <el-tag 
            :type="currentDetail.riskLevel === 'high' ? 'danger' : currentDetail.riskLevel === 'medium' ? 'warning' : 'info'"
            :effect="currentDetail.riskLevel === 'high' ? 'dark' : 'light'"
          >
            {{ getRiskLevelText(currentDetail.riskLevel) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行时间">{{ currentDetail.executionTime }}</el-descriptions-item>
        <el-descriptions-item label="用户信息" :span="2">{{ currentDetail.user }}</el-descriptions-item>
        <el-descriptions-item label="群组信息" :span="2">{{ currentDetail.group }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="center">操作轨迹</el-divider>
      
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in currentDetail.activities"
          :key="index"
          :type="activity.status === 'success' ? 'success' : activity.status === 'warning' ? 'warning' : activity.status === 'error' ? 'danger' : 'primary'"
          :timestamp="activity.timestamp"
          :hollow="activity.hollow"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleReplay(currentDetail)" v-if="currentDetail.executionResult === '失败' && currentDetail.canReplay">
            重新执行
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重放确认弹窗 -->
    <el-dialog
      v-model="replayDialogVisible"
      title="重新执行确认"
      width="500px"
      destroy-on-close
    >
      <div class="replay-warning">
        <el-alert
          title="您即将重新执行以下指令，请确认操作安全性"
          type="warning"
          :closable="false"
          show-icon
        />
        <div class="command-box">
          <pre>{{ replayCommand }}</pre>
        </div>
        <el-alert
          title="该操作将在系统中产生真实影响，请确认重放安全。"
          type="warning"
          :closable="false"
          show-icon
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replayDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReplay">确认重放</el-button>
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
  Download, 
  Delete, 
  List,
  View,
  VideoPlay
} from '@element-plus/icons-vue'

// 是否显示高级筛选
const showAdvanced = ref(false)

// 筛选表单
const filterForm = reactive({
  keyword: '',
  operationType: '',
  executionResult: '',
  dateRange: '',
  telegramId: '',
  groupId: '',
  riskLevel: '',
  executionTime: ''
})

// 分页信息
const pagination = reactive({
  total: 100,
  currentPage: 1,
  pageSize: 10
})

// 表格加载状态
const tableLoading = ref(false)

// 选中的行
const selectedRows = ref([])

// 表格数据
const tableData = ref([
  {
    id: '1001',
    originalCommand: '修改金额#ORD12345#5000',
    operationType: '修改金额',
    merchant: '测试商户A',
    user: 'John Doe (@johndoe, 123456789)',
    group: '官方一群 (ID: 987654321)',
    executionTime: '2023-10-27 10:30:00',
    executionDuration: 230,
    executionResult: '成功',
    isSensitive: true,
    riskLevel: 'high',
    canReplay: true,
    activities: [
      { content: '接收到指令', timestamp: '10:30:00', status: 'primary' },
      { content: '指令解析完成', timestamp: '10:30:00', status: 'primary' },
      { content: '权限验证通过', timestamp: '10:30:00', status: 'success' },
      { content: '执行金额修改操作', timestamp: '10:30:00', status: 'success' },
      { content: '数据库更新成功', timestamp: '10:30:00', status: 'success' },
      { content: '推送执行结果到原群组', timestamp: '10:30:00', status: 'success' }
    ]
  },
  {
    id: '1002',
    originalCommand: '撤销订单#ORD54321',
    operationType: '撤销订单',
    merchant: '渠道B',
    user: 'Jane Smith (@janesmith, 987654321)',
    group: '合作商户群 (ID: 123456789)',
    executionTime: '2023-10-27 11:00:00',
    executionDuration: 1500,
    executionResult: '失败',
    isSensitive: true,
    riskLevel: 'high',
    canReplay: true,
    activities: [
      { content: '接收到指令', timestamp: '11:00:00', status: 'primary' },
      { content: '指令解析完成', timestamp: '11:00:01', status: 'primary' },
      { content: '权限验证通过', timestamp: '11:00:01', status: 'success' },
      { content: '查询订单状态', timestamp: '11:00:02', status: 'warning' },
      { content: '订单状态不允许撤销', timestamp: '11:00:02', status: 'error' },
      { content: '推送失败结果到原群组', timestamp: '11:00:02', status: 'primary' }
    ]
  },
  {
    id: '1003',
    originalCommand: '查询余额',
    operationType: '查询余额',
    merchant: '测试商户C',
    user: 'Alice (@alice, 112233445)',
    group: '官方二群 (ID: 556677889)',
    executionTime: '2023-10-27 14:20:00',
    executionDuration: 120,
    executionResult: '成功',
    isSensitive: false,
    riskLevel: 'low',
    canReplay: true,
    activities: [
      { content: '接收到指令', timestamp: '14:20:00', status: 'primary' },
      { content: '指令解析完成', timestamp: '14:20:00', status: 'primary' },
      { content: '权限验证通过', timestamp: '14:20:00', status: 'success' },
      { content: '查询商户余额', timestamp: '14:20:00', status: 'success' },
      { content: '推送余额信息到原群组', timestamp: '14:20:00', status: 'success' }
    ]
  }
])

// 弹窗控制
const detailDialogVisible = ref(false)
const replayDialogVisible = ref(false)
const currentDetail = ref({})
const replayCommand = ref('')

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

const handleViewDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

const handleReplay = (row) => {
  currentDetail.value = row
  replayCommand.value = row.originalCommand
  replayDialogVisible.value = true
}

const confirmReplay = () => {
  ElMessage.success('指令重放已提交，请等待执行结果')
  replayDialogVisible.value = false
}

const handleExport = () => {
  ElMessage.success('数据导出成功')
}

const handleBatchExport = () => {
  ElMessage.success(`已选择${selectedRows.value.length}条记录，导出成功`)
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的${selectedRows.value.length}条记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 工具函数
const getRiskLevelText = (level) => {
  const map = {
    high: '高危',
    medium: '中危',
    low: '低危'
  }
  return map[level] || '未知'
}

const getDurationClass = (duration) => {
  if (duration > 1000) return 'text-danger'
  if (duration > 500) return 'text-warning'
  return 'text-success'
}

const getOperationTypeTag = (type) => {
  const map = {
    '修改金额': 'danger',
    '撤销订单': 'warning',
    '查询余额': 'info',
    '调整费率': 'warning',
    '绑定商户': 'success'
  }
  return map[type] || 'info'
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

.user-cell,
.group-cell {
  cursor: pointer;
}

.duration-high {
  color: #f56c6c;
  font-weight: bold;
}
.duration-medium {
  color: #e6a23c;
}

.command-code {
  background-color: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  color: #303133;
  word-break: break-all;
  border: 1px solid #e9e9eb;
}

.el-dialog .el-descriptions {
  margin-bottom: 20px;
}

.replay-warning {
  padding: 10px 0;
}

.command-box {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
  margin: 12px 0;
  font-family: monospace;
  border: 1px solid #e4e7ed;
}

.replay-warning {
  padding: 10px 0;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}

.text-warning {
  color: #e6a23c;
}

.text-success {
  color: #67c23a;
}

.user-cell, .group-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
