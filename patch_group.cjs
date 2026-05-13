const fs = require('fs');

let content = fs.readFileSync('src/views/bot/GroupManagement.vue', 'utf8');

// 1. Add filter
content = content.replace(
  '<el-form-item label="群组类型：">',
  `<el-form-item label="分组：">
            <el-select v-model="filterForm.groupCategory" placeholder="请选择分组" clearable style="width: 168px">
              <el-option label="全部" value="" />
              <el-option 
                v-for="category in groupCategoryOptions" 
                :key="category.id" 
                :label="category.name" 
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="群组类型：">`
);

// 2. Add buttons
content = content.replace(
  '<div class="left">\n          <el-button type="primary" @click="openDefaultRoleDialog">群组普通用户权限设置</el-button>',
  `<div class="left">
          <el-button type="primary" @click="openDefaultRoleDialog">群组普通用户权限设置</el-button>
          <el-button type="success" plain @click="openCategoryManagementDialog">分组管理</el-button>
          <el-button 
            type="warning" 
            :disabled="selectedGroups.length === 0" 
            @click="openBatchJoinDialog"
          >
            批量入群
          </el-button>`
);

// 3. Add table columns
content = content.replace(
  'style="width: 100%"\n      >',
  `style="width: 100%"\n        @selection-change="handleSelectionChange"\n      >\n        <el-table-column type="selection" width="55" align="center" />`
);

content = content.replace(
  '<el-table-column prop="groupType" label="群组类型" width="120" align="center">',
  `<el-table-column prop="categoryName" label="分组" min-width="120">
          <template #default="{ row }">
            <el-tag v-if="row.categoryName" type="info" effect="plain">{{ row.categoryName }}</el-tag>
            <span v-else class="text-secondary">未分组</span>
          </template>
        </el-table-column>
        <el-table-column prop="groupType" label="群组类型" width="120" align="center">`
);

content = content.replace(
  '<el-table-column prop="memberCount" label="群组人数" width="100" align="center">',
  `<el-table-column prop="ordinaryAccount" label="普通账号" min-width="120">
          <template #default="{ row }">
            <span>{{ row.ordinaryAccount || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pullAccount" label="拉人账号" min-width="120">
          <template #default="{ row }">
            <span>{{ row.pullAccount || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="群组人数" width="100" align="center">`
);

// 4. Add Operation column
content = content.replace(
  '<el-table-column prop="createTime" label="创建时间" min-width="180" />\n      </el-table>',
  `<el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openConfigGroupDialog(row)">配置信息</el-button>
          </template>
        </el-table-column>
      </el-table>`
);

// 5. Add Dialogs before </template> (the outer one)
const dialogs = `

    <!-- 分组管理对话框 -->
    <el-dialog
      v-model="categoryManagementDialogVisible"
      title="分组管理"
      width="500px"
      destroy-on-close
    >
      <div style="margin-bottom: 15px; display: flex; gap: 10px;">
        <el-input v-model="newCategoryName" placeholder="输入新分组名称" clearable />
        <el-button type="primary" @click="handleAddCategory">添加</el-button>
      </div>
      <el-table :data="groupCategoryOptions" border stripe max-height="300">
        <el-table-column prop="name" label="分组名称" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDeleteCategory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 批量入群对话框 -->
    <el-dialog
      v-model="batchJoinDialogVisible"
      title="批量入群"
      width="600px"
      destroy-on-close
    >
      <el-alert
        title="将调用机器人拉取指定用户进入以下选中的群组"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <div style="margin-bottom: 15px;">
        <strong>已选群组 ({{ selectedGroups.length }}个):</strong>
        <div style="margin-top: 8px; max-height: 100px; overflow-y: auto;">
          <el-tag 
            v-for="group in selectedGroups" 
            :key="group.groupId" 
            style="margin: 0 5px 5px 0"
          >
            {{ group.groupName }}
          </el-tag>
        </div>
      </div>
      <el-form ref="batchJoinFormRef" :model="batchJoinForm" label-width="100px">
        <el-form-item label="入群用户" prop="users" :rules="[{ required: true, message: '请输入要拉入群的用户ID或用户名' }]">
          <el-input 
            v-model="batchJoinForm.users" 
            type="textarea" 
            :rows="5" 
            placeholder="请输入用户的 TG ID 或用户名，多个用户请用换行或逗号隔开" 
          />
        </el-form-item>
        <el-form-item label="使用账号">
          <el-radio-group v-model="batchJoinForm.useAccountType">
            <el-radio label="pull">使用群组配置的拉人账号</el-radio>
            <el-radio label="bot">使用机器人直接拉取</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchJoinDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchJoin" :loading="batchJoinLoading">确认拉入</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 配置群组信息对话框 -->
    <el-dialog
      v-model="configGroupDialogVisible"
      title="配置群组信息"
      width="500px"
      destroy-on-close
    >
      <el-form ref="configGroupFormRef" :model="configGroupForm" label-width="100px">
        <el-form-item label="群组名称">
          <el-input v-model="configGroupForm.groupName" disabled />
        </el-form-item>
        <el-form-item label="所属分组" prop="categoryId">
          <el-select v-model="configGroupForm.categoryId" placeholder="请选择分组" clearable style="width: 100%;">
            <el-option 
              v-for="category in groupCategoryOptions" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="普通账号" prop="ordinaryAccount">
          <el-input v-model="configGroupForm.ordinaryAccount" placeholder="请输入普通账号ID或用户名" clearable />
        </el-form-item>
        <el-form-item label="拉人账号" prop="pullAccount">
          <el-input v-model="configGroupForm.pullAccount" placeholder="请输入拉人账号ID或用户名" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="configGroupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitConfigGroup">保存</el-button>
        </div>
      </template>
    </el-dialog>
`;

