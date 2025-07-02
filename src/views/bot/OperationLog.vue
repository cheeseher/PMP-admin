<!-- 机器人管理/操作记录 -->
<template>
  <div class="operation-log-container">
    <!-- 筛选表单 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="TG名称：">
          <el-input v-model="filterForm.tgName" placeholder="请输入用户TG名称" clearable />
        </el-form-item>
        <el-form-item label="TGID：">
          <el-input v-model="filterForm.tgId" placeholder="请输入用户TGID" clearable />
        </el-form-item>
        <el-form-item label="所属群组：">
          <el-select
            v-model="filterForm.groups"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择群组"
            style="width: 240px"
            clearable
          >
            <el-option
              v-for="item in groupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联机器人：">
          <el-select
            v-model="filterForm.bots"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择机器人"
            style="width: 240px"
            clearable
          >
            <el-option
              v-for="item in botOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间：">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据展示 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column label="用户信息" width="200">
          <template #default="{ row }">
            <div>
              <div>{{ row.userTgName }}</div>
              <div class="text-secondary">ID: {{ row.userTgId }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="specificAction" label="用户发送指令" min-width="200" />
        <el-table-column prop="botInvolved" label="关联机器人" width="150" />
        <el-table-column prop="groupInvolved" label="所属群组" width="150" />
        <el-table-column label="机器人反馈" min-width="200">
          <template #default="{ row }">
            <div class="feedback-cell">
              <span class="feedback-content">{{ truncateFeedback(row.botFeedback) }}</span>
              <el-button 
                v-if="row.botFeedback && row.botFeedback.length > 30" 
                type="primary" 
                link 
                @click="showFullFeedback(row.botFeedback)"
              >
                查看
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="操作时间" width="180" />
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 反馈详情弹窗 -->
    <el-dialog
      v-model="feedbackDialogVisible"
      title="机器人反馈详情"
      width="500px"
    >
      <div class="feedback-detail">{{ currentFeedback }}</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';

// 筛选表单
const filterForm = reactive({
  tgName: '',
  tgId: '',
  groups: [],
  bots: [],
  dateRange: [],
});

// 群组选项
const groupOptions = ref([
  { value: 'group1', label: '闪电' },
  { value: 'group2', label: '纵横' },
  { value: 'group3', label: '商户A' },
  { value: 'group4', label: '商户B' },
]);

// 机器人选项
const botOptions = ref([
  { value: 'bot1', label: '机器人A' },
  { value: 'bot2', label: '机器人B' },
]);

const loading = ref(false);
const tableData = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 反馈详情相关
const feedbackDialogVisible = ref(false);
const currentFeedback = ref('');

// 截断反馈内容
const truncateFeedback = (feedback) => {
  if (!feedback) return '';
  return feedback.length > 30 ? feedback.substring(0, 30) + '...' : feedback;
};

// 显示完整反馈
const showFullFeedback = (feedback) => {
  currentFeedback.value = feedback;
  feedbackDialogVisible.value = true;
};

// 模拟数据
const mockLogData = [
  { userTgName: 'AdminUser', userTgId: '123456789', specificAction: '/create_bot 支付机器人', botInvolved: '机器人A', groupInvolved: 'N/A', botFeedback: '机器人创建成功', operationTime: '2023-10-27 10:00:00' },
  { userTgName: 'AdminUser', userTgId: '123456789', specificAction: '/bind_supplier 供应商A 供应商B', botInvolved: '机器人A', groupInvolved: '闪电', botFeedback: '供应商 [供应商A, 供应商B] 绑定成功', operationTime: '2023-10-27 10:05:00' },
  { userTgName: 'EditorUser', userTgId: '987654321', specificAction: '/edit_command start', botInvolved: '机器人B', groupInvolved: 'N/A', botFeedback: '指令 /start 更新成功', operationTime: '2023-10-27 10:10:00' },
  { userTgName: 'AdminUser', userTgId: '123456789', specificAction: '/delete_role 测试角色', botInvolved: 'N/A', groupInvolved: 'N/A', botFeedback: '角色 [测试角色] 已被删除', operationTime: '2023-10-27 10:15:00' },
  { userTgName: 'AdminUser', userTgId: '123456789', specificAction: '/edit_group 商户A', botInvolved: '机器人A', groupInvolved: '商户A', botFeedback: '群组信息更新完毕', operationTime: '2023-10-27 10:20:00' },
  { userTgName: 'AdminUser', userTgId: '123456789', specificAction: '/batch_update 配置 --all-groups', botInvolved: '机器人A', groupInvolved: '多个群组', botFeedback: '更新成功。共处理了27个群组的配置信息，其中25个更新成功，2个因权限不足更新失败。失败的群组ID为：-10023456789和-10098765432。请检查机器人在这些群组中的权限并重试。', operationTime: '2023-10-27 11:20:00' },
];

const loadTableData = () => {
  loading.value = true;
  setTimeout(() => {
    tableData.value = mockLogData;
    pagination.total = mockLogData.length;
    loading.value = false;
  }, 500);
};

const handleSearch = () => {
  loadTableData();
};

const resetFilter = () => {
  filterForm.tgName = '';
  filterForm.tgId = '';
  filterForm.groups = [];
  filterForm.bots = [];
  filterForm.dateRange = [];
  handleSearch();
};

const handleSizeChange = (val) => {
  pagination.pageSize = val;
  loadTableData();
};

const handleCurrentChange = (val) => {
  pagination.currentPage = val;
  loadTableData();
};

onMounted(() => {
  loadTableData();
});
</script>

<style scoped>
.operation-log-container {
  padding: 20px;
}
.filter-card {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.text-secondary {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.feedback-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.feedback-content {
  flex: 1;
}
.feedback-detail {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  max-height: 400px;
  overflow-y: auto;
}
</style> 