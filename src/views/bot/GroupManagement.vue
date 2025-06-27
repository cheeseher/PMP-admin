<!-- 机器人管理/群组管理 - 管理机器人所在的所有群组 -->
<template>
  <div class="group-management-container">
    <!-- 筛选表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="filterForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="群组名称：">
            <el-input 
              v-model="filterForm.groupName" 
              placeholder="请输入群组名称或ID" 
              clearable 
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="群组类型：">
            <el-select v-model="filterForm.groupType" placeholder="请选择类型" clearable style="width: 168px">
              <el-option label="全部" value="" />
              <el-option label="上游群" value="upstream" />
              <el-option label="商户群" value="merchant" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联机器人：">
            <el-select v-model="filterForm.botId" placeholder="请选择机器人" clearable style="width: 168px">
              <el-option label="全部" value="" />
              <el-option 
                v-for="bot in botOptions" 
                :key="bot.id" 
                :label="bot.name" 
                :value="bot.id"
              />
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
        <el-table-column prop="groupId" label="群组ID" min-width="150" />
        <el-table-column prop="groupName" label="群组名称" min-width="150" />
        <el-table-column prop="groupLink" label="TG群链接" min-width="180">
            <template #default="{ row }">
                <el-link :href="row.groupLink" type="primary" target="_blank" :underline="false">{{ row.groupLink }}</el-link>
            </template>
        </el-table-column>
        <el-table-column prop="groupType" label="群组类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.groupType === 'upstream' ? 'success' : 'primary'">
              {{ row.groupType === 'upstream' ? '上游群' : '商户群' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="群组人数" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openMemberListDialog(row)">{{ row.memberCount }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="供应商绑定" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openBoundSuppliersDialog(row)">
              {{ row.boundSuppliers ? row.boundSuppliers.length : 0 }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="associatedBot" label="关联机器人" min-width="150" />
        <el-table-column fixed="right" label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openBindSupplierDialog(row)">绑定供应商</el-button>
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

    <!-- 群组成员列表对话框 -->
    <el-dialog
      v-model="memberListDialogVisible"
      title="群组成员列表"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentGroupForMembers" style="margin-bottom: 16px;">
          <strong>群组: {{ currentGroupForMembers.groupName }} ({{ currentGroupForMembers.groupId }})</strong>
      </div>
      <el-table :data="memberListData" border stripe v-loading="memberListLoading">
        <el-table-column prop="userTgId" label="用户TGID" />
        <el-table-column prop="userNickname" label="用户昵称" />
      </el-table>
      <template #footer>
        <el-button @click="memberListDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 已绑定供应商列表对话框 -->
    <el-dialog
      v-model="boundSuppliersDialogVisible"
      title="已绑定供应商列表"
      width="700px"
      destroy-on-close
    >
        <div v-if="currentGroupForBinding" style="margin-bottom: 16px;">
            <strong>群组: {{ currentGroupForBinding.groupName }} ({{ currentGroupForBinding.groupId }})</strong>
        </div>
        <el-table :data="currentGroupForBinding.boundSuppliers" border stripe>
            <el-table-column prop="id" label="供应商ID" />
            <el-table-column prop="name" label="供应商名称" />
            <el-table-column prop="template" label="模板">
              <template #default="{ row }">
                  <el-tag type="info">{{ row.template }}</el-tag>
              </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-button @click="boundSuppliersDialogVisible = false">关闭</el-button>
        </template>
    </el-dialog>

    <!-- 绑定供应商对话框 -->
    <el-dialog
      v-model="bindSupplierDialogVisible"
      title="绑定供应商"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentGroupForBinding" style="margin-bottom: 20px;">
          <p><strong>群组名称:</strong> {{ currentGroupForBinding.groupName }}</p>
          <p><strong>群组ID:</strong> {{ currentGroupForBinding.groupId }}</p>
      </div>
      <el-form ref="bindSupplierFormRef" :model="bindSupplierForm" label-width="100px">
        <el-form-item label="选择供应商" prop="supplierIds">
          <el-select
            v-model="bindSupplierForm.supplierIds"
            multiple
            filterable
            placeholder="请选择要绑定的供应商"
            style="width: 100%;"
          >
            <el-option
              v-for="supplier in supplierOptions"
              :key="supplier.id"
              :label="supplier.name"
              :value="supplier.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bindSupplierDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSupplierBinding">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';

// 筛选表单
const filterForm = reactive({
  groupName: '',
  groupType: '',
  botId: '',
});

// 模拟机器人选项
const botOptions = ref([
  { id: 1, name: '官方支付机器人' },
  { id: 2, name: '业务通知机器人' },
]);

// 表格数据
const loading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 群组成员列表对话框
const memberListDialogVisible = ref(false);
const memberListLoading = ref(false);
const currentGroupForMembers = ref(null);
const memberListData = ref([]);

// 已绑定供应商列表对话框
const boundSuppliersDialogVisible = ref(false);

// 绑定供应商对话框
const bindSupplierDialogVisible = ref(false);
const bindSupplierLoading = ref(false);
const currentGroupForBinding = ref(null);
const bindSupplierFormRef = ref(null);
const bindSupplierForm = reactive({
  supplierIds: [],
});

// 模拟供应商选项
const supplierOptions = ref([
    { id: 'S001', name: '供应商A' },
    { id: 'S002', name: '供应商B' },
    { id: 'S003', name: '供应商C' },
    { id: 'S004', name: '供应商D' },
]);

// 模拟成员数据
const mockMemberData = {
    '-1001234567890': [
        { userTgId: '123456789', userNickname: '张三' },
        { userTgId: '987654321', userNickname: '李四' },
    ],
    '-1009876543211': [
        { userTgId: '112233445', userNickname: '王五' },
    ],
};

// 模拟数据加载
const loadTableData = () => {
  loading.value = true;
  setTimeout(() => {
    const mockData = [
      { id: 1, groupId: '-1001234567890', groupName: '官方支付一群', groupLink: 'https://t.me/group1', groupType: 'upstream', memberCount: 1024, associatedBot: '官方支付机器人', associatedRole: '上游群角色', boundSuppliers: [
          { id: 'S001', name: '供应商A', template: '熊猫' },
          { id: 'S002', name: '供应商B', template: '纵横' },
      ]},
      { id: 2, groupId: '-1009876543211', groupName: 'VIP商户对接群', groupLink: 'https://t.me/group2', groupType: 'merchant', memberCount: 50, associatedBot: '业务通知机器人', associatedRole: '商户群角色', boundSuppliers: [
          { id: 'S003', name: '供应商C', template: '闪电' },
      ]},
      { id: 3, groupId: '-1001122334455', groupName: '内部测试反馈群', groupLink: 'https://t.me/group3', groupType: 'merchant', memberCount: 23, associatedBot: '官方支付机器人', associatedRole: '管理员角色', boundSuppliers: []},
    ];
    tableData.value = mockData;
    total.value = mockData.length;
    loading.value = false;
  }, 500);
};

// 搜索
const handleSearch = () => {
  loadTableData();
};

// 重置筛选
const resetFilter = () => {
  filterForm.groupName = '';
  filterForm.groupType = '';
  filterForm.botId = '';
  handleSearch();
};

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadTableData();
};
const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadTableData();
};

// 打开成员列表弹窗
const openMemberListDialog = (row) => {
    currentGroupForMembers.value = row;
    memberListDialogVisible.value = true;
    memberListLoading.value = true;
    setTimeout(() => {
        memberListData.value = mockMemberData[row.groupId] || [];
        memberListLoading.value = false;
    }, 500);
};

// 打开已绑定供应商列表弹窗
const openBoundSuppliersDialog = (row) => {
    currentGroupForBinding.value = row;
    boundSuppliersDialogVisible.value = true;
};

// 打开绑定供应商弹窗
const openBindSupplierDialog = (row) => {
    currentGroupForBinding.value = row;
    // 从包含完整对象的数组中提取 ID
    bindSupplierForm.supplierIds = row.boundSuppliers ? row.boundSuppliers.map(s => s.id) : [];
    bindSupplierDialogVisible.value = true;
};

// 提交供应商绑定
const submitSupplierBinding = () => {
    bindSupplierLoading.value = true;
    setTimeout(() => {
        const group = tableData.value.find(g => g.id === currentGroupForBinding.value.id);
        if (group) {
            // 根据选中的 ID 从总选项中找到完整的供应商对象
            const templates = ['熊猫', '纵横', '闪电'];
            let templateIndex = 0;
            group.boundSuppliers = supplierOptions.value
                .filter(option => bindSupplierForm.supplierIds.includes(option.id))
                .map(option => ({
                    ...option,
                    template: templates[templateIndex++ % templates.length] // 绑定时随机分配一个模板
                }));
        }
        ElMessage.success('供应商绑定成功');
        bindSupplierDialogVisible.value = false;
        bindSupplierLoading.value = false;
    }, 500);
};

onMounted(() => {
  loadTableData();
});
</script>

<style scoped>
.group-management-container {
  padding: 20px;
}
.filter-container {
  margin-bottom: 16px;
}
.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.dialog-footer {
    text-align: right;
}
</style> 