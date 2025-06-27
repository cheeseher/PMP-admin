<!-- 机器人管理/操作记录 -->
<template>
  <div class="operation-log-container">
    <!-- 筛选表单 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="操作人：">
          <el-input v-model="filterForm.operator" placeholder="请输入操作人" clearable />
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
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="specificAction" label="具体操作" min-width="200" />
        <el-table-column prop="botInvolved" label="调用机器人" width="150" />
        <el-table-column prop="groupInvolved" label="关联群组" width="150" />
        <el-table-column prop="botFeedback" label="机器人反馈" min-width="200" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';

// 筛选表单
const filterForm = reactive({
  operator: '',
  dateRange: [],
});

const loading = ref(false);
const tableData = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 模拟数据
const mockLogData = [
  { operator: 'admin', specificAction: '创建了一个新的机器人', botInvolved: '官方支付机器人', groupInvolved: 'N/A', botFeedback: '机器人创建成功', operationTime: '2023-10-27 10:00:00' },
  { operator: 'admin', specificAction: '为群组绑定供应商', botInvolved: '官方支付机器人', groupInvolved: '官方支付一群', botFeedback: '供应商 [供应商A, 供应商B] 绑定成功', operationTime: '2023-10-27 10:05:00' },
  { operator: 'editor', specificAction: '修改了指令的回复内容', botInvolved: '业务通知机器人', groupInvolved: 'N/A', botFeedback: '指令 /start 更新成功', operationTime: '2023-10-27 10:10:00' },
  { operator: 'admin', specificAction: '删除了一个机器人角色', botInvolved: 'N/A', groupInvolved: 'N/A', botFeedback: '角色 [测试角色] 已被删除', operationTime: '2023-10-27 10:15:00' },
  { operator: 'admin', specificAction: '修改群组信息', botInvolved: '官方支付机器人', groupInvolved: 'VIP商户对接群', botFeedback: '群组信息更新完毕', operationTime: '2023-10-27 10:20:00' },
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
  filterForm.operator = '';
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
</style> 