const lines = content.split('\n');
const templateEndIndex = lines.lastIndexOf('</template>');
lines.splice(templateEndIndex, 0, dialogs);
content = lines.join('\n');

// 6. Add JS Logic
const jsLogic = `
// ----------------- 新增逻辑：分组与入群 -----------------
const groupCategoryOptions = ref([
  { id: 1, name: '核心商户群' },
  { id: 2, name: '备用测试群' },
]);

const selectedGroups = ref([]);
const handleSelectionChange = (selection) => {
  selectedGroups.value = selection;
};

// 分组管理
const categoryManagementDialogVisible = ref(false);
const newCategoryName = ref('');
const openCategoryManagementDialog = () => {
  categoryManagementDialogVisible.value = true;
};
const handleAddCategory = () => {
  if (!newCategoryName.value.trim()) return ElMessage.warning('请输入分组名称');
  groupCategoryOptions.value.push({
    id: Date.now(),
    name: newCategoryName.value.trim()
  });
  newCategoryName.value = '';
  ElMessage.success('添加成功');
};
const handleDeleteCategory = (row) => {
  groupCategoryOptions.value = groupCategoryOptions.value.filter(c => c.id !== row.id);
  ElMessage.success('删除成功');
};

// 批量入群
const batchJoinDialogVisible = ref(false);
const batchJoinLoading = ref(false);
const batchJoinForm = reactive({
  users: '',
  useAccountType: 'pull'
});
const openBatchJoinDialog = () => {
  batchJoinForm.users = '';
  batchJoinForm.useAccountType = 'pull';
  batchJoinDialogVisible.value = true;
};
const submitBatchJoin = () => {
  if (!batchJoinForm.users.trim()) return ElMessage.warning('请输入拉入的用户');
  batchJoinLoading.value = true;
  setTimeout(() => {
    batchJoinLoading.value = false;
    batchJoinDialogVisible.value = false;
    ElMessage.success('批量入群指令已下发给机器人！');
  }, 1000);
};

// 配置群组信息 (分组, 账号)
const configGroupDialogVisible = ref(false);
const configGroupForm = reactive({
  groupId: '',
  groupName: '',
  categoryId: '',
  ordinaryAccount: '',
  pullAccount: ''
});
const openConfigGroupDialog = (row) => {
  configGroupForm.groupId = row.groupId;
  configGroupForm.groupName = row.groupName;
  configGroupForm.categoryId = row.categoryId || '';
  configGroupForm.ordinaryAccount = row.ordinaryAccount || '';
  configGroupForm.pullAccount = row.pullAccount || '';
  configGroupDialogVisible.value = true;
};
const submitConfigGroup = () => {
  const group = tableData.value.find(g => g.groupId === configGroupForm.groupId);
  if (group) {
    group.categoryId = configGroupForm.categoryId;
    const category = groupCategoryOptions.value.find(c => c.id === configGroupForm.categoryId);
    group.categoryName = category ? category.name : '';
    group.ordinaryAccount = configGroupForm.ordinaryAccount;
    group.pullAccount = configGroupForm.pullAccount;
  }
  configGroupDialogVisible.value = false;
  ElMessage.success('配置保存成功');
};
`;

content = content.replace(
  "const filterForm = reactive({",
  jsLogic + "\nconst filterForm = reactive({"
);
// Also patch filterForm to include groupCategory
content = content.replace(
  "groupName: '',",
  "groupName: '',\n  groupCategory: '',"
);

// add mock data fields
content = content.replace(
  "associatedBot: '机器人A',",
  "categoryId: 1,\n    categoryName: '核心商户群',\n    ordinaryAccount: '@test_ord',\n    pullAccount: '@test_pull',\n    associatedBot: '机器人A',"
);

fs.writeFileSync('src/views/bot/GroupManagement.vue', content);
