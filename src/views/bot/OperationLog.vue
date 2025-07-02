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
        <el-table-column label="用户发送指令" min-width="200">
          <template #default="{ row }">
            <div class="command-content">
              <div 
                v-if="row.imageUrl" 
                class="image-placeholder"
                style="width: 60px; height: 60px; margin-right: 10px; cursor: pointer;"
                @click="previewImage(row.imageUrl)"
              >图片</div>
              <span>{{ row.specificAction }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="botInvolved" label="关联机器人" width="150" />
        <el-table-column label="所属群组" width="180">
          <template #default="{ row }">
            <div v-if="row.groupInvolved !== '多个群组'" class="group-info">
              <div>{{ row.groupInvolved }}</div>
              <div class="text-secondary">ID: {{ row.groupId }}</div>
              <el-tag 
                :type="row.groupType === 'upstream' ? 'success' : 'primary'"
                size="small"
                class="group-tag"
              >
                {{ row.groupType === 'upstream' ? '上游群' : '商户群' }}
              </el-tag>
            </div>
            <span v-else>{{ row.groupInvolved }}</span>
          </template>
        </el-table-column>
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
    
    <!-- 图片预览 -->
    <div v-if="showImageViewer">
      <el-image-viewer
        :url-list="[previewImageUrl]"
        :hide-on-click-modal="true"
        @close="showImageViewer = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';
import { ElImageViewer } from 'element-plus';

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

// 图片预览相关
const showImageViewer = ref(false);
const previewImageUrl = ref('');

// 预览图片
const previewImage = (url) => {
  previewImageUrl.value = url;
  showImageViewer.value = true;
};

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
  { userTgName: '张三', userTgId: '123456789', specificAction: 'ZF20231027001', imageUrl: 'https://via.placeholder.com/300/409EFF/FFFFFF?text=支付图片', botInvolved: '机器人A', groupInvolved: '闪电', groupType: 'upstream', groupId: '-100123456789', botFeedback: '此处转发上游群回复的内容', operationTime: '2023-10-27 10:00:00' },
  { userTgName: '张三', userTgId: '123456789', specificAction: 'jcbdqd#闪电', botInvolved: '机器人A', groupInvolved: '闪电', groupType: 'upstream', groupId: '-100123456789', botFeedback: '解除绑定【闪电】渠道成功！', operationTime: '2023-10-27 10:05:00' },
  { userTgName: '李四', userTgId: '987654321', specificAction: '渠道余额#纵横#+0.01', botInvolved: '机器人A', groupInvolved: '纵横', groupType: 'upstream', groupId: '-100323456789', botFeedback: '========渠道【纵横】设置预付========\n变动前：0.00\n变动金额：0.01\n变动后：0.01\n供应商余额：0.01\n【渠道余额#纵横#+0.01】操作人TG：李四 @lisi\n========设置预付完毕========', operationTime: '2023-10-27 10:10:00' },
  { userTgName: '王五', userTgId: '123456789', specificAction: '商户费率', botInvolved: '机器人A', groupInvolved: '商户B', groupType: 'merchant', groupId: '-100423456789', botFeedback: '商户【商户B】支付产品费率: \n支付产品名称：微信支付,支付产品编码：WXPAY,商户费率：0.6%\n支付产品名称：支付宝,支付产品编码：ALIPAY,商户费率：0.7%', operationTime: '2023-10-27 10:15:00' },
  { userTgName: '赵六', userTgId: '123456789', specificAction: '商户余额#商户A#-0.01', botInvolved: '机器人A', groupInvolved: '商户A', groupType: 'merchant', groupId: '-100223456789', botFeedback: '========商户【测测】设置预付========\n变动前：0.01\n变动金额：0.01\n变动后：0.00\n商户余额：0.00\n【余额#测测#-0.01】操作人TG：TG 用户名 @用户名\n========设置预付完毕========', operationTime: '2023-10-27 10:20:00' },
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
.command-content {
  display: flex;
  align-items: center;
}
.image-placeholder {
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 12px;
  background-color: #409EFF;
}
.group-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.group-tag {
  width: fit-content;
  margin-top: 3px;
}
</style> 